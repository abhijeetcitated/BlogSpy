// ============================================
// BLOGSPY MOCK DATA
// ============================================
// All mock/demo data for the dashboard
// This will be replaced with real API calls later
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
} from "@/types/dashboard";

// ============ DASHBOARD STATS ============
export const mockDashboardStats: DashboardStats = {
  totalKeywords: 1247,
  keywordsChange: 12,
  avgPosition: 14.3,
  positionChange: -2.1,
  totalTraffic: 45200,
  trafficChange: 8,
  contentScore: 78,
  scoreChange: 5,
};

// ============ QUICK ACTIONS ============
export const mockQuickActions: QuickAction[] = [
  {
    id: "1",
    title: "Find Keywords",
    description: "Discover new keyword opportunities",
    icon: "Search",
    href: "/dashboard/research/keyword-magic",
    color: "cyan",
  },
  {
    id: "2",
    title: "Check Rankings",
    description: "Monitor your SERP positions",
    icon: "TrendingUp",
    href: "/dashboard/tracking/rank-tracker",
    color: "green",
  },
  {
    id: "3",
    title: "Analyze Content",
    description: "On-page SEO analysis",
    icon: "FileText",
    href: "/dashboard/creation/on-page",
    color: "blue",
  },
  {
    id: "4",
    title: "AI Writer",
    description: "Generate SEO content",
    icon: "Sparkles",
    href: "/dashboard/creation/ai-writer",
    color: "purple",
  },
];

// ============ RECENT ACTIVITY ============
export const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "rank_change",
    title: "Ranking improved",
    description: '"best seo tools 2024" moved to position 3',
    timestamp: "2 hours ago",
    href: "/dashboard/tracking/rank-tracker",
  },
  {
    id: "2",
    type: "content_published",
    title: "Content published",
    description: '"Complete Guide to Technical SEO" is now live',
    timestamp: "5 hours ago",
    href: "/dashboard/creation/ai-writer",
  },
  {
    id: "3",
    type: "keyword_added",
    title: "New keywords tracked",
    description: "15 keywords added to rank tracker",
    timestamp: "1 day ago",
    href: "/dashboard/tracking/rank-tracker",
  },
  {
    id: "4",
    type: "alert",
    title: "Content decay alert",
    description: "3 articles need updating",
    timestamp: "2 days ago",
    href: "/dashboard/tracking/decay",
  },
  {
    id: "5",
    type: "competitor",
    title: "Competitor alert",
    description: "ahrefs.com gained 5 positions",
    timestamp: "3 days ago",
    href: "/dashboard/research/gap-analysis",
  },
];

// ============ KEYWORDS DATA ============
export const mockKeywords: Keyword[] = [
  {
    id: "1",
    keyword: "best seo tools 2024",
    volume: 12100,
    kd: 45,
    cpc: 4.5,
    trend: "up",
    trendData: [65, 70, 68, 75, 80, 85, 90],
    intent: "commercial",
    position: 3,
    change: 2,
  },
  {
    id: "2",
    keyword: "keyword research guide",
    volume: 8800,
    kd: 38,
    cpc: 3.2,
    trend: "stable",
    trendData: [50, 52, 48, 51, 50, 53, 51],
    intent: "informational",
    position: 7,
    change: -1,
  },
  {
    id: "3",
    keyword: "on page seo checklist",
    volume: 6600,
    kd: 42,
    cpc: 2.8,
    trend: "up",
    trendData: [40, 45, 48, 52, 58, 62, 68],
    intent: "informational",
    position: 12,
    change: 5,
  },
  {
    id: "4",
    keyword: "seo competitor analysis",
    volume: 5400,
    kd: 51,
    cpc: 5.1,
    trend: "up",
    trendData: [30, 35, 40, 48, 55, 60, 65],
    intent: "commercial",
    position: 8,
    change: 3,
  },
  {
    id: "5",
    keyword: "content optimization tips",
    volume: 4200,
    kd: 35,
    cpc: 2.4,
    trend: "down",
    trendData: [70, 68, 65, 60, 55, 52, 48],
    intent: "informational",
    position: 15,
    change: -3,
  },
  {
    id: "6",
    keyword: "free backlink checker",
    volume: 18500,
    kd: 62,
    cpc: 3.8,
    trend: "stable",
    trendData: [80, 82, 78, 81, 80, 79, 82],
    intent: "transactional",
    position: 22,
    change: 0,
  },
  {
    id: "7",
    keyword: "how to rank on google",
    volume: 22000,
    kd: 68,
    cpc: 4.2,
    trend: "up",
    trendData: [55, 58, 62, 68, 72, 78, 85],
    intent: "informational",
    position: 18,
    change: 4,
  },
  {
    id: "8",
    keyword: "local seo services",
    volume: 9900,
    kd: 55,
    cpc: 8.5,
    trend: "up",
    trendData: [45, 50, 55, 60, 65, 70, 75],
    intent: "transactional",
    position: 11,
    change: 2,
  },
];

