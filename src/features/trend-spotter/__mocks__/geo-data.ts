import type { 
  CountryInterest, 
  CityData, 
  VelocityDataPoint, 
  NewsItem, 
  RelatedTopic, 
  BreakoutQuery,
  MapMarker,
  PublishTimingData,
  ContentTypeData
} from "../types"

// ============================================
// COUNTRY INTEREST DATA (for heatmap)
// ============================================
export const countryInterestData: Record<string, CountryInterest> = {
  "United States": { volume: 245000, percentage: 100 },
  "India": { volume: 189000, percentage: 77 },
  "United Kingdom": { volume: 67000, percentage: 27 },
  "Canada": { volume: 45000, percentage: 18 },
  "Australia": { volume: 38000, percentage: 15 },
  "Germany": { volume: 52000, percentage: 21 },
  "France": { volume: 34000, percentage: 14 },
  "Japan": { volume: 48000, percentage: 20 },
  "Brazil": { volume: 28000, percentage: 11 },
  "Netherlands": { volume: 18000, percentage: 7 },
  "Spain": { volume: 22000, percentage: 9 },
  "Italy": { volume: 22000, percentage: 9 },
  "Mexico": { volume: 19000, percentage: 8 },
  "Singapore": { volume: 15000, percentage: 6 },
  "South Korea": { volume: 35000, percentage: 14 },
  "China": { volume: 156000, percentage: 64 },
  "Indonesia": { volume: 32000, percentage: 13 },
  "Philippines": { volume: 18000, percentage: 7 },
  "Vietnam": { volume: 14000, percentage: 6 },
  "Thailand": { volume: 12000, percentage: 5 },
  "Poland": { volume: 16000, percentage: 7 },
  "Sweden": { volume: 11000, percentage: 4 },
  "Norway": { volume: 8000, percentage: 3 },
  "Denmark": { volume: 7000, percentage: 3 },
  "Finland": { volume: 6000, percentage: 2 },
  "Ireland": { volume: 9000, percentage: 4 },
  "Belgium": { volume: 10000, percentage: 4 },
  "Switzerland": { volume: 13000, percentage: 5 },
  "Austria": { volume: 8000, percentage: 3 },
  "New Zealand": { volume: 7000, percentage: 3 },
  "South Africa": { volume: 11000, percentage: 4 },
  "Nigeria": { volume: 14000, percentage: 6 },
  "Kenya": { volume: 5000, percentage: 2 },
  "Egypt": { volume: 8000, percentage: 3 },
  "Israel": { volume: 12000, percentage: 5 },
  "United Arab Emirates": { volume: 16000, percentage: 7 },
  "Saudi Arabia": { volume: 13000, percentage: 5 },
  "Turkey": { volume: 18000, percentage: 7 },
  "Russia": { volume: 28000, percentage: 11 },
  "Ukraine": { volume: 9000, percentage: 4 },
  "Argentina": { volume: 12000, percentage: 5 },
  "Chile": { volume: 7000, percentage: 3 },
  "Colombia": { volume: 10000, percentage: 4 },
  "Peru": { volume: 6000, percentage: 2 },
}

// ============================================
// CITY/REGION DATA (Cascading by country)
// ============================================
export const cityDataByCountry: Record<string, CityData[]> = {
  IN: [
    { name: "Maharashtra", value: 100 },
    { name: "Delhi", value: 88 },
    { name: "Karnataka", value: 82 },
    { name: "Tamil Nadu", value: 75 },
    { name: "Telangana", value: 70 },
  ],
  US: [
    { name: "California", value: 100 },
    { name: "Texas", value: 85 },
    { name: "New York", value: 82 },
    { name: "Florida", value: 75 },
    { name: "Washington", value: 70 },
  ],
  UK: [
    { name: "London", value: 100 },
    { name: "Manchester", value: 78 },
    { name: "Birmingham", value: 72 },
    { name: "Leeds", value: 65 },
    { name: "Glasgow", value: 60 },
  ],
  CA: [
    { name: "Ontario", value: 100 },
    { name: "British Columbia", value: 85 },
    { name: "Quebec", value: 78 },
    { name: "Alberta", value: 70 },
    { name: "Manitoba", value: 55 },
  ],
  AU: [
    { name: "New South Wales", value: 100 },
    { name: "Victoria", value: 88 },
    { name: "Queensland", value: 75 },
    { name: "Western Australia", value: 65 },
    { name: "South Australia", value: 55 },
  ],
  DEFAULT: [
    { name: "Region 1", value: 100 },
    { name: "Region 2", value: 75 },
    { name: "Region 3", value: 60 },
    { name: "Region 4", value: 45 },
    { name: "Region 5", value: 30 },
  ],
}

