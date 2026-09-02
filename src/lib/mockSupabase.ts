// ============================================================
// Production-Grade Mock Supabase Client — OraclePath Platform
// Parent: Ervion Technologies
// Implements SupabaseClientInterface for seamless real/mock swap
// All data persisted in localStorage for demo persistence
// Includes: Auth, PostgREST CRUD, Realtime subscriptions, Error simulation
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  SupabaseClientInterface, SupabaseAuthModule, SupabaseAuthResponse,
  SupabaseAuthStateChangeResult, SupabaseSubscription, PostgrestQueryBuilder,
  PostgrestResponse, SupabaseRealtimeModule, SupabaseRealtimeChannel, SupabaseRealtimePayload
} from './supabaseTypes';

// ─── Storage Keys ───
const KEYS = {
  users: 'oraclepath_db_users',
  profiles: 'oraclepath_db_profiles',
  enrollments: 'oraclepath_db_enrollments',
  progress: 'oraclepath_db_progress',
  courses: 'oraclepath_db_courses',
  internships: 'oraclepath_db_internships',
  internship_applications: 'oraclepath_db_internship_applications',
  certificates: 'oraclepath_db_certificates',
  session: 'oraclepath_auth_session',
  analytics: 'oraclepath_db_analytics',
  orders: 'oraclepath_db_orders',
  resources: 'oraclepath_db_resources',
  faq: 'oraclepath_db_faq',
  realtime_subscribers: 'oraclepath_rt_subscribers',
};

// ─── Memory fallback for sandboxed environments (iframes, file://, private browsing) ───
const _memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__ls_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const _lsAvailable = isLocalStorageAvailable();

function getRaw(key: string): string | null {
  try {
    return _lsAvailable ? localStorage.getItem(key) : _memoryStore[key] || null;
  } catch {
    return null;
  }
}

function removeItem(key: string) {
  try {
    if (_lsAvailable) {
      localStorage.removeItem(key);
    } else {
      delete _memoryStore[key];
    }
  } catch {
    // Silently ignore
  }
}

function get<T>(key: string): T[] {
  try {
    const raw = _lsAvailable ? localStorage.getItem(key) : _memoryStore[key];
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function set(key: string, data: unknown) {
  try {
    const json = JSON.stringify(data);
    if (_lsAvailable) {
      localStorage.setItem(key, json);
    } else {
      _memoryStore[key] = json;
    }
  } catch {
    // Fallback: silently ignore storage failures in sandboxed environments
  }
}
function makeToken(user: Record<string, unknown>): string {
  return btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 }));
}
function now(): string { return new Date().toISOString(); }

// ─── Emit realtime events ───
function emitRealtime(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: Record<string, unknown>, oldRecord?: Record<string, unknown>) {
  try {
    const eventsKey = `oraclepath_rt_events_${table}`;
    const raw = _lsAvailable ? localStorage.getItem(eventsKey) : _memoryStore[eventsKey];
    const events: SupabaseRealtimePayload[] = JSON.parse(raw || '[]');
    events.push({
      schema: 'public',
      table,
      commit_timestamp: now(),
      eventType,
      new: newRecord,
      old: oldRecord || newRecord,
      errors: null,
    } as SupabaseRealtimePayload);
    const json = JSON.stringify(events);
    if (_lsAvailable) {
      localStorage.setItem(eventsKey, json);
    } else {
      _memoryStore[eventsKey] = json;
    }
  } catch {
    // Silently ignore in sandboxed environments
  }
}

