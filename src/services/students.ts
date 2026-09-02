// ============================================================
// OraclePath — Student Service
// Parent: Ervion Technologies
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, emptyResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { Profile, ListQuery } from '../types/domain';

const client = () => getServiceClient();

export async function getAllStudents(query?: ListQuery): Promise<ServiceResult<Profile[]>> {
  try {
    let builder = client().from('profiles').select('*').eq('role', 'student');
    if (query?.search) {
      builder = builder.ilike('full_name', `%${query.search}%`);
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
    return successResult(data as unknown as Profile[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getStudentById(id: string): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await client()
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'student')
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Student not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Profile);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getAllInstructors(): Promise<ServiceResult<Profile[]>> {
  try {
    const { data, error } = await client()
      .from('profiles')
      .select('*')
      .eq('role', 'instructor')
      .order('full_name', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Profile[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getAllProfiles(): Promise<ServiceResult<Profile[]>> {
  try {
    const { data, error } = await client().from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Profile[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await client()
      .from('profiles')
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Profile not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Profile);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getStudentCount(): Promise<ServiceResult<number>> {
  try {
    const { count, error } = await client()
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    if (error) throw error;
    return successResult(count || 0);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getStudentsByIds(ids: string[]): Promise<ServiceResult<Profile[]>> {
  try {
    const { data, error } = await client()
      .from('profiles')
      .select('*')
      .in('id', ids);
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Profile[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}
