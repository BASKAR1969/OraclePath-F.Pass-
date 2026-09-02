import supabase from './db-client.js';

/**
 * POST /api/payments/create-order
 *
 * Creates a Razorpay order server-side. Reads authoritative course price from DB.
 * NEVER trusts price from the browser.
 *
 * CRITICAL: Creates the internal order AND order_items BEFORE returning
 * Razorpay checkout info. This ensures the course relationship is bound
 * to the order server-side, so the browser can never change it later.
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

    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id required' });

    // Check not already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single();
    if (existing) return res.status(409).json({ error: 'Already enrolled' });

    // Read authoritative course price from database — NEVER trust client amount
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, currency, status')
      .eq('id', course_id)
      .single();
    if (courseError || !course) return res.status(404).json({ error: 'Course not found' });
    if (course.status !== 'published') {
      return res.status(400).json({ error: 'Course not available for enrollment' });
    }

    const coursePrice = parseFloat(course.price) || 0;

    // Free course — no payment needed, direct enrollment
    if (coursePrice <= 0) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id, status: 'active', progress_pct: 0 })
        .select()
        .single();
      // Create order + order_item for free courses too (audit trail)
      const orderNumber = 'OP-' + Date.now().toString(36).toUpperCase();
      const { data: freeOrder } = await supabase.from('orders').insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'completed',
        total_amount: 0,
        currency: course.currency || 'USD',
        payment_method: 'Free',
        payment_provider: 'none',
      }).select().single();
      if (freeOrder) {
        await supabase.from('order_items').insert({
          order_id: freeOrder.id,
          course_id,
          course_title: course.title,
          unit_price: 0,
          quantity: 1,
          line_total: 0,
        });
      }
      return res.status(200).json({ requires_payment: false, enrollment });
    }

    // Razorpay credentials
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('[payments] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured');
      return res.status(503).json({
        error: 'Payment system is not configured. Please contact support.',
        code: 'PAYMENT_NOT_CONFIGURED',
      });
    }

    const amountInPaise = Math.round(coursePrice * 100);
    const currency = (course.currency || 'INR').toUpperCase();
    const receipt = 'OP-' + Date.now().toString(36).toUpperCase();

    // ── STEP 1: Create internal order record ──
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: receipt,
        status: 'pending',
        total_amount: coursePrice,
        currency,
        payment_provider: 'razorpay',
      })
      .select()
      .single();
    if (orderError) throw orderError;

    // ── STEP 2: Create order_item IMMEDIATELY (binds course to order server-side) ──
    // This is the TRUSTED course relationship. The browser cannot change this.
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      course_id,
      course_title: course.title,
      unit_price: coursePrice,
      quantity: 1,
      line_total: coursePrice,
    });
    if (itemError) {
      console.error('[payments] Failed to create order_item:', itemError);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return res.status(500).json({ error: 'Failed to create order item' });
    }

    // ── STEP 3: Create Razorpay order via REST API ──
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(razorpayKeyId + ':' + razorpayKeySecret).toString('base64'),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          course_id,
          user_id: user.id,
          order_db_id: order.id,
        },
      }),
    });

    const razorpayData = await razorpayRes.json();
    if (!razorpayRes.ok) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      console.error('[payments] Razorpay order creation failed:', razorpayData);
      return res.status(502).json({ error: 'Failed to create payment order. Please try again.' });
    }

    // ── STEP 4: Store Razorpay order ID on our order record ──
    await supabase
      .from('orders')
      .update({ payment_intent_id: razorpayData.id })
      .eq('id', order.id);

    // ── STEP 5: Return checkout info to browser ──
    // The browser receives the Razorpay order ID but CANNOT change the
    // course relationship — it's already bound in order_items.
    return res.status(200).json({
      requires_payment: true,
      razorpay_order_id: razorpayData.id,
      razorpay_key_id: razorpayKeyId,
      amount: amountInPaise,
      currency,
      course_title: course.title,
    });
  } catch (err) {
    console.error('Create order API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
