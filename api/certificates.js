import supabase from './db-client.js';

export default async function handler(req, res) {
  const allowedOrigins = [process.env.VITE_APP_ORIGIN].filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

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

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, courses(title)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { course_id } = req.body;
      if (!course_id) return res.status(400).json({ error: 'course_id required' });

      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .eq('status', 'completed')
        .single();
      if (!enrollment) return res.status(400).json({ error: 'Course not completed' });

      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .single();
      if (existing) return res.status(409).json({ error: 'Certificate already issued' });

      const { count } = await supabase.from('certificates').select('*', { count: 'exact', head: true });
      const certNum = `OP-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(5, '0')}`;

      const { data: cert, error: certError } = await supabase
        .from('certificates')
        .insert({ user_id: user.id, course_id, certificate_number: certNum, status: 'active' })
        .select()
        .single();
      if (certError) throw certError;
      return res.status(201).json(cert);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Certificates API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
