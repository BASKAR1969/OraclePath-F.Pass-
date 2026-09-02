import supabase from './db-client.js';

/**
 * /api/lessons — Lesson content access with enrollment security
 *
 * GET /api/lessons?id=<lesson_id>
 *   - Free preview lessons: accessible to everyone
 *   - Non-preview lessons: only accessible to enrolled users or admin/instructor
 *   - Returns full lesson content only if authorized; otherwise returns metadata only
 *
 * This prevents unauthorized users from accessing paid lesson content.
 */
export default async function handler(req, res) {
  const allowedOrigins = [process.env.VITE_APP_ORIGIN].filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const lessonId = req.query.id;
    if (!lessonId) return res.status(400).json({ error: 'lesson id required' });

    // Fetch lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
    if (lessonError || !lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Check if course is published
    const { data: course } = await supabase
      .from('courses')
      .select('id, status, instructor_id')
      .eq('id', lesson.course_id)
      .single();

    if (!course || course.status !== 'published') {
      return res.status(404).json({ error: 'Course not available' });
    }

    // Free preview lessons are accessible to everyone
    if (lesson.is_free_preview) {
      return res.status(200).json(lesson);
    }

    // Non-preview: check authorization
    const token = req.headers.authorization?.replace('Bearer ', '');

    // No token — return metadata only (no content_body, no video_url)
    if (!token) {
      return res.status(200).json({
        ...lesson,
        content_body: null,
        video_url: null,
        youtube_video_id: null,
        _access: 'metadata_only',
      });
    }

    // Verify user session
    const { createClient } = await import('@supabase/supabase-js');
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return res.status(200).json({
        ...lesson,
        content_body: null,
        video_url: null,
        youtube_video_id: null,
        _access: 'metadata_only',
      });
    }

    // Check if user is admin/instructor for this course
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile && ['admin', 'super_admin', 'manager'].includes(profile.role);
    const isInstructor = profile?.role === 'instructor' && course.instructor_id === user.id;

    if (isAdmin || isInstructor) {
      return res.status(200).json({ ...lesson, _access: 'full' });
    }

    // Check enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)
      .eq('status', 'active')
      .single();

    if (enrollment) {
      return res.status(200).json({ ...lesson, _access: 'enrolled' });
    }

    // Not enrolled — return metadata only
    return res.status(200).json({
      ...lesson,
      content_body: null,
      video_url: null,
      youtube_video_id: null,
      _access: 'metadata_only',
    });
  } catch (err) {
    console.error('Lesson access API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
