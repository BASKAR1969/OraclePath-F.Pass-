import supabase from './db-client.js';
import crypto from 'crypto';
import { finalizePayment, markOrderFailed } from './finalize.js';

/**
 * POST /api/webhooks — Razorpay webhook handler
 *
 * FAILS CLOSED: If RAZORPAY_WEBHOOK_SECRET is not configured, rejects all webhooks.
 * Verifies webhook signature before processing.
 * Uses shared finalizePayment() for payment completion.
 * Idempotent: re-processing a completed event is a no-op.
 *
 * CRITICAL: For payment.captured and order.paid events, if OraclePath
 * finalization fails, we return HTTP 500 so Razorpay retries the webhook.
 * We only return 200 when finalization actually succeeds or is idempotent.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // FAIL CLOSED: No secret = no processing
    if (!razorpayWebhookSecret) {
      console.error('[webhooks] RAZORPAY_WEBHOOK_SECRET not configured — rejecting (fail closed)');
      return res.status(503).json({ error: 'Webhook processing unavailable' });
    }

    // Verify webhook signature — ALWAYS
    const webhookSignature = req.headers['x-razorpay-signature'];
    if (!webhookSignature) {
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.warn('[webhooks] Invalid Razorpay webhook signature — rejected');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity || {};
    const orderEntity = req.body.payload?.order?.entity || {};

    // payment.captured — payment succeeded
    if (event === 'payment.captured') {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      if (!razorpayOrderId) return res.status(400).json({ error: 'Missing order_id' });

      // Find internal order by Razorpay order ID
      const { data: order } = await supabase
        .from('orders')
        .select('id, status')
        .eq('payment_intent_id', razorpayOrderId)
        .single();

      if (!order) {
        // Order not found in our system — return 500 so Razorpay retries
        console.error('[webhooks] payment.captured: Order not found for Razorpay order', razorpayOrderId);
        return res.status(500).json({ error: 'Order not found — will retry' });
      }

      // Use shared finalization (no userId — webhook has no auth context).
      // Always call finalizePayment, even for completed orders, so the RPC
      // can repair a completed order with a missing enrollment.
      // Webhook passes p_user_id = NULL so ownership check is skipped.
      const result = await finalizePayment(order.id, razorpayPaymentId, null);
      if (!result.ok) {
        // CRITICAL: Finalization failed. Return HTTP 500 so Razorpay retries.
        // This ensures a captured payment does NOT get acknowledged without enrollment.
        console.error('[webhooks] payment.captured: Finalization FAILED for order', order.id, result.error, '— returning 500 for Razorpay retry');
        return res.status(500).json({ error: 'Finalization failed — will retry' });
      }

      return res.status(200).json({ processed: true, idempotent: order.status === 'completed' });
    }

    // payment.failed
    if (event === 'payment.failed') {
      const razorpayOrderId = paymentEntity.order_id;
      if (!razorpayOrderId) return res.status(400).json({ error: 'Missing order_id' });

      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', razorpayOrderId)
        .single();

      if (order) await markOrderFailed(order.id);
      return res.status(200).json({ processed: true });
    }

    // order.paid — Razorpay confirms order paid
    if (event === 'order.paid') {
      const razorpayOrderId = orderEntity.id;
      const razorpayPaymentId = paymentEntity?.id || null;
      if (!razorpayOrderId) return res.status(200).json({ received: true });

      const { data: order } = await supabase
        .from('orders')
        .select('id, status')
        .eq('payment_intent_id', razorpayOrderId)
        .single();

      if (!order) {
        console.error('[webhooks] order.paid: Order not found for Razorpay order', razorpayOrderId);
        return res.status(500).json({ error: 'Order not found — will retry' });
      }

      // Always call finalizePayment, even for completed orders, so the RPC
      // can repair a completed order with a missing enrollment.
      const result = await finalizePayment(order.id, razorpayPaymentId, null);
      if (!result.ok) {
        // CRITICAL: Finalization failed. Return 500 for retry.
        console.error('[webhooks] order.paid: Finalization FAILED for order', order.id, result.error, '— returning 500 for Razorpay retry');
        return res.status(500).json({ error: 'Finalization failed — will retry' });
      }

      return res.status(200).json({ processed: true, idempotent: order.status === 'completed' });
    }

    // refund.processed
    if (event === 'refund.processed') {
      const razorpayPaymentId = paymentEntity.id;
      if (!razorpayPaymentId) return res.status(200).json({ received: true });

      // Find order by Razorpay PAYMENT ID (razorpay_payment_id column),
      // NOT by payment_intent_id (which holds the Razorpay ORDER ID).
      const { data: order } = await supabase
        .from('orders')
        .select('id, status')
        .eq('razorpay_payment_id', razorpayPaymentId)
        .single();

      // Idempotent: if already refunded, no-op
      if (order && order.status === 'completed') {
        await supabase.from('orders').update({ status: 'refunded' }).eq('id', order.id);
      }

      return res.status(200).json({ processed: true });
    }

    // Acknowledge all other events
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Return 500 on unexpected errors so Razorpay retries
    return res.status(500).json({ error: err.message });
  }
}
