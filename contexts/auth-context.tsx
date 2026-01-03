'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { DemoUser } from '@/types/user';
import { getFeatureAccess, type FeatureAccess } from '@/lib/feature-access';

// Demo user for testing only - use loginWithDemo() explicitly
const DEMO_USER: DemoUser = {
  id: 'demo_user_001',
  email: 'demo@blogspy.io',
  name: 'Demo User',
  plan: 'PRO',
  credits: 999,
};

interface AuthContextType {
  user: SupabaseUser | DemoUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  featureAccess: FeatureAccess;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithDemo: () => void;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  // Calculate feature access based on auth state
  const featureAccess = useMemo(() => {
    return getFeatureAccess(!!user, isDemoMode);
  }, [user, isDemoMode]);

  // Derived authentication state - user exists and not in demo mode means real auth
  const isAuthenticated = useMemo(() => {
    return !!user;
  }, [user]);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check for demo user first (for development convenience)
        const demoUserData = localStorage.getItem('demo_user');
        if (demoUserData) {
          setUser(JSON.parse(demoUserData));
          setIsDemoMode(true);
          setIsLoading(false);
          return;
        }

        // Get real Supabase session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsDemoMode(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsDemoMode(false);
          // Clear any demo user data when real auth happens
          localStorage.removeItem('demo_user');
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsDemoMode(false);
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error.message);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsDemoMode(false);
        return { success: true };
      }

      return { success: false, error: 'Login failed - no session returned' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const loginWithDemo = useCallback(() => {
    localStorage.setItem('demo_user', JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
    setSession(null);
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear demo mode
      localStorage.removeItem('demo_user');
      
      // Sign out from Supabase (if not in demo mode)
      if (!isDemoMode && session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
        }
      }
      
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, isDemoMode, session]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        console.error('Registration failed:', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Note: User may need to verify email before session is active
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setIsDemoMode(false);
        }
        return { success: true };
      }

      return { success: false, error: 'Registration failed - no user returned' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    isDemoMode,
    featureAccess,
    login,
    loginWithDemo,
    logout,
    register,
  };

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

export { AuthContext };
