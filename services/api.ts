// ============================================
// BLOGSPY API SERVICE LAYER
// ============================================
// Centralized API calls - currently using mock data
// Will be replaced with real API endpoints later
// ============================================

import type {
  Keyword,
  DashboardStats,
  QuickAction,
  RecentActivity,
  TrendingTopic,
  Competitor,
  ContentDecay,
  RankingData,
  TopicCluster,
  FeaturedSnippet,
  ContentRoadmapItem,
  User,
  FilterOptions,
  PaginatedResponse,
  ApiResponse,
  OnPageAnalysis,
  CompetitorGap,
} from "@/types/dashboard";

import {
  mockDashboardStats,
  mockQuickActions,
  mockRecentActivity,
  mockKeywords,
  mockTrendingTopics,
  mockCompetitors,
  mockContentDecay,
  mockRankingData,
  mockTopicClusters,
  mockFeaturedSnippets,
  mockContentRoadmap,
  mockUser,
  mockKeywordMagicResults,
  mockGeoData,
} from "@/data/dashboard-mock";

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const USE_MOCK_DATA = true; // Toggle this when real API is ready

// Simulate network delay for realistic UX
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// DASHBOARD APIs
// ============================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    return { success: true, data: mockDashboardStats };
  }

  // Real API call (future)
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
  return response.json();
}

export async function getQuickActions(): Promise<ApiResponse<QuickAction[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(200);
    return { success: true, data: mockQuickActions };
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/quick-actions`);
  return response.json();
}

export async function getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    return { success: true, data: mockRecentActivity };
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/activity`);
  return response.json();
}

// ============================================
// KEYWORD APIs
// ============================================

export async function getKeywords(
  filters?: FilterOptions
): Promise<ApiResponse<Keyword[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    let data = [...mockKeywords];

    // Apply filters
    if (filters?.search) {
      data = data.filter((k) =>
        k.keyword.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    if (filters?.minVolume) {
      data = data.filter((k) => k.volume >= filters.minVolume!);
    }
    if (filters?.maxVolume) {
      data = data.filter((k) => k.volume <= filters.maxVolume!);
    }
    if (filters?.minKd) {
      data = data.filter((k) => k.kd >= filters.minKd!);
    }
    if (filters?.maxKd) {
      data = data.filter((k) => k.kd <= filters.maxKd!);
    }

    // Apply sorting
    if (filters?.sortBy) {
      data.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof Keyword];
        const bVal = b[filters.sortBy as keyof Keyword];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return filters.sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        }
        return 0;
      });
    }

    return { success: true, data };
  }

  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/keywords?${params}`);
  return response.json();
}

export async function getKeywordDetails(
  keywordId: string
): Promise<ApiResponse<Keyword>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    const keyword = mockKeywords.find((k) => k.id === keywordId);
    if (keyword) {
      return { success: true, data: keyword };
    }
    return { success: false, error: "Keyword not found" };
  }

  const response = await fetch(`${API_BASE_URL}/keywords/${keywordId}`);
  return response.json();
}

export async function searchKeywords(
  query: string
): Promise<ApiResponse<Keyword[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(600);
    // Simulate keyword magic results
    return { success: true, data: mockKeywordMagicResults };
  }

  const response = await fetch(
    `${API_BASE_URL}/keywords/search?q=${encodeURIComponent(query)}`
  );
  return response.json();
}

// ============================================
// RANKING APIs
// ============================================

export async function getRankingData(): Promise<ApiResponse<RankingData[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { success: true, data: mockRankingData };
  }

  const response = await fetch(`${API_BASE_URL}/rankings`);
  return response.json();
}

export async function getRankingHistory(
  keywordId: string
): Promise<ApiResponse<RankingData>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    const ranking = mockRankingData.find((r) => r.id === keywordId);
    if (ranking) {
      return { success: true, data: ranking };
    }
    return { success: false, error: "Ranking not found" };
  }

  const response = await fetch(`${API_BASE_URL}/rankings/${keywordId}/history`);
  return response.json();
}

// ============================================
// COMPETITOR APIs
// ============================================

export async function getCompetitors(): Promise<ApiResponse<Competitor[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { success: true, data: mockCompetitors };
  }

  const response = await fetch(`${API_BASE_URL}/competitors`);
  return response.json();
}

export async function getCompetitorGaps(
  competitorId: string
): Promise<ApiResponse<CompetitorGap[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(600);
    // Return empty for now - will add mock data later
    return { success: true, data: [] };
  }

  const response = await fetch(
    `${API_BASE_URL}/competitors/${competitorId}/gaps`
  );
  return response.json();
}

// ============================================
// CONTENT APIs
// ============================================

export async function getContentDecay(): Promise<ApiResponse<ContentDecay[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { success: true, data: mockContentDecay };
  }

  const response = await fetch(`${API_BASE_URL}/content/decay`);
  return response.json();
}

export async function getContentRoadmap(): Promise<
  ApiResponse<ContentRoadmapItem[]>
> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    return { success: true, data: mockContentRoadmap };
  }

  const response = await fetch(`${API_BASE_URL}/content/roadmap`);
  return response.json();
}

// ============================================
// TOPIC CLUSTER APIs
// ============================================

export async function getTopicClusters(): Promise<ApiResponse<TopicCluster[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { success: true, data: mockTopicClusters };
  }

  const response = await fetch(`${API_BASE_URL}/clusters`);
  return response.json();
}

export async function getTopicClusterDetails(
  clusterId: string
): Promise<ApiResponse<TopicCluster>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    const cluster = mockTopicClusters.find((c) => c.id === clusterId);
    if (cluster) {
      return { success: true, data: cluster };
    }
    return { success: false, error: "Cluster not found" };
  }

  const response = await fetch(`${API_BASE_URL}/clusters/${clusterId}`);
  return response.json();
}

// ============================================
// TREND APIs
// ============================================

export async function getTrendingTopics(): Promise<
  ApiResponse<TrendingTopic[]>
> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { success: true, data: mockTrendingTopics };
  }

  const response = await fetch(`${API_BASE_URL}/trends`);
  return response.json();
}

// ============================================
// SNIPPET APIs
// ============================================

export async function getFeaturedSnippets(): Promise<
  ApiResponse<FeaturedSnippet[]>
> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { success: true, data: mockFeaturedSnippets };
  }

  const response = await fetch(`${API_BASE_URL}/snippets`);
  return response.json();
}

// ============================================
// ON-PAGE SEO APIs
// ============================================

export async function analyzeUrl(
  url: string
): Promise<ApiResponse<OnPageAnalysis>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(2000); // Simulate longer analysis time
    // Return mock analysis - will add detailed mock later
    return {
      success: true,
      data: {
        url,
        overallScore: 72,
        title: {
          text: "Example Page Title",
          length: 45,
          score: 85,
          issues: [],
          suggestions: ["Consider adding target keyword"],
        },
        meta: {
          description: "Example meta description for the page",
          length: 120,
          score: 78,
          issues: ["Description could be longer"],
          suggestions: ["Aim for 150-160 characters"],
        },
        headings: {
          h1Count: 1,
          h2Count: 5,
          h3Count: 8,
          structure: ["H1", "H2", "H3", "H3", "H2", "H3"],
          score: 90,
          issues: [],
        },
        content: {
          wordCount: 1850,
          readabilityScore: 68,
          keywordDensity: 1.2,
          score: 75,
          issues: ["Readability could be improved"],
        },
        images: {
          totalImages: 8,
          missingAlt: 2,
          score: 70,
          issues: ["2 images missing alt text"],
        },
        links: {
          internalLinks: 12,
          externalLinks: 5,
          brokenLinks: 0,
          score: 88,
          issues: [],
        },
        technical: {
          loadTime: 2.3,
          mobileOptimized: true,
          httpsEnabled: true,
          score: 82,
          issues: ["Page load time could be improved"],
        },
      },
    };
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return response.json();
}

// ============================================
// USER APIs
// ============================================

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    return { success: true, data: mockUser };
  }

  const response = await fetch(`${API_BASE_URL}/user`);
  return response.json();
}

export async function updateUserCredits(
  amount: number
): Promise<ApiResponse<User>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    const updatedUser = {
      ...mockUser,
      credits: Math.max(0, mockUser.credits - amount),
    };
    return { success: true, data: updatedUser };
  }

  const response = await fetch(`${API_BASE_URL}/user/credits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  return response.json();
}

