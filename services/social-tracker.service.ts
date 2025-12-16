// ============================================
// SOCIAL TRACKER SERVICE
// ============================================
// Ready for real API integration
// Just replace the mock implementations with actual API calls

import type { 
  SocialKeyword, 
  SocialSummary, 
  SocialPlatform,
  PinterestPin,
  Tweet,
  InstagramPost 
} from "@/src/features/social-tracker/types"

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SocialTrackerData {
  keywords: SocialKeyword[]
  summary: SocialSummary
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

const generatePinterestPins = (): PinterestPin[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `pin-${Date.now()}-${i}`,
    title: `SEO Tips That Actually Work in 2024`,
    imageUrl: "/placeholder.svg",
    repins: Math.floor(Math.random() * 5000) + 100,
    clicks: Math.floor(Math.random() * 2000) + 50,
    impressions: Math.floor(Math.random() * 50000) + 1000,
    position: i + 1,
    board: ["SEO Tips", "Marketing", "Business Growth"][Math.floor(Math.random() * 3)],
    isOurs: i === 0 && Math.random() > 0.7,
  }))
}

const generateTweets = (): Tweet[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `tweet-${Date.now()}-${i}`,
    text: `🚀 Just discovered this amazing SEO strategy that increased our traffic by 300%!`,
    author: `@seo_expert_${i + 1}`,
    likes: Math.floor(Math.random() * 1000) + 10,
    retweets: Math.floor(Math.random() * 200) + 5,
    replies: Math.floor(Math.random() * 50) + 2,
    impressions: Math.floor(Math.random() * 20000) + 500,
    position: i + 1,
    isOurs: i === 0 && Math.random() > 0.7,
    createdAt: `${Math.floor(Math.random() * 24) + 1}h ago`,
  }))
}

const generateInstagramPosts = (): InstagramPost[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `insta-${Date.now()}-${i}`,
    caption: `The secret to ranking #1 on Google 🔥 #seo #digitalmarketing`,
    imageUrl: "/placeholder.svg",
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 200) + 10,
    saves: Math.floor(Math.random() * 500) + 20,
    position: i + 1,
    author: `@marketing_guru_${i + 1}`,
    isOurs: i === 0 && Math.random() > 0.7,
  }))
}

