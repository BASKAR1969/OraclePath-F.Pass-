import supabase from './db-client.js';

/**
 * /api/courses — CRUD for courses, modules, lessons
 *
 * Authorization:
 * - Admin/super_admin: full access to all courses
 * - Instructor: can only modify courses where they are the instructor_id.
 *   Browser-supplied instructor_id is NEVER trusted for instructors —
 *   it is always overridden to the authenticated user's ID.
 * - Public: read published courses only
 *
 * Course status: draft | published | archived
 * Lesson types: video | text | quiz | sql_lab | assignment
 *
 * Field allowlists prevent injection of unauthorized fields.
 */

const COURSE_FIELDS = ['title', 'subtitle', 'slug', 'description', 'level', 'duration', 'lessons_count', 'rating', 'price', 'original_price', 'currency', 'tags', 'topics', 'instructor_name', 'instructor_id', 'students_count', 'featured', 'status'];
const MODULE_FIELDS = ['title', 'description', 'sort_order', 'course_id'];
const LESSON_FIELDS = ['title', 'description', 'lesson_type', 'video_url', 'video_duration', 'content_body', 'sort_order', 'is_free_preview', 'is_published', 'course_id', 'module_id', 'youtube_video_id'];

const VALID_COURSE_STATUSES = ['draft', 'published', 'archived'];
const VALID_LESSON_TYPES = ['video', 'text', 'quiz', 'sql_lab', 'assignment'];

function filterFields(data, allowed) {
  const f = {};
  for (const k of allowed) { if (data[k] !== undefined) f[k] = data[k]; }
  return f;
}

async function verifyAdminOrInstructor(token) {
  if (!token) return { error: 'Unauthorized' };
  const { createClient } = await import('@supabase/supabase-js');
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: { user }, error: authError } = await userClient.auth.getUser(token);
  if (authError || !user) return { error: 'Invalid token' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'super_admin', 'instructor'].includes(profile.role)) {
    return { error: 'Forbidden: admin or instructor role required' };
  }
  return { user, role: profile.role, userId: user.id };
}

/**
 * Check if an instructor is authorized to manage a specific course.
 * Admins/super_admins can manage any course.
 * Instructors can only manage courses where they are the instructor_id.
 */
async function canManageCourse(auth, courseId) {
  if (auth.role === 'admin' || auth.role === 'super_admin') return true;
  const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single();
  if (!course) return false;
  return course.instructor_id === auth.userId;
}