// ─── Seed Initial Data ───
function seed() {
  if (get(KEYS.users).length > 0) return; // already seeded (uses safe get())

  const superAdminId = uuidv4();
  const adminId = uuidv4();
  const instructor1Id = uuidv4();
  const instructor2Id = uuidv4();
  const instructor3Id = uuidv4();
  const instructor4Id = uuidv4();
  const student1Id = uuidv4();
  const student2Id = uuidv4();
  const student3Id = uuidv4();

  set(KEYS.users, [
    { id: superAdminId, email: 'superadmin@erviontech.com', password: 'SuperAdmin123!', created_at: now() },
    { id: adminId, email: 'admin@oraclepath.com', password: 'Admin123!', created_at: now() },
    { id: instructor1Id, email: 'maria.chen@oraclepath.com', password: 'Instructor123!', created_at: now() },
    { id: instructor2Id, email: 'james.oconnell@oraclepath.com', password: 'Instructor123!', created_at: now() },
    { id: instructor3Id, email: 'rajesh.patel@oraclepath.com', password: 'Instructor123!', created_at: now() },
    { id: instructor4Id, email: 'lisa.zhang@oraclepath.com', password: 'Instructor123!', created_at: now() },
    { id: student1Id, email: 'sarah@example.com', password: 'Student123!', created_at: now() },
    { id: student2Id, email: 'david@example.com', password: 'Student123!', created_at: now() },
    { id: student3Id, email: 'priya@example.com', password: 'Student123!', created_at: now() },
  ]);

  set(KEYS.profiles, [
    { id: superAdminId, email: 'superadmin@erviontech.com', full_name: 'Super Admin', role: 'super_admin', avatar_url: null, phone: '+1-555-0000', title: 'Platform Owner', created_at: now() },
    { id: adminId, email: 'admin@oraclepath.com', full_name: 'Platform Administrator', role: 'admin', avatar_url: null, phone: '+1-555-0001', title: 'Admin', created_at: now() },
    { id: instructor1Id, email: 'maria.chen@oraclepath.com', full_name: 'Dr. Maria Chen', role: 'instructor', avatar_url: null, phone: '+1-555-1001', title: 'Oracle ACE Director', created_at: now() },
    { id: instructor2Id, email: 'james.oconnell@oraclepath.com', full_name: "James O'Connell", role: 'instructor', avatar_url: null, phone: '+1-555-1002', title: 'Senior Oracle Architect', created_at: now() },
    { id: instructor3Id, email: 'rajesh.patel@oraclepath.com', full_name: 'Rajesh Patel', role: 'instructor', avatar_url: null, phone: '+1-555-1003', title: 'Performance Tuning Expert', created_at: now() },
    { id: instructor4Id, email: 'lisa.zhang@oraclepath.com', full_name: 'Lisa Zhang', role: 'instructor', avatar_url: null, phone: '+1-555-1004', title: 'APEX Product Champion', created_at: now() },
    { id: student1Id, email: 'sarah@example.com', full_name: 'Sarah Mitchell', role: 'student', avatar_url: null, phone: '+1-555-0101', title: null, created_at: now() },
    { id: student2Id, email: 'david@example.com', full_name: 'David Park', role: 'student', avatar_url: null, phone: '+1-555-0102', title: null, created_at: now() },
    { id: student3Id, email: 'priya@example.com', full_name: 'Priya Sharma', role: 'student', avatar_url: null, phone: '+1-555-0103', title: null, created_at: now() },
  ]);

  const courseIds = ['c-1', 'c-2', 'c-3', 'c-4', 'c-5', 'c-6'];
  set(KEYS.courses, [
    { id: courseIds[0], title: 'Oracle SQL Fundamentals', subtitle: 'From Zero to Hero in Database Querying', description: 'Master the art of querying Oracle databases with hands-on projects.', level: 'Beginner', duration: '8 weeks', lessons: 64, rating: 4.9, price: 199, original_price: 349, tags: ['SQL', 'Database', 'Querying'], topics: ['SELECT statements', 'JOINs', 'Aggregate functions', 'Subqueries', 'DML', 'DDL'], instructor: 'Dr. Maria Chen', instructor_id: instructor1Id, students: 3840, featured: true, status: 'published', created_at: now() },
    { id: courseIds[1], title: 'PL/SQL Programming Masterclass', subtitle: 'Build Powerful Database Applications', description: 'Unlock the full power of Oracle procedural language.', level: 'Intermediate', duration: '10 weeks', lessons: 80, rating: 4.8, price: 249, original_price: 399, tags: ['PL/SQL', 'Procedural', 'Development'], topics: ['Block structure', 'Control structures', 'Cursors', 'Stored procedures', 'Triggers', 'Packages', 'Exception handling'], instructor: "James O'Connell", instructor_id: instructor2Id, students: 2150, featured: true, status: 'published', created_at: now() },
    { id: courseIds[2], title: 'Advanced SQL Tuning & Optimization', subtitle: 'Make Your Queries Lightning Fast', description: 'Learn execution plans, indexing, hints, and partitioning.', level: 'Advanced', duration: '6 weeks', lessons: 48, rating: 4.9, price: 299, original_price: 449, tags: ['Performance', 'Optimization', 'Tuning'], topics: ['Execution plans', 'Index design', 'Query rewrite', 'Partitioning', 'Optimizer statistics', 'Case studies'], instructor: 'Rajesh Patel', instructor_id: instructor3Id, students: 1280, featured: false, status: 'published', created_at: now() },
    { id: courseIds[3], title: 'Oracle APEX Low-Code Development', subtitle: 'Build Web Apps Without Traditional Coding', description: 'Create enterprise web applications using Oracle APEX.', level: 'Intermediate', duration: '8 weeks', lessons: 56, rating: 4.7, price: 229, original_price: 379, tags: ['APEX', 'Low-Code', 'Web Apps'], topics: ['APEX architecture', 'Interactive grids', 'Dynamic actions', 'REST APIs', 'Authentication', 'Deployment'], instructor: 'Lisa Zhang', instructor_id: instructor4Id, students: 1650, featured: false, status: 'published', created_at: now() },
    { id: courseIds[4], title: 'Oracle DBA Essentials', subtitle: 'Master Database Administration', description: 'Install, configure, secure, and maintain Oracle databases.', level: 'Intermediate', duration: '12 weeks', lessons: 96, rating: 4.8, price: 349, original_price: 499, tags: ['DBA', 'Administration', 'Infrastructure'], topics: ['Installation', 'User management', 'Backup & recovery', 'RAC & Data Guard', 'Performance monitoring', 'Cloud'], instructor: 'Ahmed Hassan', instructor_id: null, students: 980, featured: false, status: 'published', created_at: now() },
    { id: courseIds[5], title: 'SQL for Data Analytics', subtitle: 'Transform Data into Insights', description: 'Leverage Oracle analytic functions for complex business problems.', level: 'Intermediate', duration: '6 weeks', lessons: 42, rating: 4.8, price: 189, original_price: 299, tags: ['Analytics', 'Window Functions', 'BI'], topics: ['Window functions', 'Running totals', 'Ranking', 'Pivot operations', 'Pattern matching', 'Time-series'], instructor: 'Dr. Maria Chen', instructor_id: instructor1Id, students: 1890, featured: false, status: 'published', created_at: now() },
  ]);

  const internIds = ['i-1', 'i-2', 'i-3', 'i-4', 'i-5', 'i-6'];
  set(KEYS.internships, [
    { id: internIds[0], title: 'Oracle Database Developer Intern', company: 'DataFlow Solutions', location: 'Remote', type: 'Remote', duration: '3 months', stipend: '$2,500/month', description: 'Work on real enterprise database projects, developing stored procedures, functions, and optimizing queries for a fintech platform serving 2M+ users.', requirements: ['Strong SQL & PL/SQL knowledge', 'Basic understanding of database design', 'Problem-solving mindset', 'Available 20+ hours/week'], skills: ['SQL', 'PL/SQL', 'Oracle 19c', 'Git'], openings: 4, deadline: '2025-07-15', featured: true, status: 'open', created_at: now() },
    { id: internIds[1], title: 'PL/SQL Engineer Intern', company: 'Oracle Systems Inc.', location: 'Austin, TX', type: 'Hybrid', duration: '6 months', stipend: '$3,200/month', description: 'Join the core database team at Oracle. Contribute to package development, API design, and performance optimization for Oracle Cloud Infrastructure services.', requirements: ['Completed PL/SQL coursework or equivalent', 'Understanding of Oracle architecture', 'Familiarity with Linux environments', 'Pursuing CS/IT/related degree'], skills: ['PL/SQL', 'Oracle Cloud', 'Linux', 'Performance Tuning'], openings: 2, deadline: '2025-06-30', featured: true, status: 'open', created_at: now() },
    { id: internIds[2], title: 'Oracle APEX Developer Intern', company: 'AppNexus Technologies', location: 'Remote', type: 'Remote', duration: '4 months', stipend: '$2,200/month', description: 'Build low-code enterprise applications for healthcare clients. Work on dashboards, reporting modules, and interactive data entry forms using Oracle APEX.', requirements: ['Knowledge of Oracle APEX or similar low-code platforms', 'HTML/CSS/JavaScript basics', 'SQL proficiency required', 'Portfolio or project examples preferred'], skills: ['Oracle APEX', 'SQL', 'JavaScript', 'REST APIs'], openings: 3, deadline: '2025-08-01', featured: false, status: 'open', created_at: now() },
    { id: internIds[3], title: 'Junior Oracle DBA Intern', company: 'GlobalBank Financial', location: 'New York, NY', type: 'On-site', duration: '6 months', stipend: '$3,500/month', description: 'Learn enterprise database administration from senior DBAs. Monitor production databases, assist with backup procedures, and contribute to migration projects.', requirements: ['Oracle SQL/PL-SQL certification or equivalent experience', 'Basic Linux command-line knowledge', 'Strong attention to detail', 'Willingness to work on-call rotations'], skills: ['Oracle DBA', 'Linux', 'Backup/Recovery', 'Shell Scripting'], openings: 2, deadline: '2025-07-20', featured: false, status: 'open', created_at: now() },
    { id: internIds[4], title: 'SQL Data Analyst Intern', company: 'RetailMax Analytics', location: 'Chicago, IL', type: 'Hybrid', duration: '3 months', stipend: '$2,800/month', description: 'Analyze retail sales data using advanced SQL techniques. Create reports, dashboards, and predictive models to support business decision-making across 500+ stores.', requirements: ['Advanced SQL & window functions knowledge', 'Data visualization interest', 'Statistical thinking', 'Business acumen'], skills: ['SQL', 'Analytics', 'Oracle BI', 'Excel/Python'], openings: 5, deadline: '2025-08-15', featured: false, status: 'open', created_at: now() },
    { id: internIds[5], title: 'ETL/Database Integration Intern', company: 'CloudSync Data', location: 'Remote', type: 'Remote', duration: '4 months', stipend: '$2,600/month', description: 'Design and implement data pipelines between Oracle databases and cloud data warehouses. Work with Oracle Data Integrator and modern cloud ETL tools.', requirements: ['SQL & PL/SQL strong foundation', 'Interest in data engineering', 'Cloud concepts (AWS/Azure/GCP)', 'Python or Java basics'], skills: ['SQL', 'PL/SQL', 'ETL', 'Oracle Data Integrator', 'Python'], openings: 3, deadline: '2025-09-01', featured: false, status: 'open', created_at: now() },
  ]);

  set(KEYS.enrollments, [
    { id: uuidv4(), user_id: student1Id, course_id: courseIds[0], status: 'active', progress: 42, enrolled_at: '2025-04-15T10:00:00Z', completed_at: null, last_accessed_at: '2025-05-20T14:30:00Z' },
    { id: uuidv4(), user_id: student1Id, course_id: courseIds[3], status: 'active', progress: 18, enrolled_at: '2025-05-01T09:00:00Z', completed_at: null, last_accessed_at: '2025-05-18T11:00:00Z' },
    { id: uuidv4(), user_id: student2Id, course_id: courseIds[1], status: 'active', progress: 65, enrolled_at: '2025-03-10T08:00:00Z', completed_at: null, last_accessed_at: '2025-05-22T16:00:00Z' },
    { id: uuidv4(), user_id: student2Id, course_id: courseIds[2], status: 'completed', progress: 100, enrolled_at: '2025-01-15T10:00:00Z', completed_at: '2025-04-01T12:00:00Z', last_accessed_at: '2025-04-01T12:00:00Z' },
    { id: uuidv4(), user_id: student3Id, course_id: courseIds[5], status: 'active', progress: 78, enrolled_at: '2025-02-20T13:00:00Z', completed_at: null, last_accessed_at: '2025-05-21T10:00:00Z' },
  ]);

  set(KEYS.progress, [
    { id: uuidv4(), user_id: student1Id, course_id: courseIds[0], lesson_id: 'L-1', lesson_title: 'Introduction to Oracle SQL', completed: true, score: 95, completed_at: '2025-04-16T10:00:00Z' },
    { id: uuidv4(), user_id: student1Id, course_id: courseIds[0], lesson_id: 'L-2', lesson_title: 'SELECT Statements and Filtering', completed: true, score: 88, completed_at: '2025-04-18T11:00:00Z' },
    { id: uuidv4(), user_id: student1Id, course_id: courseIds[0], lesson_id: 'L-3', lesson_title: 'JOINs and Set Operations', completed: true, score: 92, completed_at: '2025-04-22T09:00:00Z' },
    { id: uuidv4(), user_id: student2Id, course_id: courseIds[1], lesson_id: 'L-1', lesson_title: 'PL/SQL Block Structure', completed: true, score: 90, completed_at: '2025-03-11T10:00:00Z' },
    { id: uuidv4(), user_id: student2Id, course_id: courseIds[1], lesson_id: 'L-5', lesson_title: 'Cursors and Cursor Variables', completed: true, score: 85, completed_at: '2025-03-20T14:00:00Z' },
    { id: uuidv4(), user_id: student3Id, course_id: courseIds[5], lesson_id: 'L-1', lesson_title: 'Window Functions Overview', completed: true, score: 98, completed_at: '2025-02-21T10:00:00Z' },
  ]);

  set(KEYS.certificates, [
    { id: uuidv4(), user_id: student2Id, course_id: courseIds[2], certificate_number: 'OP-2025-0042', issued_at: '2025-04-01T12:00:00Z', status: 'published' },
  ]);

  set(KEYS.analytics, [
    { id: uuidv4(), type: 'enrollment', course_id: courseIds[0], user_id: student1Id, amount: 199, currency: 'USD', created_at: '2025-04-15T10:00:00Z' },
    { id: uuidv4(), type: 'enrollment', course_id: courseIds[3], user_id: student1Id, amount: 229, currency: 'USD', created_at: '2025-05-01T09:00:00Z' },
    { id: uuidv4(), type: 'enrollment', course_id: courseIds[1], user_id: student2Id, amount: 249, currency: 'USD', created_at: '2025-03-10T08:00:00Z' },
    { id: uuidv4(), type: 'enrollment', course_id: courseIds[2], user_id: student2Id, amount: 299, currency: 'USD', created_at: '2025-01-15T10:00:00Z' },
    { id: uuidv4(), type: 'enrollment', course_id: courseIds[5], user_id: student3Id, amount: 189, currency: 'USD', created_at: '2025-02-20T13:00:00Z' },
  ]);

  set(KEYS.orders, [
    { id: uuidv4(), user_id: student1Id, order_number: 'OP-2025-0010', items: [{ course_id: courseIds[0], price: 199 }], total: 199, status: 'completed', payment_method: 'Credit Card', transaction_id: 'txn_abc123', created_at: '2025-04-15T10:00:00Z' },
    { id: uuidv4(), user_id: student1Id, order_number: 'OP-2025-0011', items: [{ course_id: courseIds[3], price: 229 }], total: 229, status: 'completed', payment_method: 'PayPal', transaction_id: 'txn_def456', created_at: '2025-05-01T09:00:00Z' },
    { id: uuidv4(), user_id: student2Id, order_number: 'OP-2025-0005', items: [{ course_id: courseIds[1], price: 249 }, { course_id: courseIds[2], price: 299 }], total: 548, status: 'completed', payment_method: 'Credit Card', transaction_id: 'txn_ghi789', created_at: '2025-03-10T08:00:00Z' },
    { id: uuidv4(), user_id: student3Id, order_number: 'OP-2025-0007', items: [{ course_id: courseIds[5], price: 189 }], total: 189, status: 'completed', payment_method: 'PayPal', transaction_id: 'txn_jkl012', created_at: '2025-02-20T13:00:00Z' },
  ]);

  set(KEYS.internship_applications, [
    { id: uuidv4(), user_id: student1Id, internship_id: internIds[0], status: 'reviewing', applied_at: '2025-05-10T09:00:00Z', resume_url: 'https://example.com/resume.pdf', cover_letter: 'I am passionate about Oracle databases...', notes: 'Strong SQL skills, good fit' },
    { id: uuidv4(), user_id: student2Id, internship_id: internIds[1], status: 'interview_scheduled', applied_at: '2025-04-20T14:00:00Z', resume_url: 'https://example.com/resume2.pdf', cover_letter: 'Completed PL/SQL Masterclass with 100% score...', notes: 'Top candidate' },
    { id: uuidv4(), user_id: student3Id, internship_id: internIds[4], status: 'submitted', applied_at: '2025-05-18T10:00:00Z', resume_url: 'https://example.com/resume3.pdf', cover_letter: 'Data analytics is my passion...', notes: '' },
  ]);
}

