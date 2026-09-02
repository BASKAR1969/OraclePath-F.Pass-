-- ============================================================
-- OraclePath — Migration 003: Atomic payment finalization RPC
-- Safe: creates function + privileges only. No data or policy changes.
-- Lesson RLS is handled by 002 (which supersedes 001's version).
-- ============================================================

-- 1. PostgreSQL RPC function for atomic, concurrency-safe payment finalization.
--    Both /api/payments/verify and /api/webhooks call this via supabase.rpc().
--    The function runs in a single transaction with row-level locking,
--    eliminating the race between order update and enrollment insert.
--
--    Handles the "completed order with missing enrollment" repair case:
--    If an order is already completed but enrollment is missing (e.g., due to
--    a prior partial failure), the function creates the enrollment transactionally
--    rather than returning ok=true with null enrollment_id.
--
--    SECURITY:
--    - EXECUTE is restricted to the server-side service role only.
--    - Ownership check (p_user_id) occurs BEFORE any status handling,
--      including the completed-order/idempotency/repair branch.
--
--    Execution order:
--      1. Lock and load order (SELECT ... FOR UPDATE)
--      2. Derive course_id from order_items
--      3. Verify user ownership (if p_user_id provided)  ← BEFORE status check
--      4. Handle completed/idempotent order (including repair)
--      5. Reject terminal states
--      6. Verify course is published
--      7. Update order to completed
--      8. Insert enrollment (ON CONFLICT DO NOTHING)
--      9. Return success
CREATE OR REPLACE FUNCTION public.finalize_payment_rpc(
  p_order_id              uuid,
  p_razorpay_payment_id   text,
  p_user_id               uuid   -- NULL for webhook flow
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order          RECORD;
  v_course_id      uuid;
  v_course_status  text;
  v_enrollment_id  uuid;
BEGIN
  -- ── Step 1: Lock and load the order row ──
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found');
  END IF;

  -- ── Step 2: Derive course_id from order_items (trusted source) ──
  SELECT course_id INTO v_course_id
  FROM public.order_items
  WHERE order_id = p_order_id
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No course associated with order');
  END IF;

  -- ── Step 3: Verify user ownership BEFORE any status handling ──
  -- When p_user_id is provided (verify flow), this check gates ALL subsequent
  -- logic including the completed-order idempotency and repair paths.
  -- When p_user_id is NULL (webhook flow), this check is skipped.
  IF p_user_id IS NOT NULL AND v_order.user_id != p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order does not belong to authenticated user');
  END IF;

  -- ── Step 4: Idempotency — already completed ──
  IF v_order.status = 'completed' THEN
    -- Check if enrollment exists
    SELECT id INTO v_enrollment_id
    FROM public.enrollments
    WHERE user_id = v_order.user_id AND course_id = v_course_id
    LIMIT 1;

    -- REPAIR: If order is completed but enrollment is missing, create it now.
    -- This handles the case where a prior finalization marked the order completed
    -- but the enrollment insert failed (e.g., transient DB error).
    -- We hold the FOR UPDATE lock, so this is concurrency-safe.
    IF v_enrollment_id IS NULL THEN
      -- Verify course still exists and is published before creating enrollment
      SELECT status INTO v_course_status
      FROM public.courses
      WHERE id = v_course_id;

      IF v_course_status IS NULL OR v_course_status != 'published' THEN
        RETURN jsonb_build_object(
          'ok', false,
          'error', 'Completed order has missing enrollment and course is no longer published',
          'repair_needed', true
        );
      END IF;

      -- Create the missing enrollment (ON CONFLICT for concurrent safety)
      INSERT INTO public.enrollments (user_id, course_id, status, progress_pct)
      VALUES (v_order.user_id, v_course_id, 'active', 0)
      ON CONFLICT (user_id, course_id) DO NOTHING
      RETURNING id INTO v_enrollment_id;

      -- If ON CONFLICT did nothing, fetch the existing enrollment
      IF v_enrollment_id IS NULL THEN
        SELECT id INTO v_enrollment_id
        FROM public.enrollments
        WHERE user_id = v_order.user_id AND course_id = v_course_id
        LIMIT 1;
      END IF;

      -- Final safety net: if enrollment_id is STILL null, the repair failed.
      -- Never return ok=true with null enrollment_id for a completed order.
      IF v_enrollment_id IS NULL THEN
        RETURN jsonb_build_object(
          'ok', false,
          'error', 'Failed to create or find enrollment for completed order',
          'repair_needed', true
        );
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'order_status', 'completed',
      'course_id', v_course_id,
      'enrollment_id', v_enrollment_id
    );
  END IF;

  -- ── Step 5: Reject terminal states ──
  IF v_order.status IN ('failed', 'cancelled', 'refunded') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order is ' || v_order.status || ', cannot finalize');
  END IF;

  -- ── Step 6: Verify course is published ──
  SELECT status INTO v_course_status
  FROM public.courses
  WHERE id = v_course_id;

  IF v_course_status IS NULL OR v_course_status != 'published' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Associated course is not available');
  END IF;

  -- ── Step 7: Update order to completed (holds the FOR UPDATE lock) ──
  UPDATE public.orders
  SET status = 'completed',
      payment_method = 'Razorpay',
      razorpay_payment_id = COALESCE(p_razorpay_payment_id, orders.razorpay_payment_id)
  WHERE id = p_order_id;

  -- ── Step 8: Insert enrollment if not exists (atomic within same transaction) ──
  INSERT INTO public.enrollments (user_id, course_id, status, progress_pct)
  VALUES (v_order.user_id, v_course_id, 'active', 0)
  ON CONFLICT (user_id, course_id) DO NOTHING
  RETURNING id INTO v_enrollment_id;

  IF v_enrollment_id IS NULL THEN
    SELECT id INTO v_enrollment_id
    FROM public.enrollments
    WHERE user_id = v_order.user_id AND course_id = v_course_id
    LIMIT 1;
  END IF;

  -- ── Step 9: Return success ──
  RETURN jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'order_status', 'completed',
    'course_id', v_course_id,
    'enrollment_id', v_enrollment_id
  );
END;
$$;

-- 2. Lock down function privileges.
--    By default, PostgreSQL grants EXECUTE on functions to PUBLIC,
--    which includes anon + authenticated roles.
--    This function MUST only be callable by the server-side service role
--    used by api/db-client.js (which authenticates via SUPABASE_SERVICE_ROLE_KEY).
--
--    In Supabase's architecture, the service_role key JWT contains
--    role="supabase_service_role". PostgREST does SET LOCAL ROLE to this
--    value before calling the function. Some Supabase configurations use
--    "service_role" instead. We handle both with a conditional grant.
REVOKE EXECUTE ON FUNCTION public.finalize_payment_rpc(uuid, text, uuid) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'supabase_service_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.finalize_payment_rpc(uuid, text, uuid) TO supabase_service_role';
    RAISE NOTICE 'Granted EXECUTE on finalize_payment_rpc to supabase_service_role';
  ELSIF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.finalize_payment_rpc(uuid, text, uuid) TO service_role';
    RAISE NOTICE 'Granted EXECUTE on finalize_payment_rpc to service_role';
  ELSE
    RAISE WARNING 'No service role found for finalize_payment_rpc EXECUTE grant. Manual GRANT required after migration.';
  END IF;
END;
$$;

-- 3. Add index for RPC order lookup performance
CREATE INDEX IF NOT EXISTS idx_orders_id_status ON public.orders(id, status);
