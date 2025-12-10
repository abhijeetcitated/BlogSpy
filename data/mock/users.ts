/**
 * Mock Users Data
 * Sample user data for development and testing
 */

export interface MockUser {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
  credits: number
  createdAt: string
  lastLogin: string
  settings: {
    emailNotifications: boolean
    weeklyReport: boolean
    theme: "light" | "dark" | "system"
    defaultLocation: string
    defaultLanguage: string
  }
}

export const mockUsers: MockUser[] = [
  {
    id: "user_demo",
    email: "demo@blogspy.io",
    name: "Demo User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    plan: "pro",
    credits: 450,
    createdAt: "2023-06-15T10:30:00Z",
    lastLogin: new Date().toISOString(),
    settings: {
      emailNotifications: true,
      weeklyReport: true,
      theme: "dark",
      defaultLocation: "US",
      defaultLanguage: "en",
    },
  },
  {
    id: "user_1",
    email: "john@example.com",
    name: "John Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    plan: "free",
    credits: 35,
    createdAt: "2024-01-05T14:20:00Z",
    lastLogin: "2024-01-14T09:15:00Z",
    settings: {
      emailNotifications: true,
      weeklyReport: false,
      theme: "system",
      defaultLocation: "US",
      defaultLanguage: "en",
    },
  },
  {
    id: "user_2",
    email: "sarah@techblog.io",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    plan: "pro",
    credits: 380,
    createdAt: "2023-09-20T08:45:00Z",
    lastLogin: "2024-01-15T16:30:00Z",
    settings: {
      emailNotifications: true,
      weeklyReport: true,
      theme: "dark",
      defaultLocation: "GB",
      defaultLanguage: "en",
    },
  },
  {
    id: "user_3",
    email: "mike@enterprise.com",
    name: "Mike Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    plan: "enterprise",
    credits: 4850,
    createdAt: "2023-03-10T11:00:00Z",
    lastLogin: "2024-01-15T18:45:00Z",
    settings: {
      emailNotifications: true,
      weeklyReport: true,
      theme: "light",
      defaultLocation: "US",
      defaultLanguage: "en",
    },
  },
]

// Demo user for quick login
export const demoUser = mockUsers[0]

// Default user for new registrations
export const defaultUserSettings: MockUser["settings"] = {
  emailNotifications: true,
  weeklyReport: false,
  theme: "system",
  defaultLocation: "US",
  defaultLanguage: "en",
}

export function createMockUser(
  email: string,
  name: string,
  plan: MockUser["plan"] = "free"
): MockUser {
  const creditsMap = {
    free: 50,
    pro: 500,
    enterprise: 5000,
  }

  return {
    id: `user_${Date.now()}`,
    email,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    plan,
    credits: creditsMap[plan],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    settings: { ...defaultUserSettings },
  }
}

export default mockUsers