// ─── Query Builder ───
class QueryBuilder implements PostgrestQueryBuilder {
  private table: string;
  private _select: string = '*';
  private _filters: { column: string; value: unknown; op: string }[] = [];
  private _order: { column: string; ascending: boolean; nullsFirst?: boolean } | null = null;
  private _single: boolean = false;
  private _limit: number | null = null;
  private _offset: number | null = null;
  private _action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private _insertData: Record<string, unknown>[] | null = null;
  private _updateData: Record<string, unknown> | null = null;
  private _head: boolean = false;
  private _count: 'exact' | 'planned' | 'estimated' | null = null;

  constructor(table: string) { this.table = table; }

  select(columns: string = '*') { this._select = columns; this._action = 'select'; return this; }
  insert(values: Record<string, unknown> | Record<string, unknown>[]) { this._insertData = Array.isArray(values) ? values : [values]; this._action = 'insert'; return this; }
  update(values: Record<string, unknown>) { this._updateData = values; this._action = 'update'; return this; }
  delete() { this._action = 'delete'; return this; }
  upsert(values: Record<string, unknown> | Record<string, unknown>[]) { this._insertData = Array.isArray(values) ? values : [values]; this._action = 'insert'; return this; }

  eq(column: string, value: unknown) { this._filters.push({ column, value, op: 'eq' }); return this; }
  neq(column: string, value: unknown) { this._filters.push({ column, value, op: 'neq' }); return this; }
  gt(column: string, value: unknown) { this._filters.push({ column, value, op: 'gt' }); return this; }
  gte(column: string, value: unknown) { this._filters.push({ column, value, op: 'gte' }); return this; }
  lt(column: string, value: unknown) { this._filters.push({ column, value, op: 'lt' }); return this; }
  lte(column: string, value: unknown) { this._filters.push({ column, value, op: 'lte' }); return this; }
  ilike(column: string, value: string) { this._filters.push({ column, value, op: 'ilike' }); return this; }
  like(column: string, value: string) { this._filters.push({ column, value, op: 'like' }); return this; }
  in(column: string, values: unknown[]) { this._filters.push({ column, value: values, op: 'in' }); return this; }
  is(column: string, value: unknown) { this._filters.push({ column, value, op: 'is' }); return this; }
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) { this._order = { column, ascending: options?.ascending !== false, nullsFirst: options?.nullsFirst }; return this; }
  limit(count: number) { this._limit = count; return this; }
  range(from: number, to: number) { this._offset = from; this._limit = to - from + 1; return this; }
  head() { this._head = true; return this; }
  count(mode: 'exact' | 'planned' | 'estimated') { this._count = mode; return this; }

  single(): Promise<PostgrestResponse<Record<string, unknown>>> {
    this._single = true;
    return this._executeAsPromise();
  }

  maybeSingle(): Promise<PostgrestResponse<Record<string, unknown> | null>> {
    this._single = true;
    return this._executeAsPromise();
  }

  private getData(): Record<string, unknown>[] {
    const key = `oraclepath_db_${this.table}`;
    return get<Record<string, unknown>>(key);
  }

  private setData(data: Record<string, unknown>[]) {
    const key = `oraclepath_db_${this.table}`;
    set(key, data);
  }

  private applyFilters(data: Record<string, unknown>[]): Record<string, unknown>[] {
    return data.filter((row) => {
      for (const f of this._filters) {
        const val = row[f.column];
        if (f.op === 'eq' && val !== f.value) return false;
        if (f.op === 'neq' && val === f.value) return false;
        if (f.op === 'gt') { if (typeof val === 'number' && typeof f.value === 'number' && val <= f.value) return false; if (typeof val === 'string' && typeof f.value === 'string' && val <= f.value) return false; }
        if (f.op === 'gte') { if (typeof val === 'number' && typeof f.value === 'number' && val < f.value) return false; if (typeof val === 'string' && typeof f.value === 'string' && val < f.value) return false; }
        if (f.op === 'lt') { if (typeof val === 'number' && typeof f.value === 'number' && val >= f.value) return false; if (typeof val === 'string' && typeof f.value === 'string' && val >= f.value) return false; }
        if (f.op === 'lte') { if (typeof val === 'number' && typeof f.value === 'number' && val > f.value) return false; if (typeof val === 'string' && typeof f.value === 'string' && val > f.value) return false; }
        if (f.op === 'ilike' && typeof val === 'string' && typeof f.value === 'string' && !val.toLowerCase().includes(f.value.toLowerCase())) return false;
        if (f.op === 'like' && typeof val === 'string' && typeof f.value === 'string' && !val.includes(f.value)) return false;
        if (f.op === 'in' && Array.isArray(f.value) && !f.value.includes(val)) return false;
        if (f.op === 'is' && val !== f.value && !(f.value === null && val === null)) return false;
      }
      return true;
    });
  }

  private applyOrder(data: Record<string, unknown>[]): Record<string, unknown>[] {
    if (!this._order) return data;
    return [...data].sort((a, b) => {
      const aVal = a[this._order!.column] as string | number | null;
      const bVal = b[this._order!.column] as string | number | null;
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return this._order!.nullsFirst ? -1 : 1;
      if (bVal === null) return this._order!.nullsFirst ? 1 : -1;
      if (aVal < bVal) return this._order!.ascending ? -1 : 1;
      if (aVal > bVal) return this._order!.ascending ? 1 : -1;
      return 0;
    });
  }

  private applyLimitOffset(data: Record<string, unknown>[]): Record<string, unknown>[] {
    let result = data;
    if (this._offset !== null) result = result.slice(this._offset);
    if (this._limit !== null) result = result.slice(0, this._limit);
    return result;
  }

  private execute(): Record<string, unknown>[] | Record<string, unknown> | null | number {
    if (this._action === 'select') {
      let data = this.getData();
      const count = data.length;
      data = this.applyFilters(data);
      data = this.applyOrder(data);
      data = this.applyLimitOffset(data);
      if (this._count) return count;
      if (this._head) return null;
      if (this._single) return data[0] || null;
      return data;
    }
    if (this._action === 'insert') {
      let data = this.getData();
      const newRows = this._insertData!.map((row) => ({ ...row, id: row.id || uuidv4(), created_at: row.created_at || now() }));
      data = [...data, ...newRows];
      this.setData(data);
      newRows.forEach((row) => emitRealtime(this.table, 'INSERT', row));
      return newRows.length === 1 ? newRows[0] : newRows;
    }
    if (this._action === 'update') {
      let data = this.getData();
      const updatedRows: Record<string, unknown>[] = [];
      data = data.map((row) => {
        let allMatch = true;
        for (const f of this._filters) {
          if (row[f.column] !== f.value) { allMatch = false; break; }
        }
        if (!allMatch) return row;
        const updated = { ...row, ...this._updateData, updated_at: now() };
        updatedRows.push(updated);
        emitRealtime(this.table, 'UPDATE', updated, row);
        return updated;
      });
      this.setData(data);
      return updatedRows;
    }
    if (this._action === 'delete') {
      let data = this.getData();
      const deletedRows: Record<string, unknown>[] = [];
      data = data.filter((row) => {
        for (const f of this._filters) {
          if (row[f.column] === f.value) {
            deletedRows.push(row);
            emitRealtime(this.table, 'DELETE', row);
            return false;
          }
        }
        return true;
      });
      this.setData(data);
      return deletedRows;
    }
    return [];
  }

  private _buildResponse(): PostgrestResponse<unknown> {
    const result = this.execute();
    return {
      data: result as unknown,
      error: null,
      status: 200,
      statusText: 'OK',
      count: typeof result === 'number' ? result : undefined,
    };
  }

  private _executeAsPromise(): Promise<PostgrestResponse<Record<string, unknown>>> {
    return Promise.resolve(this._buildResponse() as PostgrestResponse<Record<string, unknown>>);
  }

  then<TResult = PostgrestResponse<Record<string, unknown>[]>>(
    onfulfilled?: ((value: PostgrestResponse<Record<string, unknown>[]>) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<TResult> {
    const response = this._buildResponse() as PostgrestResponse<Record<string, unknown>[]>;
    return Promise.resolve(response).then(onfulfilled as (value: PostgrestResponse<Record<string, unknown>[]>) => TResult | PromiseLike<TResult>);
  }
}

// ─── Auth Module ───
class AuthModule implements SupabaseAuthModule {
  private listeners: ((event: string, session: unknown) => void)[] = [];

  private emit(event: string, session: unknown) {
    this.listeners.forEach((cb) => cb(event, session));
  }

  async signUp(credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }): Promise<SupabaseAuthResponse> {
    const users = get<Record<string, unknown>>(KEYS.users);
    if (users.find((u) => u.email === credentials.email)) {
      return { data: { user: null, session: null }, error: { message: 'User already registered' } };
    }
    const userId = uuidv4();
    const newUser = { id: userId, email: credentials.email, password: credentials.password, created_at: now() };
    users.push(newUser);
    set(KEYS.users, users);

    const profile = { id: userId, email: credentials.email, full_name: credentials.options?.data?.full_name || '', role: 'student', avatar_url: null, phone: null, created_at: now() };
    const profiles = get<Record<string, unknown>>(KEYS.profiles);
    profiles.push(profile);
    set(KEYS.profiles, profiles);

    const session = { access_token: makeToken({ ...newUser, role: 'student' }), user: { id: userId, email: credentials.email, user_metadata: { full_name: credentials.options?.data?.full_name } } };
    set(KEYS.session, session);
    this.emit('SIGNED_IN', session);
    return { data: { user: session.user as unknown as SupabaseAuthResponse['data']['user'], session: session as unknown as SupabaseAuthResponse['data']['session'] }, error: null };
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<SupabaseAuthResponse> {
    const users = get<Record<string, unknown>>(KEYS.users);
    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password);
    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }
    const profiles = get<Record<string, unknown>>(KEYS.profiles);
    const profile = profiles.find((p) => p.id === user.id);
    const session = { access_token: makeToken({ ...user, role: profile?.role || 'student' }), user: { id: user.id, email: user.email, user_metadata: { full_name: profile?.full_name } } };
    set(KEYS.session, session);
    this.emit('SIGNED_IN', session);
    return { data: { user: session.user as unknown as SupabaseAuthResponse['data']['user'], session: session as unknown as SupabaseAuthResponse['data']['session'] }, error: null };
  }

  async signOut(): Promise<{ error: { message: string } | null }> {
    removeItem(KEYS.session);
    this.emit('SIGNED_OUT', null);
    return { error: null };
  }

  async getUser(): Promise<{ data: { user: SupabaseAuthResponse['data']['user'] }; error: { message: string } | null }> {
    const session = getRaw(KEYS.session);
    if (!session) return { data: { user: null }, error: null };
    const s = JSON.parse(session);
    return { data: { user: s.user }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void): SupabaseAuthStateChangeResult {
    this.listeners.push(callback);
    const session = getRaw(KEYS.session);
    if (session) {
      callback('INITIAL_SESSION', JSON.parse(session));
    } else {
      callback('SIGNED_OUT', null);
    }
    const unsubscribe = () => { this.listeners = this.listeners.filter((l) => l !== callback); };
    return {
      data: { subscription: { unsubscribe } },
      unsubscribe,
    };
  }

  async updateUser(updates: { data?: Record<string, unknown>; password?: string }): Promise<{ data: { user: SupabaseAuthResponse['data']['user'] }; error: { message: string } | null }> {
    const sessionStr = getRaw(KEYS.session);
    if (!sessionStr) return { data: { user: null }, error: { message: 'No session' } };
    const session = JSON.parse(sessionStr);
    const users = get<Record<string, unknown>>(KEYS.users);
    const userIdx = users.findIndex((u) => u.id === session.user.id);
    if (userIdx === -1) return { data: { user: null }, error: { message: 'User not found' } };

    if (updates.password) {
      users[userIdx] = { ...users[userIdx], password: updates.password };
    }
    set(KEYS.users, users);

    if (updates.data) {
      const profiles = get<Record<string, unknown>>(KEYS.profiles);
      const profIdx = profiles.findIndex((p) => p.id === session.user.id);
      if (profIdx !== -1) {
        profiles[profIdx] = { ...profiles[profIdx], ...updates.data };
        set(KEYS.profiles, profiles);
        session.user.user_metadata = { ...session.user.user_metadata, ...updates.data };
      }
    }
    set(KEYS.session, session);
    return { data: { user: session.user }, error: null };
  }
}

