// ============================================================
// Unified Supabase Client Interface
// Abstracts real Supabase and mock implementations behind a single type
// ============================================================

export interface SupabaseAuthUser {
  id: string;
  email: string;
  user_metadata: { full_name?: string };
}

export interface SupabaseSession {
  user: SupabaseAuthUser;
  access_token?: string;
}

export interface SupabaseAuthResponse {
  data: { user: SupabaseAuthUser | null; session: SupabaseSession | null };
  error: { message: string } | null;
}

export interface SupabaseAuthStateChangeCallback {
  (event: string, session: unknown): void;
}

export interface SupabaseSubscription {
  unsubscribe: () => void;
}

export interface SupabaseAuthStateChangeResult {
  data: { subscription: SupabaseSubscription };
  unsubscribe: () => void;
}

export interface SupabaseAuthModule {
  signUp(credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }): Promise<SupabaseAuthResponse>;
  signInWithPassword(credentials: { email: string; password: string }): Promise<SupabaseAuthResponse>;
  signOut(): Promise<{ error: { message: string } | null }>;
  getUser(): Promise<{ data: { user: SupabaseAuthUser | null }; error: { message: string } | null }>;
  onAuthStateChange(callback: SupabaseAuthStateChangeCallback): SupabaseAuthStateChangeResult;
  updateUser(updates: { data?: Record<string, unknown>; password?: string }): Promise<{ data: { user: SupabaseAuthUser | null }; error: { message: string } | null }>;
}

export interface PostgrestResponse<T = unknown> {
  data: T | null;
  error: { message: string; code?: string; details?: string; hint?: string } | null;
  status: number;
  statusText: string;
  count?: number;
}

export interface PostgrestQueryBuilder {
  select(columns?: string): PostgrestQueryBuilder;
  insert(values: Record<string, unknown> | Record<string, unknown>[]): PostgrestQueryBuilder;
  update(values: Record<string, unknown>): PostgrestQueryBuilder;
  delete(): PostgrestQueryBuilder;
  eq(column: string, value: unknown): PostgrestQueryBuilder;
  neq(column: string, value: unknown): PostgrestQueryBuilder;
  gt(column: string, value: unknown): PostgrestQueryBuilder;
  gte(column: string, value: unknown): PostgrestQueryBuilder;
  lt(column: string, value: unknown): PostgrestQueryBuilder;
  lte(column: string, value: unknown): PostgrestQueryBuilder;
  ilike(column: string, value: string): PostgrestQueryBuilder;
  like(column: string, value: string): PostgrestQueryBuilder;
  in(column: string, values: unknown[]): PostgrestQueryBuilder;
  is(column: string, value: unknown): PostgrestQueryBuilder;
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): PostgrestQueryBuilder;
  limit(count: number): PostgrestQueryBuilder;
  range(from: number, to: number): PostgrestQueryBuilder;
  single(): Promise<PostgrestResponse<Record<string, unknown>>>;
  maybeSingle(): Promise<PostgrestResponse<Record<string, unknown> | null>>;
  then<TResult = PostgrestResponse<Record<string, unknown>[]>>(
    onfulfilled?: ((value: PostgrestResponse<Record<string, unknown>[]>) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<TResult>;
}

export interface SupabaseRealtimePayload<T = unknown> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: { message: string }[] | null;
}

export interface SupabaseRealtimeChannel {
  on(event: string, filter: Record<string, string>, callback: (payload: SupabaseRealtimePayload) => void): SupabaseRealtimeChannel;
  subscribe(callback?: (status: string) => void): SupabaseRealtimeChannel;
  unsubscribe(): void;
}

export interface SupabaseRealtimeModule {
  channel(name: string): SupabaseRealtimeChannel;
  removeChannel(channel: SupabaseRealtimeChannel): void;
  removeAllChannels(): void;
}

export interface SupabaseClientInterface {
  auth: SupabaseAuthModule;
  from(table: string): PostgrestQueryBuilder;
  realtime: SupabaseRealtimeModule;
}

// Database schema types for strong typing
export interface DatabaseSchema {
  profiles: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    phone: string | null;
    avatar_url: string | null;
    title: string | null;
    created_at: string;
  };
  courses: Record<string, unknown>;
  internships: Record<string, unknown>;
  enrollments: Record<string, unknown>;
  progress: Record<string, unknown>;
  certificates: Record<string, unknown>;
  analytics: Record<string, unknown>;
  orders: Record<string, unknown>;
  internship_applications: Record<string, unknown>;
  resources: Record<string, unknown>;
  faq: Record<string, unknown>;
}