// ============================================
// VELOCITY CHART DATA
// ============================================
export const velocityData: VelocityDataPoint[] = [
  { month: "Jan", actual: 10, forecast: null },
  { month: "Feb", actual: 12, forecast: null },
  { month: "Mar", actual: 15, forecast: null },
  { month: "Apr", actual: 18, forecast: null },
  { month: "May", actual: 22, forecast: null },
  { month: "Jun", actual: 28, forecast: null },
  { month: "Jul", actual: 35, forecast: null },
  { month: "Aug", actual: 45, forecast: null },
  { month: "Sep", actual: 58, forecast: null },
  { month: "Oct", actual: 72, forecast: 72 },
  { month: "Nov", actual: null, forecast: 85 },
  { month: "Dec", actual: null, forecast: 95 },
]

// ============================================
// NEWS ITEMS (Triggering Events)
// ============================================
export const newsItems: NewsItem[] = [
  {
    source: "TechCrunch",
    logo: "TC",
    headline: "OpenAI Announces New Agentic AI Framework for Enterprise",
    time: "2 hours ago",
    sentiment: "Positive",
  },
  {
    source: "The Verge",
    logo: "TV",
    headline: "Microsoft Integrates Agentic AI into Copilot Suite",
    time: "5 hours ago",
    sentiment: "Positive",
  },
  {
    source: "Wired",
    logo: "W",
    headline: "The Rise of Autonomous AI Agents in 2025",
    time: "8 hours ago",
    sentiment: "Neutral",
  },
]

// ============================================
// RELATED TOPICS
// ============================================
export const relatedTopics: RelatedTopic[] = [
  { topic: "AI Agents Framework", growth: "+50%", status: "Rising" },
  { topic: "Autonomous AI", growth: "+30%", status: "Rising" },
  { topic: "LangChain", growth: null, status: "Top" },
  { topic: "AutoGPT", growth: "+18%", status: "Rising" },
  { topic: "AI Automation", growth: null, status: "Top" },
  { topic: "CrewAI", growth: "+64%", status: "Rising" },
]

// ============================================
// BREAKOUT QUERIES
// ============================================
export const breakoutQueries: BreakoutQuery[] = [
  { query: "best ai agents 2024", growth: "+2400%", isBreakout: true },
  { query: "how to build ai agents", growth: "+1800%", isBreakout: true },
  { query: "ai agents vs chatbots", growth: "+960%", isBreakout: false },
  { query: "ai agents for business", growth: "+1200%", isBreakout: true },
  { query: "free ai agent tools", growth: "+780%", isBreakout: false },
  { query: "ai agents tutorial", growth: "+1500%", isBreakout: true },
]

// ============================================
// MAP MARKERS (Hotspots)
// ============================================
export const mapMarkers: MapMarker[] = [
  { name: "North America", coordinates: [-100, 40], intensity: 0.9 },
  { name: "Europe", coordinates: [10, 50], intensity: 0.8 },
  { name: "Asia", coordinates: [100, 35], intensity: 0.95 },
  { name: "India", coordinates: [78, 20], intensity: 1.0 },
  { name: "Australia", coordinates: [133, -27], intensity: 0.5 },
]

// ============================================
// PUBLISH TIMING DATA
// ============================================
export const publishTimingData: PublishTimingData = {
  currentPosition: 25,
  windowStart: "Dec 14",
  windowEnd: "Dec 28",
  daysRemaining: 14,
  optimalDate: "Dec 21",
  optimalDay: "Saturday",
  urgency: "high",
  urgencyReason: "3 competitors already writing",
}

// ============================================
// CONTENT TYPE SUGGESTER DATA
// ============================================
export const contentTypeData: ContentTypeData = {
  primaryType: "blog",
  insight: "This keyword has high informational intent. Long-form blog post will perform best.",
  recommendations: [
    {
      type: "blog",
      label: "Blog Post",
      matchScore: 85,
      stars: 5,
      actionLabel: "Write",
      actionUrl: "/dashboard/creation/ai-writer",
    },
    {
      type: "video",
      label: "Video",
      matchScore: 45,
      stars: 2,
      actionLabel: "Script",
      actionUrl: "/dashboard/creation/ai-writer?type=script",
    },
    {
      type: "social",
      label: "Social Post",
      matchScore: 20,
      stars: 1,
      actionLabel: "Draft",
      actionUrl: "/dashboard/creation/ai-writer?type=social",
    },
  ],
}
