import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, supabaseAnonKey } from '../../lib/supabase';
const DEMO_EMAIL = 'admin@mojodojo.com';
const DEMO_PASSWORD = 'admin123';
const DEMO_STORAGE_KEY = 'mojodojo.demo.user';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'owner' | 'worker' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (roles: Array<User['role']>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  function getStoredDemoUser(): User | null {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const demoUser = getStoredDemoUser();
      if (demoUser) {
        setUser(demoUser);
        setAccessToken(supabaseAnonKey);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role || 'user',
        });
        setAccessToken(session.access_token);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<User> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      if (normalizedEmail === DEMO_EMAIL && normalizedPassword === DEMO_PASSWORD) {
        const demoUser: User = {
          id: 'demo-admin',
          email: DEMO_EMAIL,
          name: 'Demo Admin',
          role: 'admin',
        };

        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        setAccessToken(supabaseAnonKey);
        return demoUser;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (error) throw error;

      if (data.session?.user) {
        const signedInUser: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name,
          role: data.session.user.user_metadata?.role || 'user',
        };
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
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setUser(null);
      setAccessToken(null);
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  function hasRole(roles: Array<User['role']>) {
    if (!user?.role) {
      return false;
    }
    return roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signInWithGoogle, signOut, hasRole }}>
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