// ============================================================
// OraclePath — Order Service
// Parent: Ervion Technologies
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, emptyResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { Order, ListQuery } from '../types/domain';

const client = () => getServiceClient();

export async function getUserOrders(userId: string): Promise<ServiceResult<Order[]>> {
  try {
    const { data, error } = await client()
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return emptyResult();
    return successResult(data as unknown as Order[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getOrderById(id: string): Promise<ServiceResult<Order>> {
  try {
    const { data, error } = await client()
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Order not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Order);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function createOrder(order: Partial<Order>): Promise<ServiceResult<Order>> {
  try {
    const { data, error } = await client()
      .from('orders')
      .insert(order as Record<string, unknown>)
      .select()
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Failed to create order', ErrorCodes.DB_QUERY_FAILED));
    return successResult(data as unknown as Order);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function getAllOrders(query?: ListQuery): Promise<ServiceResult<Order[]>> {
  try {
    let builder = client().from('orders').select('*');
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
    return successResult(data as unknown as Order[]);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `OP-${timestamp}`;
}

export async function getTotalRevenue(): Promise<ServiceResult<number>> {
  try {
    const { data, error } = await client()
      .from('orders')
      .select('total')
      .eq('status', 'completed');
    if (error) throw error;
    const total = (data || []).reduce((sum: number, row: unknown) => {
      const r = row as { total: number };
      return sum + (r.total || 0);
    }, 0);
    return successResult(total);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}
