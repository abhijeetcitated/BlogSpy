// ============================================
// SOCIAL TRACKER - Mock Data
// ============================================

import type { SocialKeyword, SocialSummary, PinterestPin, Tweet, InstagramPost } from "../types"

// Sample keywords
const SAMPLE_SOCIAL_KEYWORDS = [
  { keyword: "seo infographic", volume: 8500, intent: "visual" as const },
  { keyword: "content marketing tips", volume: 22000, intent: "trending" as const },
  { keyword: "blogging strategies", volume: 15000, intent: "discussion" as const },
  { keyword: "affiliate marketing", volume: 45000, intent: "shopping" as const },
  { keyword: "digital marketing trends", volume: 28000, intent: "trending" as const },
  { keyword: "social media strategy", volume: 32000, intent: "visual" as const },
  { keyword: "seo checklist", volume: 18000, intent: "visual" as const },
  { keyword: "keyword research tips", volume: 12000, intent: "discussion" as const },
  { keyword: "link building guide", volume: 9500, intent: "visual" as const },
  { keyword: "content calendar template", volume: 14000, intent: "shopping" as const },
]

// Generate Pinterest pins
const generatePinterestPins = (): PinterestPin[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `pin-${i}`,
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

// Generate tweets
const generateTweets = (): Tweet[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `tweet-${i}`,
    text: `🚀 Just discovered this amazing SEO strategy that increased our traffic by 300%! Here's the thread...`,
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

// Generate Instagram posts
const generateInstagramPosts = (): InstagramPost[] => {
  return Array(5).fill(null).map((_, i) => ({
    id: `insta-${i}`,
    caption: `The secret to ranking #1 on Google 🔥 Save this for later! #seo #digitalmarketing`,
    imageUrl: "/placeholder.svg",
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 200) + 10,
    saves: Math.floor(Math.random() * 500) + 20,
    position: i + 1,
    author: `@marketing_guru_${i + 1}`,
    isOurs: i === 0 && Math.random() > 0.7,
  }))
}

// Generate social keywords
export const generateSocialKeywords = (): SocialKeyword[] => {
  return SAMPLE_SOCIAL_KEYWORDS.map((kw, index) => {
    const pinterestPosition = Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : null
    const twitterPosition = Math.random() > 0.4 ? Math.floor(Math.random() * 20) + 1 : null
    const instagramPosition = Math.random() > 0.4 ? Math.floor(Math.random() * 20) + 1 : null
    
    const pinterestPins = generatePinterestPins()
    const tweets = generateTweets()
    const instaPosts = generateInstagramPosts()
    
    return {
      id: `social-kw-${index}`,
      keyword: kw.keyword,
      searchVolume: kw.volume,
      socialIntent: kw.intent,
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
      lastUpdated: "4 hours ago",
    }
  })
}

// Generate summary
export const generateSocialSummary = (keywords: SocialKeyword[]): SocialSummary => {
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

// Pre-generated data
export const MOCK_SOCIAL_KEYWORDS = generateSocialKeywords()
export const MOCK_SOCIAL_SUMMARY = generateSocialSummary(MOCK_SOCIAL_KEYWORDS)
