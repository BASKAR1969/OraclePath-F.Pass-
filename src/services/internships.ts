// ============================================================
// OraclePath — Internship Service
// Parent: Ervion Technologies
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, emptyResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { Internship, InternshipApplication, ListQuery } from '../types/domain';

const client = () => getServiceClient();

export async function getAllInternships(query?: ListQuery): Promise<ServiceResult<Internship[]>> {
  try {
    let builder = client().from('internships').select('*');
    if (query?.filter?.status) {
      builder = builder.eq('status', query.filter.status);
    }
    if (query?.filter?.type) {
      builder = builder.eq('type', query.filter.type);
    }
    if (query?.search) {
      builder = builder.or(`title.ilike.%${query.search}%,company.ilike.%${query.search}%`);
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
    return successResult(data as unknown as Internship[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getInternshipById(id: string): Promise<ServiceResult<Internship>> {
  try {
    const { data, error } = await client().from('internships').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Internship not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Internship);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function createInternship(internship: Partial<Internship>): Promise<ServiceResult<Internship>> {
  try {
    const { data, error } = await client()
      .from('internships')
      .insert(internship as Record<string, unknown>)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to create internship', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as Internship);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updateInternship(id: string, updates: Partial<Internship>): Promise<ServiceResult<Internship>> {
  try {
    const { data, error } = await client()
      .from('internships')
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Internship not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Internship);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function deleteInternship(id: string): Promise<ServiceResult<null>> {
  try {
    const { error } = await client().from('internships').delete().eq('id', id);
    if (error) throw error;
    return successResult(null);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getUserApplications(userId: string): Promise<ServiceResult<InternshipApplication[]>> {
  try {
    const { data, error } = await client()
      .from('internship_applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as InternshipApplication[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getAllApplications(query?: ListQuery): Promise<ServiceResult<InternshipApplication[]>> {
  try {
    let builder = client().from('internship_applications').select('*');
    if (query?.filter?.status) {
      builder = builder.eq('status', query.filter.status);
    }
    if (query?.orderBy) {
      builder = builder.order(query.orderBy, { ascending: query.ascending !== false });
    }
    const { data, error } = await builder;
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as InternshipApplication[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function createApplication(
  application: Partial<InternshipApplication>
): Promise<ServiceResult<InternshipApplication>> {
  try {
    const { data, error } = await client()
      .from('internship_applications')
      .insert(application as Record<string, unknown>)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to create application', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as InternshipApplication);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<ServiceResult<InternshipApplication>> {
  try {
    const { data, error } = await client()
      .from('internship_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Application not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as InternshipApplication);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}