// ============ TRENDING TOPICS ============
export const mockTrendingTopics: TrendingTopic[] = [
  {
    id: "1",
    topic: "AI SEO Tools",
    keyword: "ai seo tools",
    volume: 14800,
    growth: 245,
    growthData: [20, 35, 50, 75, 110, 150, 200],
    category: "Technology",
    relatedKeywords: ["ai content generator", "ai keyword research", "chatgpt seo"],
  },
  {
    id: "2",
    topic: "Google SGE",
    keyword: "google sge optimization",
    volume: 8200,
    growth: 180,
    growthData: [15, 25, 45, 70, 100, 140, 180],
    category: "Search",
    relatedKeywords: ["search generative experience", "sge seo", "ai search optimization"],
  },
  {
    id: "3",
    topic: "E-E-A-T Guidelines",
    keyword: "eeat seo",
    volume: 6500,
    growth: 120,
    growthData: [40, 50, 60, 75, 90, 105, 120],
    category: "Content",
    relatedKeywords: ["experience expertise authority trust", "eeat google", "content quality"],
  },
  {
    id: "4",
    topic: "Core Web Vitals",
    keyword: "core web vitals 2024",
    volume: 11200,
    growth: 85,
    growthData: [60, 65, 70, 75, 80, 82, 85],
    category: "Technical",
    relatedKeywords: ["page speed optimization", "lcp optimization", "cls fix"],
  },
  {
    id: "5",
    topic: "Voice Search SEO",
    keyword: "voice search optimization",
    volume: 7800,
    growth: 65,
    growthData: [50, 52, 55, 58, 60, 63, 65],
    category: "Search",
    relatedKeywords: ["alexa seo", "google assistant optimization", "voice query"],
  },
];

// ============ COMPETITORS DATA ============
export const mockCompetitors: Competitor[] = [
  {
    id: "1",
    domain: "ahrefs.com",
    name: "Ahrefs",
    visibility: 89,
    visibilityChange: 2,
    keywords: 245000,
    traffic: 8500000,
    commonKeywords: 1247,
    gaps: 3420,
  },
  {
    id: "2",
    domain: "semrush.com",
    name: "Semrush",
    visibility: 92,
    visibilityChange: -1,
    keywords: 312000,
    traffic: 12000000,
    commonKeywords: 1890,
    gaps: 4100,
  },
  {
    id: "3",
    domain: "moz.com",
    name: "Moz",
    visibility: 78,
    visibilityChange: 0,
    keywords: 156000,
    traffic: 3200000,
    commonKeywords: 890,
    gaps: 2100,
  },
  {
    id: "4",
    domain: "backlinko.com",
    name: "Backlinko",
    visibility: 72,
    visibilityChange: 3,
    keywords: 45000,
    traffic: 1800000,
    commonKeywords: 420,
    gaps: 890,
  },
  {
    id: "5",
    domain: "neilpatel.com",
    name: "Neil Patel",
    visibility: 85,
    visibilityChange: 1,
    keywords: 198000,
    traffic: 6500000,
    commonKeywords: 1100,
    gaps: 2800,
  },
];

// ============ CONTENT DECAY DATA ============
export const mockContentDecay: ContentDecay[] = [
  {
    id: "1",
    title: "Complete Guide to Link Building (2023)",
    url: "/blog/link-building-guide",
    currentTraffic: 1200,
    peakTraffic: 4500,
    decayPercentage: 73,
    lastUpdated: "2023-03-15",
    suggestedActions: [
      "Update statistics and data",
      "Add new link building strategies",
      "Update year in title",
      "Add video content",
    ],
  },
  {
    id: "2",
    title: "Best SEO Tools Review",
    url: "/blog/seo-tools-review",
    currentTraffic: 2800,
    peakTraffic: 5200,
    decayPercentage: 46,
    lastUpdated: "2023-08-20",
    suggestedActions: [
      "Add new tools released in 2024",
      "Update pricing information",
      "Add comparison tables",
    ],
  },
  {
    id: "3",
    title: "Technical SEO Checklist",
    url: "/blog/technical-seo-checklist",
    currentTraffic: 950,
    peakTraffic: 2100,
    decayPercentage: 55,
    lastUpdated: "2023-05-10",
    suggestedActions: [
      "Add Core Web Vitals section",
      "Update mobile-first indexing tips",
      "Add schema markup examples",
    ],
  },
];