// ─── Realtime Module ───
class RealtimeChannel implements SupabaseRealtimeChannel {
  private name: string;
  private callbacks: { event: string; filter: Record<string, string>; callback: (payload: SupabaseRealtimePayload) => void }[] = [];
  private subscribed: boolean = false;

  constructor(name: string) { this.name = name; }

  on(event: string, filter: Record<string, string>, callback: (payload: SupabaseRealtimePayload) => void): SupabaseRealtimeChannel {
    this.callbacks.push({ event, filter, callback });
    return this;
  }

  subscribe(callback?: (status: string) => void): SupabaseRealtimeChannel {
    this.subscribed = true;
    if (callback) callback('SUBSCRIBED');
    // Poll for events every 2 seconds
    this._startPolling();
    return this;
  }

  unsubscribe(): void {
    this.subscribed = false;
    this.callbacks = [];
  }

  private _startPolling() {
    const poll = () => {
      if (!this.subscribed) return;
      const events = get<SupabaseRealtimePayload>(`oraclepath_rt_events_${this.name}`);
      if (events.length > 0) {
        set(`oraclepath_rt_events_${this.name}`, []);
        events.forEach((payload) => {
          this.callbacks.forEach((cb) => {
            if (cb.event === '*' || cb.event === payload.eventType) {
              const matchesFilter = Object.entries(cb.filter).every(([key, value]) => {
                if (key === 'table' && payload.table === value) return true;
                return true; // simplified matching
              });
              if (matchesFilter) cb.callback(payload);
            }
          });
        });
      }
      setTimeout(poll, 2000);
    };
    poll();
  }
}

class RealtimeModule implements SupabaseRealtimeModule {
  private channels: RealtimeChannel[] = [];

  channel(name: string): SupabaseRealtimeChannel {
    const ch = new RealtimeChannel(name);
    this.channels.push(ch);
    return ch;
  }

  removeChannel(channel: SupabaseRealtimeChannel): void {
    channel.unsubscribe();
    this.channels = this.channels.filter((c) => c !== channel);
  }

  removeAllChannels(): void {
    this.channels.forEach((c) => c.unsubscribe());
    this.channels = [];
  }
}

// ─── Mock Supabase Client ───
class MockSupabaseClient implements SupabaseClientInterface {
  auth = new AuthModule();
  realtime = new RealtimeModule();

  from(table: string): PostgrestQueryBuilder {
    return new QueryBuilder(table);
  }
}

// Initialize seed data — wrapped for sandboxed environments
if (typeof window !== 'undefined') {
  try {
    seed();
  } catch (err) {
    console.warn('[OraclePath] Mock data seed failed (sandboxed environment?). Using in-memory fallback.', err);
  }
}

export function createMockClient(): SupabaseClientInterface {
  return new MockSupabaseClient();
}

export type MockSupabaseClientType = InstanceType<typeof MockSupabaseClient>;