const generateMockKeyword = (keyword: string, platforms: SocialPlatform[]): SocialKeyword => {
  const id = `kw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const pinterestPosition = platforms.includes("pinterest") ? Math.floor(Math.random() * 20) + 1 : null
  const twitterPosition = platforms.includes("twitter") ? Math.floor(Math.random() * 20) + 1 : null
  const instagramPosition = platforms.includes("instagram") ? Math.floor(Math.random() * 20) + 1 : null
  
  const pinterestPins = generatePinterestPins()
  const tweets = generateTweets()
  const instaPosts = generateInstagramPosts()
  
  return {
    id,
    keyword,
    searchVolume: Math.floor(Math.random() * 50000) + 1000,
    socialIntent: ["visual", "trending", "discussion", "shopping"][Math.floor(Math.random() * 4)] as SocialKeyword["socialIntent"],
    platforms: {
      pinterest: pinterestPosition ? {
        position: pinterestPosition,
        topPins: pinterestPins,
        totalPins: Math.floor(Math.random() * 1000) + 100,
        avgRepins: Math.round(pinterestPins.reduce((s, p) => s + p.repins, 0) / pinterestPins.length),
        hasOurContent: pinterestPins.some(p => p.isOurs),
        topBoards: ["SEO Tips", "Marketing Ideas", "Business Growth"],
      } : null,
      twitter: twitterPosition ? {
        position: twitterPosition,
        topTweets: tweets,
        totalTweets: Math.floor(Math.random() * 500) + 50,
        avgEngagement: Math.round(tweets.reduce((s, t) => s + t.likes + t.retweets, 0) / tweets.length),
        hasOurContent: tweets.some(t => t.isOurs),
        trending: Math.random() > 0.7,
      } : null,
      instagram: instagramPosition ? {
        position: instagramPosition,
        topPosts: instaPosts,
        totalPosts: Math.floor(Math.random() * 2000) + 200,
        avgEngagement: Math.round(instaPosts.reduce((s, p) => s + p.likes + p.comments, 0) / instaPosts.length),
        hasOurContent: instaPosts.some(p => p.isOurs),
        topHashtags: ["#seo", "#digitalmarketing", "#marketing", "#business"],
      } : null,
    },
    lastUpdated: "just now",
  }
}

// In-memory store for mock data
let mockKeywords: SocialKeyword[] = []

// Initialize with some mock data
const initializeMockData = () => {
  if (mockKeywords.length === 0) {
    const sampleKeywords = [
      { keyword: "seo infographic", platforms: ["pinterest", "instagram"] as SocialPlatform[] },
      { keyword: "content marketing tips", platforms: ["twitter", "instagram"] as SocialPlatform[] },
      { keyword: "blogging strategies", platforms: ["pinterest", "twitter", "instagram"] as SocialPlatform[] },
      { keyword: "affiliate marketing", platforms: ["pinterest", "twitter"] as SocialPlatform[] },
      { keyword: "digital marketing trends", platforms: ["twitter", "instagram"] as SocialPlatform[] },
    ]
    
    mockKeywords = sampleKeywords.map(({ keyword, platforms }) => 
      generateMockKeyword(keyword, platforms)
    )
  }
}

const generateSummary = (keywords: SocialKeyword[]): SocialSummary => {
  return {
    totalKeywords: keywords.length,
    pinterestRanking: keywords.filter(k => k.platforms.pinterest?.position).length,
    twitterRanking: keywords.filter(k => k.platforms.twitter?.position).length,
    instagramRanking: keywords.filter(k => k.platforms.instagram?.position).length,
    totalImpressions: Math.floor(Math.random() * 500000) + 50000,
    avgEngagement: Math.floor(Math.random() * 5) + 2,
    trendingCount: keywords.filter(k => k.platforms.twitter?.trending).length,
  }
}

// ============================================
// SERVICE CLASS
// ============================================

class SocialTrackerService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  /**
   * Get all keywords
   * TODO: Replace with real API call
   */
  async getKeywords(): Promise<ApiResponse<SocialTrackerData>> {
    try {
      // Simulate API delay
      await this.delay(800)
      
      initializeMockData()
      
      // TODO: Replace with real API call
      // const response = await fetch('/api/social-tracker/keywords')
      // const data = await response.json()
      
      return {
        success: true,
        data: {
          keywords: mockKeywords,
          summary: generateSummary(mockKeywords),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch keywords",
      }
    }
  }

  /**
   * Add a new keyword
   * TODO: Replace with real API call
   */
  async addKeyword(keyword: string, platforms: SocialPlatform[]): Promise<ApiResponse<SocialKeyword>> {
    try {
      await this.delay(600)
      
      // Check for duplicates
      if (mockKeywords.some(k => k.keyword.toLowerCase() === keyword.toLowerCase())) {
        return {
          success: false,
          error: "Keyword already exists",
        }
      }
      
      // TODO: Replace with real API call
      // const response = await fetch('/api/social-tracker/keywords', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ keyword, platforms }),
      // })
      
      const newKeyword = generateMockKeyword(keyword, platforms)
      mockKeywords = [newKeyword, ...mockKeywords]
      
      return {
        success: true,
        data: newKeyword,
        message: "Keyword added successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add keyword",
      }
    }
  }

  /**
   * Delete a keyword
   * TODO: Replace with real API call
   */
  async deleteKeyword(keywordId: string): Promise<ApiResponse<void>> {
    try {
      await this.delay(500)
      
      const index = mockKeywords.findIndex(k => k.id === keywordId)
      if (index === -1) {
        return {
          success: false,
          error: "Keyword not found",
        }
      }
      
      // TODO: Replace with real API call
      // const response = await fetch(`/api/social-tracker/keywords/${keywordId}`, {
      //   method: 'DELETE',
      // })
      
      mockKeywords = mockKeywords.filter(k => k.id !== keywordId)
      
      return {
        success: true,
        message: "Keyword deleted successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete keyword",
      }
    }
  }

  /**
   * Update a keyword
   * TODO: Replace with real API call
   */
  async updateKeyword(keywordId: string, updates: Partial<SocialKeyword>): Promise<ApiResponse<SocialKeyword>> {
    try {
      await this.delay(500)
      
      const index = mockKeywords.findIndex(k => k.id === keywordId)
      if (index === -1) {
        return {
          success: false,
          error: "Keyword not found",
        }
      }
      
      // TODO: Replace with real API call
      // const response = await fetch(`/api/social-tracker/keywords/${keywordId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates),
      // })
      
      mockKeywords[index] = { ...mockKeywords[index], ...updates }
      
      return {
        success: true,
        data: mockKeywords[index],
        message: "Keyword updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update keyword",
      }
    }
  }

  /**
   * Refresh all keywords data
   * TODO: Replace with real API call
   */
  async refreshKeywords(): Promise<ApiResponse<SocialTrackerData>> {
    try {
      await this.delay(1500)
      
      // TODO: Replace with real API call
      // const response = await fetch('/api/social-tracker/refresh', {
      //   method: 'POST',
      // })
      
      // Simulate data update by regenerating positions
      mockKeywords = mockKeywords.map(kw => ({
        ...kw,
        lastUpdated: "just now",
        platforms: {
          pinterest: kw.platforms.pinterest ? {
            ...kw.platforms.pinterest,
            position: Math.max(1, (kw.platforms.pinterest.position ?? 10) + Math.floor(Math.random() * 5) - 2),
          } : null,
          twitter: kw.platforms.twitter ? {
            ...kw.platforms.twitter,
            position: Math.max(1, (kw.platforms.twitter.position ?? 10) + Math.floor(Math.random() * 5) - 2),
          } : null,
          instagram: kw.platforms.instagram ? {
            ...kw.platforms.instagram,
            position: Math.max(1, (kw.platforms.instagram.position ?? 10) + Math.floor(Math.random() * 5) - 2),
          } : null,
        },
      }))
      
      return {
        success: true,
        data: {
          keywords: mockKeywords,
          summary: generateSummary(mockKeywords),
        },
        message: "Data refreshed successfully",
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to refresh data",
      }
    }
  }

  /**
   * Get a single keyword by ID
   * TODO: Replace with real API call
   */
  async getKeyword(keywordId: string): Promise<ApiResponse<SocialKeyword>> {
    try {
      await this.delay(300)
      
      const keyword = mockKeywords.find(k => k.id === keywordId)
      if (!keyword) {
        return {
          success: false,
          error: "Keyword not found",
        }
      }
      
      return {
        success: true,
        data: keyword,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch keyword",
      }
    }
  }
}

// Export singleton instance
export const socialTrackerService = new SocialTrackerService()
