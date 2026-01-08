/**
 * ============================================
 * TOPIC CLUSTERS - KEYWORD TYPES
 * ============================================
 * 
 * Types for the Topic Cluster Keyword Pool feature
 */

// SERP Features available in search results
export type SerpFeature = 
  | "featured_snippet" 
  | "paa" 
  | "video" 
  | "images" 
  | "shopping" 
  | "local_pack" 
  | "reviews" 
  | "knowledge_panel"

// Business potential scoring (0=None, 1=Low, 2=Med, 3=High)
export type BusinessPotential = 0 | 1 | 2 | 3

// Sort options for keyword table
export type SortField = 
  | "keyword" 
  | "volume" 
  | "kd" 
  | "cpc" 
  | "trafficPotential" 
  | "position" 
  | "clicks" 
  | "wordCount" 
  | "businessPotential" 
  | "source" 
  | "lastUpdated" 
  | "priorityScore"

export type SortDirection = "asc" | "desc"

// Keyword status for content action
export type KeywordStatus = "new" | "update" | "optimize" | "ranking" | null

// Main Keyword interface
export interface Keyword {
  id: string
  keyword: string
  source: string
  sourceTag?: string // Contextual tag (e.g., "Missing", "Decaying", "Breakout")
  isSelected: boolean
  
  // Core metrics (almost always available)
  volume: number | null
  kd: number | null
  cpc: number | null
  
  // Intent & Trend
  intent: "informational" | "transactional" | "navigational" | "commercial" | null
  trend: "up" | "down" | "stable" | null
  trendPercent: number | null
  
  // Advanced metrics
  trafficPotential: number | null      // Estimated traffic if #1 (or current traffic if ranked)
  clicks: number | null                 // Actual clicks (searches that result in clicks)
  cps: number | null                    // Clicks per search ratio
  businessPotential: BusinessPotential  // Manual score for value
  
  // Position data (from Rank Tracker, Competitor Gap)
  position: number | null               // Your current ranking
  positionChange: number | null         // Position change (+/-)
  rankingUrl: string | null             // Your URL that ranks
  
  // SERP Features
  serpFeatures: SerpFeature[]           // What SERP features appear
  hasFeaturedSnippet: boolean           // Opportunity for featured snippet
  
  // Clustering
  parentTopic: string | null            // Broader topic for grouping
  wordCount: number
  
  // Competition
  competition: "low" | "medium" | "high" | null  // PPC competition
  results: number | null                // Number of search results
  
  // Metadata
  lastUpdated: Date | null
  isRefreshing?: boolean // State for animation
}

// Project interface for keyword collections
export interface Project {
  id: string
  name: string
  description: string
  keywordCount: number
  totalVolume: number
  avgKd: number
  status: "draft" | "clustered" | "archived"
  createdAt: Date
  updatedAt: Date
  color: string
}

// Import source configuration
export interface ImportSource {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// Intent display configuration
export interface IntentConfig {
  label: string
  color: string
  short: string
}

// SERP feature icon configuration
export interface SerpFeatureConfig {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}
