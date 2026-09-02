-- ============================================================
-- OraclePath — Migration 002: Add columns, replace unsafe policies, indexes
-- Safe: adds columns, replaces policy, does NOT drop or alter existing data.
-- Runs AFTER 001 which already creates lessons_select_access.
-- ============================================================

-- 1. Add youtube_video_id column to lessons (YouTube integration prep)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS youtube_video_id text;

-- 2. Add razorpay_payment_id column to orders for separate Razorpay payment tracking
--    payment_intent_id = Razorpay ORDER ID (set during create-order)
--    razorpay_payment_id = Razorpay PAYMENT ID (set during verify/webhook)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

-- 3. Replace unsafe lessons_public_read policy (if it still exists from pre-001).
--    lessons_select_access is already created by 001, so we only need to
--    drop the old unsafe policy if upgrading from a pre-RLS-fix state.
DROP POLICY IF EXISTS "lessons_public_read" ON public.lessons;

-- 4. Update lessons_select_access to include is_published check on the lesson.
--    001 creates the initial version; this replaces it with the stricter version.
DROP POLICY IF EXISTS "lessons_select_access" ON public.lessons;
CREATE POLICY "lessons_select_access" ON public.lessons FOR SELECT USING (
  -- Free preview: must be published lesson + free preview + published course
  (
    is_free_preview = true
    AND is_published = true
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.status = 'published'
    )
  )
  OR
  -- Course instructor can read all lessons in their course
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = lessons.course_id AND c.instructor_id = auth.uid()
  )
  OR
  -- Admins and managers can read all lessons
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin', 'manager')
  )
  OR
  -- Enrolled students can read lessons in their enrolled courses
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = lessons.course_id
      AND e.status IN ('active', 'completed')
  )
);

-- 5. Update courses public read policy to canonical 'published' only
DROP POLICY IF EXISTS "courses_public_read" ON public.courses;
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT USING (status = 'published');

-- 6. Index for order lookup by Razorpay order ID (payment_intent_id)
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders(payment_intent_id);

-- 7. Index for order lookup by Razorpay payment ID (razorpay_payment_id)
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);

-- 8. Index for order_items by order_id (used by finalize.js)
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 9. Index for enrollments lookup (used by payment flow)
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
