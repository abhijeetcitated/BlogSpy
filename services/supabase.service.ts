/**
 * Supabase Database Service
 * Handles database operations through Supabase
 * 
 * NOTE: Currently using MOCK implementation
 * Real Supabase integration will be added later:
 * 1. npm install @supabase/ssr @supabase/supabase-js
 * 2. Set up environment variables
 * 3. Replace mock data with real database calls
 */

// Types for database operations
export interface UserRecord {
  id: string
  clerkId: string
  email: string
  name: string | null
  avatar: string | null
  plan: "FREE" | "PRO" | "ENTERPRISE"
  credits: number
  stripeCustomerId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProjectRecord {
  id: string
  userId: string
  name: string
  domain: string
  createdAt: Date
  updatedAt: Date
}

export interface KeywordRecord {
  id: string
  projectId: string
  term: string
  volume: number
  difficulty: number
  cpc: number
  trend: number[]
  country: string
  createdAt: Date
}

// Mock data store
const mockUsers: Map<string, UserRecord> = new Map([
  ["user_demo_123", {
    id: "user_db_1",
    clerkId: "user_demo_123",
    email: "demo@blogspy.io",
    name: "Demo User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    plan: "PRO",
    credits: 342,
    stripeCustomerId: "cus_mock_123",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
  }]
])

const mockProjects: ProjectRecord[] = [
  {
    id: "proj_1",
    userId: "user_db_1",
    name: "My Blog",
    domain: "myblog.com",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
  },
  {
    id: "proj_2",
    userId: "user_db_1",
    name: "Tech Site",
    domain: "techsite.io",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
  },
]

const mockKeywords: KeywordRecord[] = [
  {
    id: "kw_1",
    projectId: "proj_1",
    term: "best seo tools",
    volume: 12400,
    difficulty: 45,
    cpc: 2.50,
    trend: [100, 105, 110, 108, 115, 120],
    country: "US",
    createdAt: new Date(),
  },
]

class SupabaseService {
  /**
   * Get user by Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<UserRecord | null> {
    // Mock: Return from mock store
    return mockUsers.get(clerkId) || null
  }

  /**
   * Create or update user from Clerk webhook
   */
  async upsertUser(user: Partial<UserRecord> & { clerkId: string }): Promise<UserRecord> {
    const existing = mockUsers.get(user.clerkId)
    
    const updatedUser: UserRecord = {
      id: existing?.id || `user_db_${Date.now()}`,
      clerkId: user.clerkId,
      email: user.email || existing?.email || "",
      name: user.name ?? existing?.name ?? null,
      avatar: user.avatar ?? existing?.avatar ?? null,
      plan: user.plan || existing?.plan || "FREE",
      credits: user.credits ?? existing?.credits ?? 50,
      stripeCustomerId: user.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    mockUsers.set(user.clerkId, updatedUser)
    return updatedUser
  }

  /**
   * Update user credits
   */
  async updateCredits(userId: string, credits: number): Promise<void> {
    for (const [clerkId, user] of mockUsers) {
      if (user.id === userId) {
        user.credits = credits
        user.updatedAt = new Date()
        break
      }
    }
  }

  /**
   * Decrement user credits
   */
  async decrementCredits(userId: string, amount: number): Promise<boolean> {
    for (const [clerkId, user] of mockUsers) {
      if (user.id === userId) {
        if (user.credits < amount) {
          return false
        }
        user.credits -= amount
        user.updatedAt = new Date()
        return true
      }
    }
    return false
  }

  /**
   * Get user's projects
   */
  async getProjects(userId: string): Promise<ProjectRecord[]> {
    return mockProjects.filter(p => p.userId === userId)
  }

  /**
   * Create a new project
   */
  async createProject(project: Omit<ProjectRecord, "id" | "createdAt" | "updatedAt">): Promise<ProjectRecord> {
    const newProject: ProjectRecord = {
      ...project,
      id: `proj_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockProjects.push(newProject)
    return newProject
  }

  /**
   * Get keywords for a project
   */
  async getKeywords(projectId: string): Promise<KeywordRecord[]> {
    return mockKeywords.filter(k => k.projectId === projectId)
  }

  /**
   * Save keywords to project
   */
  async saveKeywords(keywords: Omit<KeywordRecord, "id" | "createdAt">[]): Promise<void> {
    for (const kw of keywords) {
      mockKeywords.push({
        ...kw,
        id: `kw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date(),
      })
    }
  }

  /**
   * Track API usage
   */
  async trackApiUsage(
    userId: string,
    endpoint: string,
    creditsUsed: number
  ): Promise<void> {
    // Mock: Just log
    console.log(`[MOCK] API Usage: ${endpoint} by ${userId} - ${creditsUsed} credits`)
  }

  /**
   * Get API usage stats for user
   */
  async getApiUsageStats(userId: string, days = 30) {
    // Mock stats
    return {
      totalCredits: 158,
      byEndpoint: {
        "keyword-research": 85,
        "content-analysis": 45,
        "rank-tracking": 28,
      },
      records: [
        { endpoint: "keyword-research", creditsUsed: 5, timestamp: new Date().toISOString() },
        { endpoint: "content-analysis", creditsUsed: 3, timestamp: new Date().toISOString() },
      ],
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()