// ============ RANKING DATA ============
export const mockRankingData: RankingData[] = [
  {
    id: "1",
    keyword: "best seo tools",
    currentPosition: 3,
    previousPosition: 5,
    change: 2,
    url: "/blog/best-seo-tools",
    volume: 12100,
    lastChecked: "2024-01-15",
    history: [
      { date: "2024-01-01", position: 8 },
      { date: "2024-01-05", position: 6 },
      { date: "2024-01-10", position: 5 },
      { date: "2024-01-15", position: 3 },
    ],
  },
  {
    id: "2",
    keyword: "keyword research",
    currentPosition: 7,
    previousPosition: 6,
    change: -1,
    url: "/blog/keyword-research-guide",
    volume: 18500,
    lastChecked: "2024-01-15",
    history: [
      { date: "2024-01-01", position: 5 },
      { date: "2024-01-05", position: 6 },
      { date: "2024-01-10", position: 6 },
      { date: "2024-01-15", position: 7 },
    ],
  },
  {
    id: "3",
    keyword: "on page seo",
    currentPosition: 12,
    previousPosition: 15,
    change: 3,
    url: "/blog/on-page-seo",
    volume: 8800,
    lastChecked: "2024-01-15",
    history: [
      { date: "2024-01-01", position: 18 },
      { date: "2024-01-05", position: 16 },
      { date: "2024-01-10", position: 15 },
      { date: "2024-01-15", position: 12 },
    ],
  },
];

// ============ TOPIC CLUSTERS ============
export const mockTopicClusters: TopicCluster[] = [
  {
    id: "1",
    pillarTopic: "Complete SEO Guide",
    pillarUrl: "/guides/seo",
    totalVolume: 125000,
    avgDifficulty: 52,
    coverage: 65,
    subtopics: [
      {
        id: "1-1",
        topic: "On-Page SEO",
        keyword: "on page seo guide",
        volume: 8800,
        difficulty: 45,
        status: "published",
        url: "/guides/seo/on-page",
      },
      {
        id: "1-2",
        topic: "Technical SEO",
        keyword: "technical seo checklist",
        volume: 6600,
        difficulty: 52,
        status: "published",
        url: "/guides/seo/technical",
      },
      {
        id: "1-3",
        topic: "Link Building",
        keyword: "link building strategies",
        volume: 12100,
        difficulty: 58,
        status: "in_progress",
      },
      {
        id: "1-4",
        topic: "Local SEO",
        keyword: "local seo tips",
        volume: 9900,
        difficulty: 48,
        status: "not_started",
      },
    ],
  },
  {
    id: "2",
    pillarTopic: "Content Marketing Hub",
    pillarUrl: "/guides/content-marketing",
    totalVolume: 89000,
    avgDifficulty: 45,
    coverage: 40,
    subtopics: [
      {
        id: "2-1",
        topic: "Content Strategy",
        keyword: "content strategy guide",
        volume: 5400,
        difficulty: 42,
        status: "published",
        url: "/guides/content-marketing/strategy",
      },
      {
        id: "2-2",
        topic: "Blog Writing",
        keyword: "how to write blog posts",
        volume: 14800,
        difficulty: 38,
        status: "in_progress",
      },
      {
        id: "2-3",
        topic: "Content Promotion",
        keyword: "content promotion tactics",
        volume: 3200,
        difficulty: 35,
        status: "not_started",
      },
    ],
  },
];

// ============ FEATURED SNIPPETS ============
export const mockFeaturedSnippets: FeaturedSnippet[] = [
  {
    id: "1",
    keyword: "what is seo",
    type: "paragraph",
    currentOwner: "moz.com",
    yourPosition: 4,
    volume: 110000,
    opportunity: 75,
    suggestedContent:
      "SEO (Search Engine Optimization) is the practice of optimizing websites to rank higher in search engine results...",
  },
  {
    id: "2",
    keyword: "how to do keyword research",
    type: "list",
    currentOwner: "ahrefs.com",
    yourPosition: 6,
    volume: 18500,
    opportunity: 68,
    suggestedContent:
      "1. Brainstorm seed keywords\n2. Use keyword research tools\n3. Analyze search intent\n4. Check keyword difficulty...",
  },
  {
    id: "3",
    keyword: "seo ranking factors",
    type: "table",
    currentOwner: "backlinko.com",
    yourPosition: 8,
    volume: 8200,
    opportunity: 55,
  },
];

