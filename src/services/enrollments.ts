// ============================================================
// OraclePath — Enrollment Service
// Parent: Ervion Technologies
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, emptyResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { Enrollment, LessonProgress, ListQuery } from '../types/domain';

const client = () => getServiceClient();

export async function getUserEnrollments(userId: string, query?: ListQuery): Promise<ServiceResult<Enrollment[]>> {
  try {
    let builder = client().from('enrollments').select('*').eq('user_id', userId);
    if (query?.filter?.status) {
      builder = builder.eq('status', query.filter.status);
    }
    if (query?.orderBy) {
      builder = builder.order(query.orderBy, { ascending: query.ascending !== false });
    }
    const { data, error } = await builder;
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Enrollment[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getEnrollmentById(id: string): Promise<ServiceResult<Enrollment>> {
  try {
    const { data, error } = await client().from('enrollments').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Enrollment not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Enrollment);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getEnrollment(userId: string, courseId: string): Promise<ServiceResult<Enrollment>> {
  try {
    const { data, error } = await client()
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Not enrolled', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Enrollment);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function createEnrollment(
  userId: string,
  courseId: string,
  status: string = 'active'
): Promise<ServiceResult<Enrollment>> {
  try {
    const { data, error } = await client()
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId, status, progress: 0, progress_pct: 0 })
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to create enrollment', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as Enrollment);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updateEnrollmentProgress(
  id: string,
  progress: number
): Promise<ServiceResult<Enrollment>> {
  try {
    const { data, error } = await client()
      .from('enrollments')
      .update({ progress, progress_pct: progress, last_accessed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Enrollment not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Enrollment);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getLessonProgress(userId: string, courseId: string): Promise<ServiceResult<LessonProgress[]>> {
  try {
    const { data, error } = await client()
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as LessonProgress[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function upsertLessonProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  isCompleted: boolean,
  score?: number
): Promise<ServiceResult<LessonProgress>> {
  try {
    const record: Record<string, unknown> = {
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      score: score ?? null,
      time_spent_seconds: null,
    };
    const { data, error } = await client()
      .from('lesson_progress')
      .upsert(record)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to save progress', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as LessonProgress);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getAllEnrollments(query?: ListQuery): Promise<ServiceResult<Enrollment[]>> {
  try {
    let builder = client().from('enrollments').select('*');
    if (query?.filter?.status) {
      builder = builder.eq('status', query.filter.status);
    }
    if (query?.orderBy) {
      builder = builder.order(query.orderBy, { ascending: query.ascending !== false });
    }
    if (query?.limit) {
      builder = builder.limit(query.limit);
    }
    const { data, error } = await builder;
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Enrollment[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getEnrollmentsByCourseIds(courseIds: string[]): Promise<ServiceResult<Enrollment[]>> {
  try {
    const { data, error } = await client()
      .from('enrollments')
      .select('*')
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Enrollment[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getLessonProgressByCourseIds(courseIds: string[]): Promise<ServiceResult<LessonProgress[]>> {
  try {
    const { data, error } = await client()
      .from('lesson_progress')
      .select('*')
      .in('course_id', courseIds);
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as LessonProgress[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}
