import supabase from './db-client.js';

/**
 * Admin API — EVERY request verifies Supabase session + role server-side.
 * Only super_admin may change privileged role/security-sensitive profile fields.
 * Explicit field allowlists — never accept unrestricted updates.
 */
const ALL_ADMIN_ROLES = ['admin', 'super_admin'];
const SUPER_ADMIN_ONLY = ['super_admin'];

// Explicit field allowlists for profile updates
const PROFILE_SELF_EDIT_FIELDS = ['full_name', 'avatar_url', 'phone', 'title', 'bio'];
const PROFILE_ADMIN_EDIT_FIELDS = ['full_name', 'avatar_url', 'phone', 'title', 'bio', 'is_active'];
const PROFILE_SUPER_ADMIN_EDIT_FIELDS = ['full_name', 'avatar_url', 'phone', 'title', 'bio', 'is_active', 'role', 'email'];

const COURSE_EDIT_FIELDS = ['title', 'subtitle', 'slug', 'description', 'level', 'duration', 'lessons_count', 'rating', 'price', 'original_price', 'currency', 'tags', 'topics', 'instructor_name', 'instructor_id', 'students_count', 'featured', 'status'];
const INTERNSHIP_EDIT_FIELDS = ['title', 'company', 'location', 'type', 'duration', 'stipend', 'description', 'requirements', 'skills', 'openings', 'deadline', 'featured', 'status'];
const INTERNSHIP_APP_EDIT_FIELDS = ['status', 'notes'];
const LESSON_EDIT_FIELDS = ['title', 'description', 'lesson_type', 'video_url', 'video_duration', 'content_body', 'sort_order', 'is_free_preview', 'is_published', 'module_id'];
const MODULE_EDIT_FIELDS = ['title', 'description', 'sort_order'];

function filterFields(data, allowedFields) {
  const filtered = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      filtered[key] = data[key];
    }
  }
  return filtered;
}

export default async function handler(req, res) {
  const allowedOrigins = [process.env.VITE_APP_ORIGIN].filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

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

    // Verify role from profiles table (server-side, cannot be spoofed)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) return res.status(403).json({ error: 'Profile not found' });
    if (!ALL_ADMIN_ROLES.includes(profile.role)) {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    const isSuperAdmin = profile.role === 'super_admin';
    const subAction = req.query.action;

    if (req.method === 'GET') {
      if (subAction === 'stats') {
        const [students, courses, enrollments, orders, internships, certs] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('internships').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
        ]);
        const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('status', 'completed');
        const totalRevenue = (revenueData || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);
        return res.status(200).json({
          students: students.count || 0, courses: courses.count || 0,
          enrollments: enrollments.count || 0, orders: orders.count || 0,
          internships: internships.count || 0, certificates: certs.count || 0,
          revenue: totalRevenue,
        });
      }

      if (subAction === 'list') {
        const targetTable = req.query.table;
        if (!targetTable) return res.status(400).json({ error: 'table query param required' });
        const allowed = ['profiles', 'courses', 'enrollments', 'orders', 'internships', 'internship_applications', 'certificates', 'lesson_progress', 'lessons', 'course_modules'];
        if (!allowed.includes(targetTable)) return res.status(400).json({ error: 'Invalid table' });
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const { data, error } = await supabase.from(targetTable).select('*').limit(limit).order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'PUT') {
      const { table, id, data: bodyData } = req.body || {};
      if (!table || !id || !bodyData) return res.status(400).json({ error: 'table, id, data required' });

      let filteredData;

      if (table === 'profiles') {
        // Role changes and email changes require super_admin
        if (bodyData.role !== undefined || bodyData.email !== undefined) {
          if (!isSuperAdmin) {
            return res.status(403).json({ error: 'Forbidden: only super_admin may change role or email fields' });
          }
          // super_admin cannot promote anyone to super_admin (prevents privilege escalation)
          if (bodyData.role === 'super_admin') {
            // Check the target user's current role — only existing super_admins stay super_admin
            const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', id).single();
            if (!targetProfile || targetProfile.role !== 'super_admin') {
              return res.status(403).json({ error: 'Forbidden: cannot promote to super_admin. Use Supabase Auth directly.' });
            }
          }
          filteredData = filterFields(bodyData, PROFILE_SUPER_ADMIN_EDIT_FIELDS);
        } else {
          filteredData = filterFields(bodyData, isSuperAdmin ? PROFILE_ADMIN_EDIT_FIELDS : PROFILE_SELF_EDIT_FIELDS);
        }
      } else if (table === 'courses') {
        filteredData = filterFields(bodyData, COURSE_EDIT_FIELDS);
      } else if (table === 'internships') {
        filteredData = filterFields(bodyData, INTERNSHIP_EDIT_FIELDS);
      } else if (table === 'internship_applications') {
        filteredData = filterFields(bodyData, INTERNSHIP_APP_EDIT_FIELDS);
      } else if (table === 'lessons') {
        filteredData = filterFields(bodyData, LESSON_EDIT_FIELDS);
      } else if (table === 'course_modules') {
        filteredData = filterFields(bodyData, MODULE_EDIT_FIELDS);
      } else {
        return res.status(400).json({ error: 'Invalid table for update' });
      }

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const { data, error } = await supabase.from(table).update(filteredData).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { table, id } = req.body || {};
      if (!table || !id) return res.status(400).json({ error: 'table and id required' });
      const allowed = ['courses', 'internships', 'lessons', 'course_modules'];
      if (!allowed.includes(table)) return res.status(400).json({ error: 'Cannot delete from this table' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
