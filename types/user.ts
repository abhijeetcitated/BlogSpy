// User Types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: UserPlan;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface UserProfile extends User {
  company?: string;
  website?: string;
  timezone?: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  rankingAlerts: boolean;
  weeklyReport: boolean;
  productUpdates: boolean;
}

export interface UserCredits {
  total: number;
  used: number;
  remaining: number;
  resetDate: Date;
}

export interface UserSession {
  user: User;
  accessToken: string;
  expiresAt: Date;
}

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  credits: number;
}

// Demo user constant
export const DEMO_USER: DemoUser = {
  id: 'demo_user_001',
  email: 'demo@blogspy.io',
  name: 'Demo User',
  plan: 'PRO',
  credits: 999,
};
