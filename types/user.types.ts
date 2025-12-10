// ============================================
// USER & AUTH TYPES
// ============================================
// Types for user management and authentication
// ============================================

// User Plan
export type UserPlan = "free" | "pro" | "agency"

// User Interface
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: UserPlan
  credits: number
  maxCredits: number
  createdAt: string
  updatedAt: string
}

// User Preferences
export interface UserPreferences {
  theme: "light" | "dark" | "system"
  emailNotifications: boolean
  weeklyReport: boolean
  rankAlerts: boolean
  trendAlerts: boolean
  defaultLocation: string
  defaultLanguage: string
}

// User with Preferences
export interface UserWithPreferences extends User {
  preferences: UserPreferences
}

// Credit Transaction
export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: "usage" | "purchase" | "bonus" | "refund"
  feature: string
  description: string
  timestamp: string
  balanceAfter: number
}

// Credit Usage Summary
export interface CreditUsageSummary {
  totalUsed: number
  totalPurchased: number
  currentBalance: number
  usageByFeature: {
    feature: string
    amount: number
    percentage: number
  }[]
}

// Subscription
export interface Subscription {
  id: string
  userId: string
  plan: UserPlan
  status: "active" | "canceled" | "past_due" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

// Auth Session
export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Login Credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Register Data
export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}