// ============ CONTENT ROADMAP ============
export const mockContentRoadmap: ContentRoadmapItem[] = [
  {
    id: "1",
    title: "Ultimate Guide to AI SEO Tools",
    targetKeyword: "ai seo tools",
    status: "writing",
    priority: "high",
    dueDate: "2024-01-20",
    estimatedTraffic: 8500,
  },
  {
    id: "2",
    title: "Google SGE Optimization Strategies",
    targetKeyword: "google sge optimization",
    status: "research",
    priority: "high",
    dueDate: "2024-01-25",
    estimatedTraffic: 5200,
  },
  {
    id: "3",
    title: "E-E-A-T Complete Guide",
    targetKeyword: "eeat seo guide",
    status: "idea",
    priority: "medium",
    dueDate: "2024-02-01",
    estimatedTraffic: 4100,
  },
  {
    id: "4",
    title: "Core Web Vitals Optimization",
    targetKeyword: "core web vitals optimization",
    status: "review",
    priority: "medium",
    dueDate: "2024-01-18",
    estimatedTraffic: 6800,
  },
];

// ============ USER DATA ============
export const mockUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  avatar: undefined,
  plan: "pro",
  credits: 750,
  maxCredits: 1000,
};

// ============ CHART DATA ============
export const mockTrafficChartData = [
  { date: "Jan 1", traffic: 42000, organic: 38000, paid: 4000 },
  { date: "Jan 8", traffic: 43500, organic: 39200, paid: 4300 },
  { date: "Jan 15", traffic: 44200, organic: 40100, paid: 4100 },
  { date: "Jan 22", traffic: 45800, organic: 41500, paid: 4300 },
  { date: "Jan 29", traffic: 44900, organic: 40800, paid: 4100 },
  { date: "Feb 5", traffic: 46500, organic: 42200, paid: 4300 },
  { date: "Feb 12", traffic: 45200, organic: 41000, paid: 4200 },
];

export const mockRankingChartData = [
  { date: "Week 1", avgPosition: 18.5, top10: 45, top3: 12 },
  { date: "Week 2", avgPosition: 17.2, top10: 48, top3: 14 },
  { date: "Week 3", avgPosition: 16.8, top10: 52, top3: 15 },
  { date: "Week 4", avgPosition: 15.5, top10: 55, top3: 18 },
  { date: "Week 5", avgPosition: 14.9, top10: 58, top3: 20 },
  { date: "Week 6", avgPosition: 14.3, top10: 62, top3: 22 },
];

// ============ KEYWORD MAGIC DATA ============
export const mockKeywordMagicResults: Keyword[] = [
  {
    id: "km-1",
    keyword: "seo tools",
    volume: 74000,
    kd: 72,
    cpc: 6.8,
    trend: "up",
    trendData: [70, 72, 75, 78, 82, 85, 88],
    intent: "commercial",
  },
  {
    id: "km-2",
    keyword: "free seo tools",
    volume: 33100,
    kd: 58,
    cpc: 4.2,
    trend: "up",
    trendData: [60, 65, 68, 72, 75, 78, 82],
    intent: "transactional",
  },
  {
    id: "km-3",
    keyword: "best free seo tools",
    volume: 12100,
    kd: 52,
    cpc: 5.1,
    trend: "stable",
    trendData: [50, 52, 48, 51, 50, 53, 51],
    intent: "commercial",
  },
  {
    id: "km-4",
    keyword: "seo tools for beginners",
    volume: 2900,
    kd: 32,
    cpc: 3.8,
    trend: "up",
    trendData: [30, 35, 40, 45, 50, 55, 60],
    intent: "informational",
  },
  {
    id: "km-5",
    keyword: "seo audit tools",
    volume: 4400,
    kd: 48,
    cpc: 7.2,
    trend: "up",
    trendData: [40, 45, 50, 55, 60, 65, 70],
    intent: "commercial",
  },
];

// ============ GEO DATA ============
export const mockGeoData = [
  { country: "US", countryName: "United States", volume: 45000, percentage: 38 },
  { country: "GB", countryName: "United Kingdom", volume: 18000, percentage: 15 },
  { country: "CA", countryName: "Canada", volume: 12000, percentage: 10 },
  { country: "AU", countryName: "Australia", volume: 9600, percentage: 8 },
  { country: "DE", countryName: "Germany", volume: 8400, percentage: 7 },
  { country: "IN", countryName: "India", volume: 7200, percentage: 6 },
  { country: "FR", countryName: "France", volume: 6000, percentage: 5 },
  { country: "Other", countryName: "Other", volume: 13800, percentage: 11 },
];
