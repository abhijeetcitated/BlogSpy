/**
 * Mock Data Barrel Export
 * Central export point for all mock data
 */

// Keywords
export { mockKeywords, mockRelatedKeywords, mockQuestions } from "./keywords"
export type { MockKeyword } from "./keywords"

// Rankings
export { mockRankings, mockCompetitors, mockRankingSummary } from "./rankings"
export type { MockRanking, MockCompetitor } from "./rankings"

// Content
export { mockContent, mockContentSummary } from "./content"
export type { MockContent } from "./content"

// Trends
export { mockTrends, mockTrendCategories, mockTrendHistory } from "./trends"
export type { MockTrend } from "./trends"

// Users
export { mockUsers, demoUser, defaultUserSettings, createMockUser } from "./users"
export type { MockUser } from "./users"
