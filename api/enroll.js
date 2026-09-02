import supabase from './db-client.js';

/**
 * POST /api/enroll — Free enrollment only (price = 0).
 * Paid enrollment MUST go through /api/payments/create-order → Razorpay → /api/payments/verify.
 * This endpoint will NOT activate enrollment for paid courses.
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
    if (!token) return res.status(401).json({ error: 'Unauthorized: token required' });

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

    // Read authoritative course price server-side
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, status')
      .eq('id', course_id)
      .single();
    if (courseError || !course) return res.status(404).json({ error: 'Course not found' });
    if (course.status !== 'published') {
      return res.status(400).json({ error: 'Course not available for enrollment' });
    }

    // Paid courses MUST use Razorpay flow
    const coursePrice = parseFloat(course.price) || 0;
    if (coursePrice > 0) {
      return res.status(400).json({
        error: 'Paid courses require payment verification. Use /api/payments/create-order.',
        requires_payment: true,
      });
    }

    // Free course — check not already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single();
    if (existing) return res.status(409).json({ error: 'Already enrolled' });

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({ user_id: user.id, course_id, status: 'active', progress_pct: 0 })
      .select()
      .single();
    if (enrollError) throw enrollError;

    // Create order + order_item for audit trail
    const orderNumber = 'OP-' + Date.now().toString(36).toUpperCase();
    const { data: freeOrder } = await supabase.from('orders').insert({
      user_id: user.id,
      order_number: orderNumber,
      status: 'completed',
      total_amount: 0,
      currency: 'USD',
      payment_method: 'Free',
      payment_provider: 'none',
    }).select().single();
    if (freeOrder) {
      await supabase.from('order_items').insert({
        order_id: freeOrder.id,
        course_id,
        course_title: course.title || '',
        unit_price: 0,
        quantity: 1,
        line_total: 0,
      });
    }

    return res.status(201).json({ enrollment });
  } catch (err) {
    console.error('Enroll API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
