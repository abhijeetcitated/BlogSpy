// ============================================
// COMMUNITY TRACKER - Mock Data
// ============================================

import type { CommunityKeyword, CommunitySummary, RedditPost, QuoraAnswer } from "../types"
import { SEO_SUBREDDITS } from "../constants"

// Sample keywords
const SAMPLE_COMMUNITY_KEYWORDS = [
  { keyword: "best seo tools reddit", volume: 12000, intent: "recommendation" as const },
  { keyword: "how to learn seo", volume: 28000, intent: "question" as const },
  { keyword: "ahrefs vs semrush", volume: 18000, intent: "comparison" as const },
  { keyword: "seo strategy discussion", volume: 8500, intent: "discussion" as const },
  { keyword: "keyword research tools", volume: 22000, intent: "recommendation" as const },
  { keyword: "backlink building tips", volume: 15000, intent: "discussion" as const },
  { keyword: "is seo worth it", volume: 9800, intent: "question" as const },
  { keyword: "rank tracker recommendation", volume: 6500, intent: "recommendation" as const },
  { keyword: "local seo guide", volume: 11000, intent: "question" as const },
  { keyword: "content marketing vs seo", volume: 7200, intent: "comparison" as const },
]

// Generate Reddit posts
const generateRedditPosts = (keyword: string): RedditPost[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `reddit-post-${i}`,
    title: `[Discussion] ${keyword} - What's your experience?`,
    subreddit: SEO_SUBREDDITS[Math.floor(Math.random() * SEO_SUBREDDITS.length)] as string,
    author: `user_${Math.floor(Math.random() * 10000)}`,
    upvotes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 100) + 5,
    url: `https://reddit.com/r/SEO/comments/abc123`,
    position: i + 1,
    isOurs: i === 0 && Math.random() > 0.7,
    createdAt: `${Math.floor(Math.random() * 30) + 1}d ago`,
  }))
}

// Generate Quora answers
const generateQuoraAnswers = (keyword: string): QuoraAnswer[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `quora-answer-${i}`,
    question: `What is the best way to ${keyword}?`,
    author: `Expert Author ${i + 1}`,
    views: Math.floor(Math.random() * 50000) + 1000,
    upvotes: Math.floor(Math.random() * 200) + 5,
    url: `https://quora.com/What-is-${keyword.replace(/\s+/g, "-")}`,
    position: i + 1,
    isOurs: i === 0 && Math.random() > 0.7,
    createdAt: `${Math.floor(Math.random() * 60) + 1}d ago`,
  }))
}

// Generate community keywords
export const generateCommunityKeywords = (): CommunityKeyword[] => {
  return SAMPLE_COMMUNITY_KEYWORDS.map((kw, index) => {
    const redditPosition = Math.random() > 0.2 ? Math.floor(Math.random() * 15) + 1 : null
    const quoraPosition = Math.random() > 0.3 ? Math.floor(Math.random() * 15) + 1 : null
    
    const redditPosts = generateRedditPosts(kw.keyword)
    const quoraAnswers = generateQuoraAnswers(kw.keyword)
    
    return {
      id: `community-kw-${index}`,
      keyword: kw.keyword,
      searchVolume: kw.volume,
      communityIntent: kw.intent,
      platforms: {
        reddit: redditPosition ? {
          position: redditPosition,
          subreddits: [...new Set(redditPosts.map(p => p.subreddit))],
          topPosts: redditPosts,
          totalMentions: Math.floor(Math.random() * 50) + 5,
          avgUpvotes: Math.round(redditPosts.reduce((sum, p) => sum + p.upvotes, 0) / redditPosts.length),
          hasOurContent: redditPosts.some(p => p.isOurs),
        } : null,
        quora: quoraPosition ? {
          position: quoraPosition,
          topAnswers: quoraAnswers,
          totalQuestions: Math.floor(Math.random() * 20) + 3,
          avgViews: Math.round(quoraAnswers.reduce((sum, a) => sum + a.views, 0) / quoraAnswers.length),
          hasOurContent: quoraAnswers.some(a => a.isOurs),
        } : null,
      },
      lastUpdated: "3 hours ago",
    }
  })
}

// Generate summary
export const generateCommunitySummary = (keywords: CommunityKeyword[]): CommunitySummary => {
  const redditRanking = keywords.filter(k => k.platforms.reddit?.position).length
  const quoraRanking = keywords.filter(k => k.platforms.quora?.position).length
  const totalMentions = keywords.reduce((sum, k) => sum + (k.platforms.reddit?.totalMentions || 0), 0)
  
  const positions = [
    ...keywords.map(k => k.platforms.reddit?.position).filter(Boolean),
    ...keywords.map(k => k.platforms.quora?.position).filter(Boolean),
  ] as number[]
  
  const avgPosition = positions.length > 0 
    ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
    : 0
  
  return {
    totalKeywords: keywords.length,
    redditRanking,
    quoraRanking,
    totalMentions,
    avgPosition,
    opportunityScore: Math.floor(Math.random() * 30) + 60,
  }
}

// Pre-generated data
export const MOCK_COMMUNITY_KEYWORDS = generateCommunityKeywords()
export const MOCK_COMMUNITY_SUMMARY = generateCommunitySummary(MOCK_COMMUNITY_KEYWORDS)
