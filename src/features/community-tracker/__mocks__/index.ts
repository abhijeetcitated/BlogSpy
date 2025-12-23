// ============================================
// COMMUNITY TRACKER - Mock Data (Deterministic)
// ============================================

import type { CommunityKeyword, CommunitySummary, RedditPost, QuoraAnswer } from "../types"
import { SEO_SUBREDDITS } from "../constants"

// Sample keywords with static data
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

// Deterministic subreddit assignments per keyword index
const SUBREDDIT_MAPPING = [
  ["r/SEO", "r/marketing"],
  ["r/bigseo", "r/digitalmarketing"],
  ["r/SEO", "r/content_marketing"],
  ["r/blogging", "r/Entrepreneur"],
  ["r/startups", "r/SaaS"],
  ["r/webdev", "r/SEO"],
  ["r/marketing", "r/bigseo"],
  ["r/digitalmarketing", "r/blogging"],
  ["r/content_marketing", "r/Entrepreneur"],
  ["r/SaaS", "r/startups"],
]

// Static upvote/comment values per position
const REDDIT_STATS = [
  { upvotes: 342, comments: 67 },
  { upvotes: 256, comments: 45 },
  { upvotes: 189, comments: 32 },
  { upvotes: 134, comments: 28 },
  { upvotes: 87, comments: 15 },
]

const QUORA_STATS = [
  { views: 45000, upvotes: 156 },
  { views: 32000, upvotes: 98 },
  { views: 21000, upvotes: 67 },
  { views: 15000, upvotes: 45 },
  { views: 8500, upvotes: 23 },
]

// Generate Reddit posts (deterministic)
const generateRedditPosts = (keyword: string, keywordIndex: number): RedditPost[] => {
  const subreddits = SUBREDDIT_MAPPING[keywordIndex % SUBREDDIT_MAPPING.length]
  return Array(5).fill(null).map((_, i) => ({
    id: `reddit-post-${keywordIndex}-${i}`,
    title: `[Discussion] ${keyword} - What's your experience?`,
    subreddit: subreddits[i % subreddits.length] || "r/SEO",
    author: `user_${1000 + keywordIndex * 100 + i}`,
    upvotes: REDDIT_STATS[i].upvotes,
    comments: REDDIT_STATS[i].comments,
    url: `https://reddit.com/r/SEO/comments/${keywordIndex}${i}xyz`,
    position: i + 1,
    isOurs: i === 0 && keywordIndex % 3 === 0, // Deterministic: every 3rd keyword has our content
    createdAt: `${(i + 1) * 3}d ago`,
  }))
}

// Generate Quora answers (deterministic)
const generateQuoraAnswers = (keyword: string, keywordIndex: number): QuoraAnswer[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `quora-answer-${keywordIndex}-${i}`,
    question: `What is the best way to ${keyword}?`,
    author: `Expert Author ${i + 1}`,
    views: QUORA_STATS[i].views,
    upvotes: QUORA_STATS[i].upvotes,
    url: `https://quora.com/What-is-${keyword.replace(/\s+/g, "-")}`,
    position: i + 1,
    isOurs: i === 0 && keywordIndex % 4 === 0, // Deterministic: every 4th keyword has our answer
    createdAt: `${(i + 1) * 5}d ago`,
  }))
}

// Deterministic position assignments
const REDDIT_POSITIONS = [3, 5, null, 2, 8, 1, 12, 4, null, 6]
const QUORA_POSITIONS = [2, null, 4, 7, 3, null, 5, 1, 9, null]
const MENTION_COUNTS = [42, 28, 35, 19, 56, 31, 22, 48, 15, 39]
const QUESTION_COUNTS = [12, 8, 15, 6, 18, 9, 11, 14, 7, 16]

// Generate community keywords (deterministic)
export const generateCommunityKeywords = (): CommunityKeyword[] => {
  return SAMPLE_COMMUNITY_KEYWORDS.map((kw, index) => {
    const redditPosition = REDDIT_POSITIONS[index]
    const quoraPosition = QUORA_POSITIONS[index]
    
    const redditPosts = generateRedditPosts(kw.keyword, index)
    const quoraAnswers = generateQuoraAnswers(kw.keyword, index)
    
    return {
      id: `community-kw-${index}`,
      keyword: kw.keyword,
      searchVolume: kw.volume,
      communityIntent: kw.intent,
      platforms: {
        reddit: redditPosition !== null ? {
          position: redditPosition,
          subreddits: SUBREDDIT_MAPPING[index % SUBREDDIT_MAPPING.length],
          topPosts: redditPosts,
          totalMentions: MENTION_COUNTS[index],
          avgUpvotes: Math.round(redditPosts.reduce((sum, p) => sum + p.upvotes, 0) / redditPosts.length),
          hasOurContent: redditPosts.some(p => p.isOurs),
        } : null,
        quora: quoraPosition !== null ? {
          position: quoraPosition,
          topAnswers: quoraAnswers,
          totalQuestions: QUESTION_COUNTS[index],
          avgViews: Math.round(quoraAnswers.reduce((sum, a) => sum + a.views, 0) / quoraAnswers.length),
          hasOurContent: quoraAnswers.some(a => a.isOurs),
        } : null,
      },
      lastUpdated: "3 hours ago",
    }
  })
}

// Generate summary (deterministic)
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
    opportunityScore: 78, // Static value to prevent hydration mismatch
  }
}

// Pre-generated static data (no Math.random())
export const MOCK_COMMUNITY_KEYWORDS = generateCommunityKeywords()
export const MOCK_COMMUNITY_SUMMARY = generateCommunitySummary(MOCK_COMMUNITY_KEYWORDS)