// ============================================
// GEO APIs
// ============================================

export async function getGeoData(keyword: string): Promise<
  ApiResponse<
    Array<{
      country: string;
      countryName: string;
      volume: number;
      percentage: number;
    }>
  >
> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    return { success: true, data: mockGeoData };
  }

  const response = await fetch(
    `${API_BASE_URL}/geo?keyword=${encodeURIComponent(keyword)}`
  );
  return response.json();
}

// ============================================
// AI WRITER APIs
// ============================================

export async function generateContent(config: {
  title: string;
  keyword: string;
  tone: string;
  length: string;
}): Promise<ApiResponse<{ content: string; seoScore: number }>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(3000); // Simulate AI generation time
    return {
      success: true,
      data: {
        content: `# ${config.title}\n\nThis is AI-generated content for the keyword "${config.keyword}".\n\n## Introduction\n\nLorem ipsum dolor sit amet...`,
        seoScore: 85,
      },
    };
  }

  const response = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return response.json();
}

// ============================================
// EXPORT ALL
// ============================================

export const api = {
  // Dashboard
  getDashboardStats,
  getQuickActions,
  getRecentActivity,

  // Keywords
  getKeywords,
  getKeywordDetails,
  searchKeywords,

  // Rankings
  getRankingData,
  getRankingHistory,

  // Competitors
  getCompetitors,
  getCompetitorGaps,

  // Content
  getContentDecay,
  getContentRoadmap,

  // Topic Clusters
  getTopicClusters,
  getTopicClusterDetails,

  // Trends
  getTrendingTopics,

  // Snippets
  getFeaturedSnippets,

  // On-Page SEO
  analyzeUrl,

  // User
  getCurrentUser,
  updateUserCredits,

  // Geo
  getGeoData,

  // AI Writer
  generateContent,
};

export default api;
