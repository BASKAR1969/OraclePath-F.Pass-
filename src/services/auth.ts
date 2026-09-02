// ============================================================
// OraclePath — Auth Service
// Parent: Ervion Technologies
// Wraps Supabase auth operations. Returns typed ServiceResult.
// ============================================================

import { getServiceClient } from './adapter';
import { wrapError, successResult, errorResult, ErrorCodes, type ServiceResult } from '../lib/errors';
import type { AuthUser, Profile } from '../types/domain';

const client = () => getServiceClient();

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<ServiceResult<AuthUser>> {
  try {
    const { data, error } = await client().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.user) return errorResult(wrapError('No user returned', ErrorCodes.UNKNOWN));
    return successResult(data.user as AuthUser);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.AUTH_INVALID_CREDENTIALS));
  }
}

export async function signIn(email: string, password: string): Promise<ServiceResult<AuthUser>> {
  try {
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) return errorResult(wrapError('No user returned', ErrorCodes.UNKNOWN));
    return successResult(data.user as AuthUser);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.AUTH_INVALID_CREDENTIALS));
  }
}

export async function signOut(): Promise<ServiceResult<null>> {
  try {
    const { error } = await client().auth.signOut();
    if (error) throw error;
    return successResult(null);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.UNKNOWN));
  }
}

export async function getCurrentUser(): Promise<ServiceResult<AuthUser>> {
  try {
    const { data, error } = await client().auth.getUser();
    if (error) throw error;
    if (!data.user) return errorResult(wrapError('No session', ErrorCodes.AUTH_UNAUTHORIZED));
    return successResult(data.user as AuthUser);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.AUTH_UNAUTHORIZED));
  }
}

export async function fetchProfile(userId: string): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await client()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    if (!data) return errorResult(wrapError('Profile not found', ErrorCodes.DB_NOT_FOUND));
    return successResult(data as unknown as Profile);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updateUserMetadata(data: Record<string, unknown>): Promise<ServiceResult<AuthUser>> {
  try {
    const { data: userData, error } = await client().auth.updateUser({ data });
    if (error) throw error;
    if (!userData.user) return errorResult(wrapError('No user returned', ErrorCodes.UNKNOWN));
    return successResult(userData.user as AuthUser);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.DB_QUERY_FAILED));
  }
}

export async function updatePassword(password: string): Promise<ServiceResult<AuthUser>> {
  try {
    const { data, error } = await client().auth.updateUser({ password });
    if (error) throw error;
    if (!data.user) return errorResult(wrapError('No user returned', ErrorCodes.UNKNOWN));
    return successResult(data.user as AuthUser);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.AUTH_INVALID_CREDENTIALS));
  }
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  try {
    return client().auth.onAuthStateChange(callback);
  } catch {
    // Adapter is dead — return a no-op subscription so React initialization survives
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
      unsubscribe: () => {},
    };
  }
}

export async function resetPasswordForEmail(email: string): Promise<ServiceResult<null>> {
  try {
    const { error } = await client().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return successResult(null);
  } catch (err) {
    return errorResult(wrapError(err, ErrorCodes.UNKNOWN));
  }
}
