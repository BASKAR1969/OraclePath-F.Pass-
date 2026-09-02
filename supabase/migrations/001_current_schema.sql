-- ============================================================
-- OraclePath Platform — Current Schema Migration
-- Generated from the ACTUAL current database state.
-- Do NOT reset, drop, or recreate the existing database.
-- This migration documents the schema for version control.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email           text NOT NULL,
    full_name       text NOT NULL,
    role            text NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'admin', 'instructor', 'manager', 'student')),
    avatar_url      text,
    phone           text,
    title           text,
    bio             text,
    is_active       boolean DEFAULT true,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- 2. COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           text NOT NULL,
    subtitle        text NOT NULL,
    slug            text UNIQUE NOT NULL,
    description     text NOT NULL,
    level           text NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    duration        text NOT NULL,
    lessons_count   integer NOT NULL DEFAULT 0,
    rating          numeric DEFAULT 0,
    price           numeric NOT NULL DEFAULT 0,
    original_price  numeric,
    currency        text DEFAULT 'USD',
    tags            text DEFAULT '',
    topics          text DEFAULT '',
    instructor_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    instructor_name text NOT NULL,
    students_count  integer NOT NULL DEFAULT 0,
    featured        boolean DEFAULT false,
    status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON public.courses(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);

-- ============================================================
-- 3. COURSE_MODULES (sections within a course)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title           text NOT NULL,
    description     text,
    sort_order      integer NOT NULL DEFAULT 0,
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_sort ON public.course_modules(course_id, sort_order);

-- ============================================================
-- 4. LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id       uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
    title           text NOT NULL,
    description     text,
    lesson_type     text NOT NULL DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'sql_lab', 'assignment')),
    video_url       text,
    video_duration  integer,
    youtube_video_id text,
    content_body    text,
    sort_order      integer NOT NULL DEFAULT 0,
    is_free_preview boolean DEFAULT false,
    is_published    boolean DEFAULT false,
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort ON public.lessons(course_id, sort_order);

-- ============================================================
-- 5. ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
    progress_pct    integer NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    enrolled_at     timestamptz DEFAULT now(),
    completed_at    timestamptz,
    last_accessed_at timestamptz DEFAULT now(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);

-- ============================================================
-- 6. LESSON PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id       uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    is_completed    boolean DEFAULT false,
    time_spent_sec  integer DEFAULT 0,
    quiz_score      integer,
    completed_at    timestamptz,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON public.lesson_progress(course_id);

-- ============================================================
-- 7. CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id           uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number  text NOT NULL UNIQUE,
    issued_at           timestamptz DEFAULT now(),
    status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    UNIQUE(user_id, course_id)
);

-- ============================================================
-- 8. INTERNSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.internships (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           text NOT NULL,
    company         text NOT NULL,
    location        text NOT NULL,
    type            text NOT NULL CHECK (type IN ('Remote', 'Hybrid', 'On-site')),
    duration        text NOT NULL,
    stipend         text,
    description     text NOT NULL,
    requirements    text DEFAULT '',
    skills          text DEFAULT '',
    openings        integer NOT NULL DEFAULT 1,
    deadline        text,
    featured        boolean DEFAULT false,
    status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled', 'on_hold')),
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internships_status ON public.internships(status);

-- ============================================================
-- 9. INTERNSHIP APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    internship_id   uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn')),
    applied_at      timestamptz DEFAULT now(),
    resume_url      text,
    cover_letter    text,
    portfolio_url   text,
    notes           text,
    created_at      timestamptz DEFAULT now(),
    UNIQUE(user_id, internship_id)
);

-- ============================================================
-- 10. ORDERS / PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_number        text NOT NULL UNIQUE,
    status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    total_amount        numeric NOT NULL DEFAULT 0,
    currency            text DEFAULT 'USD',
    payment_intent_id   text,
    razorpay_payment_id text,
    payment_method      text,
    payment_provider    text DEFAULT 'razorpay',
    created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders(payment_intent_id);

-- ============================================================
-- 11. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    course_title    text NOT NULL,
    unit_price      numeric NOT NULL,
    quantity        integer NOT NULL DEFAULT 1,
    line_total      numeric NOT NULL
);

-- ============================================================
-- 12. RESOURCES (Blog/Articles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resources (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           text NOT NULL,
    slug            text UNIQUE NOT NULL,
    excerpt         text NOT NULL,
    content         text NOT NULL,
    category        text NOT NULL,
    author_name     text NOT NULL,
    read_time       text,
    tags            text DEFAULT '',
    featured        boolean DEFAULT false,
    status          text NOT NULL DEFAULT 'published',
    created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- 13. FAQ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faq (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    question        text NOT NULL,
    answer          text NOT NULL,
    category        text NOT NULL,
    sort_order      integer NOT NULL DEFAULT 0,
    is_published    boolean DEFAULT true,
    created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- 14. ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type      text NOT NULL,
    user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    course_id       uuid REFERENCES public.courses(id) ON DELETE SET NULL,
    internship_id   uuid REFERENCES public.internships(id) ON DELETE SET NULL,
    amount          numeric,
    currency        text DEFAULT 'USD',
    created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Profiles: read/update own
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: public read active
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT USING (status = 'published');

-- Course modules: public read
CREATE POLICY "course_modules_public_read" ON public.course_modules FOR SELECT USING (true);

-- Lessons: enrollment-gated access.
-- Free-preview lessons must be explicitly published AND belong to a published course.
-- Instructors can read lessons for their own courses. Admins/managers can read all.
CREATE POLICY "lessons_select_access" ON public.lessons FOR SELECT USING (
  -- Free preview lessons are publicly readable ONLY when:
  --   1. The lesson itself is published (is_published = true)
  --   2. The lesson is a free preview (is_free_preview = true)
  --   3. The course is published (status = 'published')
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

-- Enrollments: read own
CREATE POLICY "enrollments_read_own" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

-- Lesson progress: read own
CREATE POLICY "lesson_progress_read_own" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);

-- Certificates: read own
CREATE POLICY "certificates_read_own" ON public.certificates FOR SELECT USING (auth.uid() = user_id);

-- Internships: public read open
CREATE POLICY "internships_public_read" ON public.internships FOR SELECT USING (status = 'open');

-- Internship applications: read own
CREATE POLICY "internship_applications_read_own" ON public.internship_applications FOR SELECT USING (auth.uid() = user_id);

-- Orders: read own
CREATE POLICY "orders_read_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Resources: public read published
CREATE POLICY "resources_public_read" ON public.resources FOR SELECT USING (status = 'published');

-- FAQ: public read published
CREATE POLICY "faq_public_read" ON public.faq FOR SELECT USING (is_published = true);

-- ============================================================
-- TRIGGER: Auto-create profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'student'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
