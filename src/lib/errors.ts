// ============================================================
// OraclePath — Error Handling Framework
// Parent: Ervion Technologies
// Consistent application-level error handling. No sensitive data.
// ============================================================

import type { AppError, ServiceResult } from '../types/domain';

export const ErrorCodes = Object.freeze({
  // Auth
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',

  // Database
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  DB_CONFLICT: 'DB_CONFLICT',
  DB_VALIDATION: 'DB_VALIDATION',

  // Network
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',

  // Business logic
  BUSINESS_INVALID_STATE: 'BUSINESS_INVALID_STATE',
  BUSINESS_NOT_ALLOWED: 'BUSINESS_NOT_ALLOWED',
  BUSINESS_LIMIT_REACHED: 'BUSINESS_LIMIT_REACHED',

  // Configuration
  CONFIG_MISSING: 'CONFIG_MISSING',
  CONFIG_INVALID: 'CONFIG_INVALID',

  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const);

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

const USER_SAFE_MESSAGES: Record<string, string> = {
  [ErrorCodes.AUTH_UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCodes.AUTH_FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCodes.DB_CONNECTION_FAILED]: 'Unable to connect to the server. Please try again later.',
  [ErrorCodes.DB_QUERY_FAILED]: 'Something went wrong loading data. Please refresh the page.',
  [ErrorCodes.DB_NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.DB_CONFLICT]: 'This action conflicts with an existing record.',
  [ErrorCodes.DB_VALIDATION]: 'Some information is invalid. Please check and try again.',
  [ErrorCodes.NETWORK_OFFLINE]: 'You appear to be offline. Please check your connection.',
  [ErrorCodes.NETWORK_TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCodes.NETWORK_SERVER_ERROR]: 'A server error occurred. Please try again later.',
  [ErrorCodes.BUSINESS_INVALID_STATE]: 'This action cannot be completed at this time.',
  [ErrorCodes.BUSINESS_NOT_ALLOWED]: 'This action is not allowed.',
  [ErrorCodes.BUSINESS_LIMIT_REACHED]: 'You have reached the limit for this action.',
  [ErrorCodes.CONFIG_MISSING]: 'Application configuration is incomplete.',
  [ErrorCodes.CONFIG_INVALID]: 'Application configuration is invalid.',
  [ErrorCodes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

export function createError(
  code: ErrorCode,
  internalMessage: string,
  options?: {
    details?: string;
    httpStatus?: number;
    isRetryable?: boolean;
  }
): AppError {
  return {
    code,
    message: USER_SAFE_MESSAGES[code] || USER_SAFE_MESSAGES[ErrorCodes.UNKNOWN],
    details: options?.details,
    httpStatus: options?.httpStatus,
    isRetryable: options?.isRetryable ?? false,
  };
}

export function wrapError(error: unknown, fallbackCode: ErrorCode = ErrorCodes.UNKNOWN): AppError {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;

    // Supabase error shape
    if (e.message && typeof e.message === 'string') {
      const msg = e.message as string;
      if (msg.includes('connection') || msg.includes('timeout')) {
        return createError(ErrorCodes.DB_CONNECTION_FAILED, msg, { isRetryable: true });
      }
      if (msg.includes('not found') || msg.includes('Not found')) {
        return createError(ErrorCodes.DB_NOT_FOUND, msg);
      }
      if (msg.includes('unauthorized') || msg.includes('Unauthorized')) {
        return createError(ErrorCodes.AUTH_UNAUTHORIZED, msg, { httpStatus: 401 });
      }
      if (msg.includes('forbidden') || msg.includes('Forbidden')) {
        return createError(ErrorCodes.AUTH_FORBIDDEN, msg, { httpStatus: 403 });
      }
      if (msg.includes('duplicate') || msg.includes('conflict')) {
        return createError(ErrorCodes.DB_CONFLICT, msg, { httpStatus: 409 });
      }
      if (msg.includes('validation') || msg.includes('Validation')) {
        return createError(ErrorCodes.DB_VALIDATION, msg, { httpStatus: 422 });
      }
      return createError(fallbackCode, msg, { details: e.code as string | undefined });
    }
  }

  return createError(fallbackCode, String(error || 'Unknown error'));
}

export function successResult<T>(data: T): ServiceResult<T> {
  return { data, error: null, status: 'success' };
}

export function emptyResult<T>(): ServiceResult<T> {
  return { data: null, error: null, status: 'empty' };
}

export function errorResult<T>(error: AppError): ServiceResult<T> {
  return { data: null, error, status: 'error' };
}

export function loadingResult<T>(): ServiceResult<T> {
  return { data: null, error: null, status: 'loading' };
}

export function isRetryableError(error: AppError): boolean {
  return error.isRetryable;
}

export function isAuthError(error: AppError): boolean {
  return (
    error.code === ErrorCodes.AUTH_UNAUTHORIZED ||
    error.code === ErrorCodes.AUTH_FORBIDDEN ||
    error.code === ErrorCodes.AUTH_SESSION_EXPIRED
  );
}

export function isNotFoundError(error: AppError): boolean {
  return error.code === ErrorCodes.DB_NOT_FOUND;
}

// Re-export domain types for downstream consumers
export type { ServiceResult, AppError, ListQuery, PaginatedResult } from '../types/domain';
