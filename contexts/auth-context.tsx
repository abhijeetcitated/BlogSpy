'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, DemoUser } from '@/types/user';

// Demo user for testing
const DEMO_USER: DemoUser = {
  id: 'demo_user_001',
  email: 'demo@blogspy.io',
  name: 'Demo User',
  plan: 'PRO',
  credits: 999,
};

interface AuthContextType {
  user: User | DemoUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithDemo: () => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for demo user first
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
          setIsDemoMode(true);
          setIsLoading(false);
          return;
        }

        // Check for real auth token
        const authToken = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (authToken && userData) {
          setUser(JSON.parse(userData));
          setIsDemoMode(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For now, just use demo mode
      // In production, this would call the real API
      console.log('Login attempt:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, accept any login
      loginWithDemo();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithDemo = useCallback(() => {
    localStorage.setItem('demo_user', JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('demo_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsDemoMode(false);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For now, just use demo mode
      console.log('Register attempt:', { name, email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, auto-login after register
      loginWithDemo();
      return true;
    } catch (error) {
      console.error('Register failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithDemo]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isDemoMode,
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
