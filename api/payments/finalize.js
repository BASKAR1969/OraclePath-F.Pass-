import supabase from './db-client.js';

/**
 * Shared payment finalization logic.
 * Used by both /api/payments/verify and /api/webhooks.
 *
 * Uses the PostgreSQL RPC function `finalize_payment_rpc` for
 * CONCURRENCY-SAFE, ATOMIC finalization. The RPC runs in a single
 * transaction with SELECT ... FOR UPDATE row-level locking on the
 * order row, eliminating the race between:
 *   - order status update
 *   - enrollment existence check
 *   - enrollment insert
 *
 * Invariants:
 * - Idempotent: re-processing a completed order returns existing enrollment.
 * - Enrollment is ONLY created after verified payment.
 * - course_id is ALWAYS derived from the internal order_items record,
 *   never from the caller's untrusted input.
 * - Failed/cancelled/invalid payments never activate enrollment.
 * - Duplicate enrollment is prevented by ON CONFLICT DO NOTHING.
 * - Razorpay payment ID is persisted SEPARATELY from the Razorpay order ID.
 * - A successful verified payment MUST NOT leave a completed order + missing enrollment.
 *
 * @param {string} orderId - Internal DB order ID
 * @param {string|null} razorpayPaymentId - Razorpay payment ID to persist separately
 * @param {string|null} userId - Authenticated user ID (from verify flow). Null for webhook flow.
 * @returns {Promise<{ok: boolean, enrollment?: object, order?: object, error?: string, idempotent?: boolean}>}
 */
export async function finalizePayment(orderId, razorpayPaymentId, userId) {
  // ── Call atomic PostgreSQL RPC ──
  // This function runs in a single transaction with row-level locking,
  // ensuring no concurrent call can create duplicate enrollments or
  // leave a completed order without an enrollment.
  const { data: rpcResult, error: rpcError } = await supabase.rpc('finalize_payment_rpc', {
    p_order_id: orderId,
    p_razorpay_payment_id: razorpayPaymentId || null,
    p_user_id: userId || null,
  });

  if (rpcError) {
    console.error('[finalize] RPC error:', rpcError);
    return { ok: false, error: rpcError.message || 'Finalization RPC failed' };
  }

  if (!rpcResult) {
    return { ok: false, error: 'Finalization returned no result' };
  }

  // ── Handle RPC result ──
  if (!rpcResult.ok) {
    return { ok: false, error: rpcResult.error || 'Finalization failed' };
  }

  // ── Fetch the full order and enrollment for the response ──
  const [orderRes, enrollmentRes] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).single(),
    rpcResult.enrollment_id
      ? supabase.from('enrollments').select('*').eq('id', rpcResult.enrollment_id).single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    ok: true,
    enrollment: enrollmentRes.data || null,
    order: orderRes.data || null,
    idempotent: rpcResult.idempotent || false,
  };
}

/**
 * Mark an order as failed (idempotent — won't change a completed order).
 */
export async function markOrderFailed(orderId) {
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();
  if (!order) return;
  if (order.status === 'completed') return; // Don't downgrade a completed order
  await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
}
