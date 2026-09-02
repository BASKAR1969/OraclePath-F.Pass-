// ============================================================
// OraclePath — Certificate Service
// Parent: Ervion Technologies
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, emptyResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { Certificate, ListQuery } from '../types/domain';

const client = () => getServiceClient();

export async function getUserCertificates(userId: string): Promise<ServiceResult<Certificate[]>> {
  try {
    const { data, error } = await client()
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Certificate[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCertificateById(id: string): Promise<ServiceResult<Certificate>> {
  try {
    const { data, error } = await client()
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Certificate not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Certificate);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getCertificateByNumber(number: string): Promise<ServiceResult<Certificate>> {
  try {
    const { data, error } = await client()
      .from('certificates')
      .select('*')
      .eq('certificate_number', number)
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Certificate not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Certificate);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function createCertificate(
  userId: string,
  courseId: string,
  certNumber: string
): Promise<ServiceResult<Certificate>> {
  try {
    const record = {
      user_id: userId,
      course_id: courseId,
      certificate_number: certNumber,
      status: 'active',
      issued_at: new Date().toISOString(),
    };
    const { data, error } = await client()
      .from('certificates')
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to create certificate', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as Certificate);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getAllCertificates(query?: ListQuery): Promise<ServiceResult<Certificate[]>> {
  try {
    let builder = client().from('certificates').select('*');
    if (query?.orderBy) {
      builder = builder.order(query.orderBy, { ascending: query.ascending !== false });
    }
    if (query?.limit) {
      builder = builder.limit(query.limit);
    }
    const { data, error } = await builder;
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Certificate[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OP-${year}-${random}`;
}
