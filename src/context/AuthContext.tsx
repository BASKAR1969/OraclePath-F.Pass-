// ============================================================
// OraclePath — Auth Context
// Parent: Ervion Technologies
// Uses the auth service layer. No direct Supabase imports.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '../services';
import type { Profile, AuthUser, UserRole } from '../types/domain';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInstructor: boolean;
  isManager: boolean;
  isStudent: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const result = await authService.fetchProfile(userId);
    if (result.data && !result.error) {
      setProfile(result.data);
    } else {
      console.warn('[AuthContext] Failed to fetch profile:', result.error?.message);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const result = await authService.getCurrentUser();
      if (mounted) {
        if (result.data && !result.error) {
          setUser(result.data);
          await loadProfile(result.data.id);
        }
        setIsLoading(false);
      }
    };

    init();

    let stateChangeResult: { data?: { subscription?: { unsubscribe: () => void } }; unsubscribe?: () => void } | undefined;
    try {
      stateChangeResult = authService.onAuthStateChange(async (event: string, session: unknown) => {
        if (!mounted) return;
        const sessionUser = (session as { user: AuthUser } | null)?.user as AuthUser | undefined;
        setUser(sessionUser || null);
        if (sessionUser?.id) {
          await loadProfile(sessionUser.id);
        } else {
          setProfile(null);
        }
      });
    } catch (err) {
      console.warn('[AuthContext] Auth state change unavailable:', err);
    }

    const subscription = stateChangeResult?.data?.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [loadProfile]);

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    const result = await authService.signUp(email, password, fullName);
    if (result.error) {
      return { error: result.error.message };
    }
    if (result.data) {
      setUser(result.data);
      await loadProfile(result.data.id);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const result = await authService.signIn(email, password);
    if (result.error) {
      return { error: result.error.message };
    }
    if (result.data) {
      setUser(result.data);
      await loadProfile(result.data.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user?.id) return { error: 'Not authenticated' };
    const result = await authService.updateUserMetadata(data as Record<string, unknown>);
    if (result.error) {
      return { error: result.error.message };
    }
    await refreshProfile();
    return { error: null };
  };

  const role = profile?.role || null;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isInstructor = role === 'instructor' || isAdmin;
  const isManager = role === 'manager' || isAdmin;
  const isStudent = role === 'student' || !role;

  return (
    <AuthContext.Provider
      value={{
        user, profile, isLoading, role,
        isAdmin, isSuperAdmin, isInstructor, isManager, isStudent,
        signUp, signIn, signOut, updateProfile, refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
