'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import type { UserCredits, UserProfile, NotificationSettings } from '@/types/user';
import {
  fetchUserAction,
  updateProfileAction,
  updateNotificationsAction,
} from '@/src/features/settings/actions/user-actions';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { DemoUser } from '@/types/user';

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES (used only when no data is available)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CREDITS: UserCredits = {
  total: 0,
  used: 0,
  remaining: 0,
  resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email: true,
  rankingAlerts: true,
  weeklyReport: true,
  productUpdates: false,
};

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER: Extract user data from SupabaseUser or DemoUser
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function extractUserData(authUser: SupabaseUser | DemoUser) {
  // Check if it's a DemoUser (has 'name' property directly)
  if ('name' in authUser && typeof authUser.name === 'string') {
    const demoUser = authUser as DemoUser;
    return {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      avatar: undefined,
      plan: demoUser.plan,
      credits: demoUser.credits,
    };
  }
  
  // It's a SupabaseUser
  const supaUser = authUser as SupabaseUser;
  return {
    id: supaUser.id,
    email: supaUser.email || '',
    name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
    avatar: supaUser.user_metadata?.avatar_url,
    plan: 'FREE' as const,
    credits: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT TYPE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface UserContextType {
  profile: UserProfile | null;
  credits: UserCredits;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  updateNotifications: (settings: NotificationSettings) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  useCredits: (amount: number) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// USER PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isDemoMode } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits>(DEFAULT_CREDITS);
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // FETCH PROFILE FROM SERVER
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Call the server action to fetch real user data
      const result = await fetchUserAction({});

      if (result?.data?.success && result.data.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = result.data.data as any;

        // Build profile from server data
        const serverProfile: UserProfile = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatarUrl || undefined,
          plan: userData.plan || 'FREE',
          credits: userData.credits || 0,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          updatedAt: new Date(),
          company: userData.company || '',
          website: userData.website || '',
          timezone: userData.timezone || 'America/New_York',
          notifications: userData.notifications || DEFAULT_NOTIFICATIONS,
        };

        setProfile(serverProfile);

        // Update credits from server
        setCredits({
          total: userData.credits || 1000,
          used: 0,
          remaining: userData.credits || 1000,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      } else {
        // Fallback: Use auth user data if server fetch fails
        console.warn('[UserContext] Server fetch failed, using auth user data');
        const fallbackData = extractUserData(user);
        setProfile({
          id: fallbackData.id,
          email: fallbackData.email,
          name: fallbackData.name,
          avatar: fallbackData.avatar,
          plan: fallbackData.plan,
          credits: fallbackData.credits,
          createdAt: new Date(),
          updatedAt: new Date(),
          company: '',
          website: '',
          timezone: 'America/New_York',
          notifications: DEFAULT_NOTIFICATIONS,
        });
      }
    } catch (error) {
      console.error('[UserContext] Failed to load profile:', error);
      // Fallback to auth user data on error
      if (user) {
        const fallbackData = extractUserData(user);
        setProfile({
          id: fallbackData.id,
          email: fallbackData.email,
          name: fallbackData.name,
          avatar: fallbackData.avatar,
          plan: fallbackData.plan,
          credits: fallbackData.credits,
          createdAt: new Date(),
          updatedAt: new Date(),
          company: '',
          website: '',
          timezone: 'America/New_York',
          notifications: DEFAULT_NOTIFICATIONS,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // LOAD PROFILE ON AUTH CHANGE
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;

    try {
      // Call server action to persist changes
      const result = await updateProfileAction({
        name: data.name || profile.name,
        company: data.company,
        website: data.website,
        timezone: data.timezone,
      });

      if (result?.data?.success) {
        // Update local state with server response
        setProfile(prev => prev ? {
          ...prev,
          ...data,
          updatedAt: new Date(),
        } : null);
        return true;
      }

      console.error('[UserContext] Update failed:', result?.data?.error);
      return false;
    } catch (error) {
      console.error('[UserContext] Failed to update profile:', error);
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // UPDATE NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  const updateNotifications = async (settings: NotificationSettings): Promise<boolean> => {
    if (!profile) return false;

    try {
      // Call server action to persist notification settings
      const result = await updateNotificationsAction(settings);

      if (result?.data?.success) {
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          notifications: settings,
          updatedAt: new Date(),
        } : null);
        return true;
      }

      console.error('[UserContext] Notifications update failed:', result?.data?.error);
      return false;
    } catch (error) {
      console.error('[UserContext] Failed to update notifications:', error);
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // CREDITS MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  const refreshCredits = async (): Promise<void> => {
    // Credits are refreshed as part of profile fetch
    await refreshProfile();
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

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  const value: UserContextType = {
    profile,
    credits,
    isLoading,
    updateProfile,
    updateNotifications,
    refreshProfile,
    refreshCredits,
    useCredits,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { UserContext };
