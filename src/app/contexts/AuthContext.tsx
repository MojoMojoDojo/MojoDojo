import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase, type UserRole } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  isAuthenticated: boolean;
  authIssue: string | null;
  mfaReady: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authIssue, setAuthIssue] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;

  function devLog(label: string, payload?: unknown) {
    if (!isDev) return;
    console.log(`[auth] ${label}`, payload ?? '');
  }

  function normalizeRole(rawRole: string | null | undefined): UserRole {
    if (rawRole === 'admin' || rawRole === 'worker') {
      return rawRole;
    }
    return 'worker';
  }

  async function fetchRoleFromProfile(authUser: SupabaseAuthUser): Promise<UserRole> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    devLog('current user id', authUser.id);
    devLog('fetched profile row', data ?? null);
    if (error) {
      devLog('profile fetch ERROR', error.message);
    }

    if (!error && data?.role) {
      const resolvedRole = normalizeRole(data.role);
      devLog('resolved role', resolvedRole);

      if (data.role !== 'admin' && data.role !== 'worker') {
        setAuthIssue(`Invalid profile role "${String(data.role)}". Falling back to "${resolvedRole}".`);
      } else {
        setAuthIssue(null);
      }

      return resolvedRole;
    }

    if (!data?.role) {
      const msg = `Profile exists but role is ${data === null ? 'null' : 'missing'}. Falling back to user metadata.`;
      devLog('profile role issue', msg);
      setAuthIssue(msg);
    }

    const fallbackRole = normalizeRole((authUser.user_metadata?.role as string | undefined) ?? undefined);
    devLog('fallback role from metadata', { metadata: authUser.user_metadata?.role, resolved: fallbackRole });
    return fallbackRole;
  }

  async function mapUser(authUser: SupabaseAuthUser): Promise<User> {
    const role = await fetchRoleFromProfile(authUser);
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name,
      role,
    };
  }

  async function applySession(session: Session | null) {
    devLog('session state', {
      hasSession: !!session,
      hasUser: !!session?.user,
    });

    if (!session?.user) {
      setUser(null);
      setAccessToken(null);
      setAuthIssue(null);
      return;
    }

    const mapped = await mapUser(session.user);
    setUser(mapped);
    setAccessToken(session.access_token);
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await applySession(session);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        await applySession(session);
      } catch (error) {
        console.error('Auth state change handling error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<User> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (error) throw error;

      if (data.session?.user) {
        const signedInUser = await mapUser(data.session.user);
        setUser(signedInUser);
        setAccessToken(data.session.access_token);
        return signedInUser;
      }

      throw new Error('Sign in failed');
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Google sign in failed');
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  function hasRole(roles: UserRole[]) {
    if (!user) return false;
    return roles.includes(user.role);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      accessToken,
      isAuthenticated: !!user,
      authIssue,
      // Placeholder to keep auth flow MFA-friendly for future rollout.
      mfaReady: true,
      signIn,
      signInWithGoogle,
      signOut,
      hasRole,
    }),
    [user, loading, accessToken, authIssue],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}