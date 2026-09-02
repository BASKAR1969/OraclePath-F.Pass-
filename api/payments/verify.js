import supabase from './db-client.js';
import crypto from 'crypto';
import { finalizePayment, markOrderFailed } from './finalize.js';

/**
 * POST /api/payments/verify
 *
 * Verifies Razorpay payment signature server-side.
 * Only activates enrollment AFTER verified payment via shared finalizePayment().
 * Idempotent: re-verification returns existing enrollment.
 *
 * CRITICAL SECURITY:
 * - Ownership is verified BEFORE any completed-order/idempotency handling.
 * - course_id is derived EXCLUSIVELY from the internal order/order_items record.
 * - The browser request body is NOT trusted for course identity.
 *   No req.body.course_id is read or used at any point.
 * - Razorpay signature is verified with HMAC-SHA256.
 * - Razorpay payment ID is persisted separately from the Razorpay order ID.
 *
 * Execution order:
 *   1. Authenticate user
 *   2. Load internal order by Razorpay order ID
 *   3. Verify order.user_id === authenticated user.id  ← BEFORE any status handling
 *   4. Handle completed/idempotent order (including repair)
 *   5. Verify Razorpay signature
 *   6. Finalize payment
 */
export default async function handler(req, res) {
  const allowedOrigins = [process.env.VITE_APP_ORIGIN].filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { createClient } = await import('@supabase/supabase-js');
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    // Only Razorpay identifiers are accepted from the browser.
    // course_id is NEVER read from req.body.
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    // Find the internal order by Razorpay order ID — this is the trusted anchor
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_intent_id', razorpay_order_id)
      .single();
    if (orderError || !order) return res.status(404).json({ error: 'Order not found' });

    // ── OWNERSHIP CHECK: BEFORE any status/idempotency handling ──
    // This prevents one authenticated user from accessing another user's order,
    // even if the order is already completed.
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Order does not belong to authenticated user' });
    }

    // ── Idempotency: already completed — return existing result via finalize ──
    // finalizePayment (via RPC) handles the repair case if enrollment is missing.
    if (order.status === 'completed') {
      const result = await finalizePayment(order.id, razorpay_payment_id, user.id);
      if (!result.ok) {
        // Finalization failed even for completed order (e.g., enrollment repair failed).
        // Do NOT return verified=true when finalization actually failed.
        return res.status(500).json({ error: result.error || 'Finalization failed for completed order' });
      }
      return res.status(200).json({ verified: true, enrollment: result.enrollment, idempotent: true });
    }

    // Verify Razorpay signature — MUST have secret configured
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      console.error('[payments/verify] RAZORPAY_KEY_SECRET not configured — cannot verify');
      return res.status(503).json({ error: 'Payment verification unavailable. Contact support.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — mark failed, do NOT activate enrollment
      await markOrderFailed(order.id);
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Signature verified — finalize payment via shared function.
    // finalizePayment derives course_id from order_items internally.
    // razorpay_payment_id is persisted in its own column.
    const result = await finalizePayment(order.id, razorpay_payment_id, user.id);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({
      verified: true,
      enrollment: result.enrollment,
      order: result.order,
      idempotent: result.idempotent || false,
    });
  } catch (err) {
    console.error('Verify payment API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
