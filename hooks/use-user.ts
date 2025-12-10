'use client';

import { useUser } from '@/contexts/user-context';

// Re-export the useUser hook for convenience
export { useUser };

// Credit utilities
export function useCredits() {
  const { credits, useCredits, refreshCredits } = useUser();

  const hasEnoughCredits = (amount: number): boolean => {
    return credits.remaining >= amount;
  };

  const creditPercentage = (): number => {
    if (credits.total === 0) return 0;
    return Math.round((credits.remaining / credits.total) * 100);
  };

  const daysUntilReset = (): number => {
    const now = new Date();
    const resetDate = new Date(credits.resetDate);
    const diff = resetDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    credits,
    hasEnoughCredits,
    creditPercentage,
    daysUntilReset,
    useCredits,
    refreshCredits,
  };
}

// Profile utilities
export function useProfile() {
  const { profile, updateProfile, updateNotifications, isLoading } = useUser();

  return {
    profile,
    updateProfile,
    updateNotifications,
    isLoading,
    displayName: profile?.name || 'User',
    email: profile?.email || '',
    plan: profile?.plan || 'FREE',
  };
}
