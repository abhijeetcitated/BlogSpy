'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import type { UserCredits, UserProfile, NotificationSettings } from '@/types/user';

// Demo data
const DEMO_CREDITS: UserCredits = {
  total: 2000,
  used: 150,
  remaining: 1850,
  resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
};

const DEMO_NOTIFICATIONS: NotificationSettings = {
  email: true,
  rankingAlerts: true,
  weeklyReport: true,
  productUpdates: false,
};

interface UserContextType {
  profile: UserProfile | null;
  credits: UserCredits;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  updateNotifications: (settings: NotificationSettings) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
  useCredits: (amount: number) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits>(DEMO_CREDITS);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (isDemoMode) {
          // Use demo profile
          setProfile({
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
            company: 'Demo Company',
            website: 'https://example.com',
            timezone: 'America/New_York',
            notifications: DEMO_NOTIFICATIONS,
          } as UserProfile);
          setCredits(DEMO_CREDITS);
        } else {
          // In production, fetch from API
          // const response = await api.get<UserProfile>('/api/user/profile');
          // if (response.success && response.data) {
          //   setProfile(response.data);
          // }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, isDemoMode]);

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;

    try {
      // In demo mode, just update local state
      if (isDemoMode) {
        setProfile({ ...profile, ...data, updatedAt: new Date() });
        return true;
      }

      // In production, call API
      // const response = await api.patch<UserProfile>('/api/user/profile', data);
      // if (response.success && response.data) {
      //   setProfile(response.data);
      //   return true;
      // }
      return false;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  const updateNotifications = async (settings: NotificationSettings): Promise<boolean> => {
    if (!profile) return false;

    try {
      // In demo mode, just update local state
      if (isDemoMode) {
        setProfile({ ...profile, notifications: settings, updatedAt: new Date() });
        return true;
      }

      // In production, call API
      return false;
    } catch (error) {
      console.error('Failed to update notifications:', error);
      return false;
    }
  };

  const refreshCredits = async (): Promise<void> => {
    if (isDemoMode) {
      // Reset demo credits
      setCredits(DEMO_CREDITS);
      return;
    }

    // In production, fetch from API
    // const response = await api.get<UserCredits>('/api/user/credits');
    // if (response.success && response.data) {
    //   setCredits(response.data);
    // }
  };

  const useCredits = (amount: number): boolean => {
    if (credits.remaining < amount) {
      return false;
    }

    setCredits(prev => ({
      ...prev,
      used: prev.used + amount,
      remaining: prev.remaining - amount,
    }));

    return true;
  };

  const value: UserContextType = {
    profile,
    credits,
    isLoading,
    updateProfile,
    updateNotifications,
    refreshCredits,
    useCredits,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { UserContext };