export default async function handler(req, res) {
  const allowedOrigins = [process.env.VITE_APP_ORIGIN].filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { target } = req.query;

    // ── GET ──
    if (req.method === 'GET') {
      if (target === 'course' || !target) {
        const courseId = req.query.id;
        if (courseId) {
          const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
          if (error) throw error;
          return res.status(200).json(data);
        }
        const auth = token ? await verifyAdminOrInstructor(token).catch(() => null) : null;
        let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (!auth || auth.error) {
          // Public: only published courses
          query = query.eq('status', 'published');
        } else if (auth.role === 'instructor') {
          // Instructor: own courses + published
          query = query.or(`instructor_id.eq.${auth.userId},status.eq.published`);
        }
        // Admin/super_admin: all courses
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (target === 'module') {
        const courseId = req.query.course_id;
        if (!courseId) return res.status(400).json({ error: 'course_id required' });
        const { data, error } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('sort_order', { ascending: true });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (target === 'lesson') {
        const courseId = req.query.course_id;
        const moduleId = req.query.module_id;
        let query = supabase.from('lessons').select('*');
        if (courseId) query = query.eq('course_id', courseId);
        if (moduleId) query = query.eq('module_id', moduleId);
        query = query.order('sort_order', { ascending: true });
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: 'Invalid target. Use course, module, or lesson.' });
    }

    // All mutations require auth
    const auth = await verifyAdminOrInstructor(token);
    if (auth.error) return res.status(auth.error.startsWith('Forbidden') ? 403 : 401).json({ error: auth.error });

    // ── POST ──
    if (req.method === 'POST') {
      if (target === 'course') {
        const filtered = filterFields(req.body, COURSE_FIELDS);
        if (!filtered.title || !filtered.slug) return res.status(400).json({ error: 'title and slug required' });
        if (!filtered.instructor_name) filtered.instructor_name = 'Oracle Expert';
        if (!filtered.status) filtered.status = 'draft';
        // Validate status
        if (!VALID_COURSE_STATUSES.includes(filtered.status)) {
          return res.status(400).json({ error: `Invalid status. Must be: ${VALID_COURSE_STATUSES.join(', ')}` });
        }
        // CRITICAL: For instructors, ALWAYS override instructor_id to their own ID.
        // Never trust browser-supplied instructor_id for instructor role.
        if (auth.role === 'instructor') {
          filtered.instructor_id = auth.userId;
        }
        const { data, error } = await supabase.from('courses').insert(filtered).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (target === 'module') {
        const filtered = filterFields(req.body, MODULE_FIELDS);
        if (!filtered.title || !filtered.course_id) return res.status(400).json({ error: 'title and course_id required' });
        if (!await canManageCourse(auth, filtered.course_id)) {
          return res.status(403).json({ error: 'Not authorized to modify this course' });
        }
        const { data, error } = await supabase.from('course_modules').insert(filtered).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (target === 'lesson') {
        const filtered = filterFields(req.body, LESSON_FIELDS);
        if (!filtered.title || !filtered.course_id) return res.status(400).json({ error: 'title and course_id required' });
        if (filtered.lesson_type && !VALID_LESSON_TYPES.includes(filtered.lesson_type)) {
          return res.status(400).json({ error: `Invalid lesson_type. Must be: ${VALID_LESSON_TYPES.join(', ')}` });
        }
        if (!await canManageCourse(auth, filtered.course_id)) {
          return res.status(403).json({ error: 'Not authorized to modify this course' });
        }
        const { data, error } = await supabase.from('lessons').insert(filtered).select().single();
        if (error) throw error;
        const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', filtered.course_id);
        await supabase.from('courses').update({ lessons_count: count || 0 }).eq('id', filtered.course_id);
        return res.status(201).json(data);
      }
      return res.status(400).json({ error: 'Invalid target' });
    }

    // ── PUT ──
    if (req.method === 'PUT') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });

      if (target === 'course') {
        if (!await canManageCourse(auth, id)) {
          return res.status(403).json({ error: 'Not authorized to modify this course' });
        }
        const filtered = filterFields(req.body, COURSE_FIELDS);
        delete filtered.id;
        if (filtered.status && !VALID_COURSE_STATUSES.includes(filtered.status)) {
          return res.status(400).json({ error: `Invalid status. Must be: ${VALID_COURSE_STATUSES.join(', ')}` });
        }
        // CRITICAL: Instructors can NEVER change instructor_id, even to themselves.
        // Remove it entirely from the update payload for instructors.
        if (auth.role === 'instructor') {
          delete filtered.instructor_id;
        }
        if (Object.keys(filtered).length === 0) return res.status(400).json({ error: 'No valid fields' });
        const { data, error } = await supabase.from('courses').update(filtered).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (target === 'module') {
        const filtered = filterFields(req.body, MODULE_FIELDS);
        delete filtered.id; delete filtered.course_id;
        if (Object.keys(filtered).length === 0) return res.status(400).json({ error: 'No valid fields' });
        const { data: mod } = await supabase.from('course_modules').select('course_id').eq('id', id).single();
        if (mod && !await canManageCourse(auth, mod.course_id)) {
          return res.status(403).json({ error: 'Not authorized to modify this course' });
        }
        const { data, error } = await supabase.from('course_modules').update(filtered).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (target === 'lesson') {
        const filtered = filterFields(req.body, LESSON_FIELDS);
        delete filtered.id; delete filtered.course_id;
        if (filtered.lesson_type && !VALID_LESSON_TYPES.includes(filtered.lesson_type)) {
          return res.status(400).json({ error: `Invalid lesson_type. Must be: ${VALID_LESSON_TYPES.join(', ')}` });
        }
        if (Object.keys(filtered).length === 0) return res.status(400).json({ error: 'No valid fields' });
        const { data: lesson } = await supabase.from('lessons').select('course_id').eq('id', id).single();
        if (lesson && !await canManageCourse(auth, lesson.course_id)) {
          return res.status(403).json({ error: 'Not authorized to modify this course' });
        }
        const { data, error } = await supabase.from('lessons').update(filtered).eq('id', id).select().single();
        if (error) throw error;
        if (lesson) {
          const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', lesson.course_id);
          await supabase.from('courses').update({ lessons_count: count || 0 }).eq('id', lesson.course_id);
        }
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: 'Invalid target' });
    }

    // ── DELETE ──
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });

      if (target === 'course') {
        if (!await canManageCourse(auth, id)) {
          return res.status(403).json({ error: 'Not authorized to delete this course' });
        }
        if (auth.role === 'instructor') {
          return res.status(403).json({ error: 'Instructors can only archive courses, not delete them' });
        }
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      if (target === 'module') {
        const { data: mod } = await supabase.from('course_modules').select('course_id').eq('id', id).single();
        if (mod && !await canManageCourse(auth, mod.course_id)) {
          return res.status(403).json({ error: 'Not authorized' });
        }
        const { error } = await supabase.from('course_modules').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      if (target === 'lesson') {
        const { data: lesson } = await supabase.from('lessons').select('course_id').eq('id', id).single();
        if (lesson && !await canManageCourse(auth, lesson.course_id)) {
          return res.status(403).json({ error: 'Not authorized' });
        }
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        if (lesson) {
          const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', lesson.course_id);
          await supabase.from('courses').update({ lessons_count: count || 0 }).eq('id', lesson.course_id);
        }
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: 'Invalid target' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Courses API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
