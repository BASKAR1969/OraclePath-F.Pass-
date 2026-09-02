// ============================================================
// OraclePath — Course Service
// Parent: Ervion Technologies
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, emptyResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { Course, CourseLesson, CourseModule, ListQuery } from '../types/domain';

const client = () => getServiceClient();

export async function getAllCourses(query?: ListQuery): Promise<ServiceResult<Course[]>> {
  try {
    let builder = client().from('courses').select('*');
    if (query?.filter?.status) {
      builder = builder.eq('status', query.filter.status);
    }
    if (query?.filter?.featured === true) {
      builder = builder.eq('featured', true);
    }
    if (query?.filter?.level) {
      builder = builder.eq('level', query.filter.level);
    }
    if (query?.search) {
      builder = builder.ilike('title', `%${query.search}%`);
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
    return successResult(data as unknown as Course[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCourseById(id: string): Promise<ServiceResult<Course>> {
  try {
    const { data, error } = await client().from('courses').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Course not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Course);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function createCourse(course: Partial<Course>): Promise<ServiceResult<Course>> {
  try {
    const { data, error } = await client().from('courses').insert(course as Record<string, unknown>).select().single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to create course', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as Course);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<ServiceResult<Course>> {
  try {
    const { data, error } = await client().from('courses').update(course as Record<string, unknown>).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Course not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Course);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function deleteCourse(id: string): Promise<ServiceResult<null>> {
  try {
    const { error } = await client().from('courses').delete().eq('id', id);
    if (error) throw error;
    return successResult(null);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCourseLessons(courseId: string): Promise<ServiceResult<CourseLesson[]>> {
  try {
    const { data, error } = await client()
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as CourseLesson[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCourseModules(courseId: string): Promise<ServiceResult<CourseModule[]>> {
  try {
    const { data, error } = await client()
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as CourseModule[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCoursesByInstructorId(instructorId: string): Promise<ServiceResult<Course[]>> {
  try {
    const { data, error } = await client()
      .from('courses')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Course[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCourseLessonsByCourseIds(courseIds: string[]): Promise<ServiceResult<CourseLesson[]>> {
  try {
    const { data, error } = await client()
      .from('lessons')
      .select('*')
      .in('course_id', courseIds)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as CourseLesson[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}
