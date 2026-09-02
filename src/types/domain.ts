// ============================================================
// OraclePath — Domain Types
// Parent: Ervion Technologies
// Core business entity types. No UI concerns. No Supabase imports.
// ============================================================

// ─── Role System ───
export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'manager' | 'student';

// ─── User & Profile ───
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  title: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: { full_name?: string };
}

// ─── Courses ───
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  duration: string;
  lessons: number;
  lessons_count?: number;
  rating: number;
  price: number;
  original_price?: number;
  tags: string[];
  topics: string[];
  instructor: string;
  instructor_name?: string;
  instructor_id: string | null;
  students: number;
  students_count?: number;
  featured: boolean;
  status: CourseStatus;
  created_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export type LessonType = 'video' | 'text' | 'quiz' | 'sql_lab' | 'assignment';

export interface CourseLesson {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  content_body: string | null;
  lesson_type: LessonType;
  video_url: string | null;
  video_duration: number | null;
  youtube_video_id: string | null;
  sort_order: number;
  is_published: boolean;
  is_free_preview: boolean;
  created_at: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  resource_type: 'pdf' | 'code' | 'link' | 'dataset' | 'exercise';
  url: string;
  file_size: number | null;
  created_at: string;
}

// ─── Enrollments ───
export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'pending';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress: number;
  progress_pct?: number;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  completed_at: string | null;
  score: number | null;
  time_spent_seconds: number | null;
  created_at: string;
}

// ─── Internships ───
export type InternshipType = 'Remote' | 'Hybrid' | 'On-site';
export type InternshipStatus = 'open' | 'closed' | 'filled' | 'paused';
export type ApplicationStatus = 'submitted' | 'reviewing' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn';

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: InternshipType;
  duration: string;
  stipend: string;
  description: string;
  requirements: string[];
  skills: string[];
  openings: number;
  deadline: string;
  featured: boolean;
  status: InternshipStatus;
  created_at: string;
}

export interface InternshipApplication {
  id: string;
  user_id: string;
  internship_id: string;
  status: ApplicationStatus;
  applied_at: string;
  cover_letter: string | null;
  resume_url: string | null;
  portfolio_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface InternshipTask {
  id: string;
  application_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'submitted' | 'reviewed' | 'passed' | 'failed';
  created_at: string;
}

// ─── Certificates ───
export type CertificateStatus = 'active' | 'revoked' | 'expired';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  status: CertificateStatus;
  created_at: string;
}

export interface CertificateVerification {
  certificate_number: string;
  holder_name: string;
  course_name: string;
  issued_date: string;
  is_valid: boolean;
  verified_at: string;
}

// ─── Orders / Payments ───
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'refunded' | 'failed' | 'cancelled';
export type PaymentMethod = 'Credit Card' | 'PayPal' | 'Bank Transfer' | 'UPI' | 'Net Banking' | 'Manual';

export interface OrderItem {
  course_id: string;
  course_title?: string;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  items: OrderItem[];
  total: number;
  total_amount?: number;
  currency: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_provider?: string;
  transaction_id: string | null;
  created_at: string;
}

// ─── Notifications ───
export type NotificationType = 'system' | 'course' | 'internship' | 'certificate' | 'payment' | 'announcement';
export type NotificationStatus = 'unread' | 'read' | 'dismissed';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  status: NotificationStatus;
  created_at: string;
  read_at: string | null;
}

// ─── Analytics ───
export interface AnalyticsEvent {
  id: string;
  type: string;
  user_id: string | null;
  course_id: string | null;
  internship_id: string | null;
  amount: number | null;
  currency: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── API Response Wrappers ───
export interface ServiceResult<T> {
  data: T | null;
  error: AppError | null;
  status: 'success' | 'error' | 'empty' | 'loading';
}

export interface AppError {
  code: string;
  message: string;
  details?: string;
  httpStatus?: number;
  isRetryable: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ListQuery {
  search?: string;
  filter?: Record<string, unknown>;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
}
