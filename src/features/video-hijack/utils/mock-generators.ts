// Mock Data Generators for Video Hijack

import type {
  VideoResult,
  TikTokResult,
  KeywordStats,
  VideoSuggestion,
  Platform,
  ViralPotential,
  ContentAge,
  Seasonality,
  VolumeTrend,
} from "../types/video-search.types"

/**
 * Generate mock YouTube video results
 */
export function generateMockYouTubeResults(keyword: string): VideoResult[] {
  const channels = [
    { name: "Ahrefs", subs: "500K" },
    { name: "Neil Patel", subs: "1.2M" },
    { name: "Brian Dean", subs: "200K" },
    { name: "Moz", subs: "150K" },
    { name: "SEMrush", subs: "300K" },
  ]

  const viralOptions: ViralPotential[] = ["low", "medium", "high"]
  const ageOptions: ContentAge[] = ["fresh", "aging", "outdated"]

  return Array.from({ length: 15 }, (_, i) => {
    const channel = channels[i % channels.length]
    const views = Math.floor(Math.random() * 500000) + 10000
    const likes = Math.floor(views * (Math.random() * 0.05 + 0.02))
    const monthsAgo = Math.floor(Math.random() * 12) + 1
    const hijackScore = Math.floor(Math.random() * 60) + 40

    return {
      id: `yt-${i}`,
      title: `${keyword} - Complete Guide ${2024 - (i % 3)} | ${channel.name}`,
      channel: channel.name,
      channelUrl: `https://youtube.com/@${channel.name.toLowerCase().replace(" ", "")}`,
      subscribers: channel.subs,
      views,
      likes,
      comments: Math.floor(likes * 0.1),
      publishedAt: `${monthsAgo} months ago`,
      duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      thumbnailUrl: "",
      videoUrl: `https://youtube.com/watch?v=${Math.random().toString(36).slice(2, 13)}`,
      engagement: (likes / views) * 100,
      tags: [
        keyword.toLowerCase(),
        `${keyword} tutorial`,
        `${keyword} guide`,
        `how to ${keyword}`,
        `${keyword} tips`,
        `${keyword} 2024`,
        "beginner guide",
        "step by step",
      ].slice(0, 5 + Math.floor(Math.random() * 3)),
      hijackScore,
      viralPotential: viralOptions[Math.floor(Math.random() * 3)],
      contentAge: ageOptions[monthsAgo <= 3 ? 0 : monthsAgo <= 8 ? 1 : 2],
    }
  }).sort((a, b) => b.hijackScore - a.hijackScore)
}

/**
 * Generate mock TikTok video results
 */
export function generateMockTikTokResults(keyword: string): TikTokResult[] {
  const creators = [
    { name: "seoexpert", followers: "500K" },
    { name: "marketingtips", followers: "1.2M" },
    { name: "digitalmarketer", followers: "800K" },
    { name: "growthhacker", followers: "300K" },
    { name: "contentcreator", followers: "600K" },
  ]

  const viralOptions: ViralPotential[] = ["low", "medium", "high"]

  return Array.from({ length: 15 }, (_, i) => {
    const creator = creators[i % creators.length]
    const views = Math.floor(Math.random() * 2000000) + 50000
    const likes = Math.floor(views * (Math.random() * 0.15 + 0.05))
    const hijackScore = Math.floor(Math.random() * 60) + 40

    return {
      id: `tt-${i}`,
      description: `${keyword} tips you NEED to know 🔥 #${keyword.replace(/\s+/g, "")} #viral #tips`,
      creator: creator.name,
      creatorUrl: `https://tiktok.com/@${creator.name}`,
      followers: creator.followers,
      views,
      likes,
      shares: Math.floor(likes * 0.2),
      comments: Math.floor(likes * 0.05),
      publishedAt: `${Math.floor(Math.random() * 30) + 1}d ago`,
      duration: `0:${String(Math.floor(Math.random() * 45) + 15).padStart(2, "0")}`,
      videoUrl: `https://tiktok.com/@${creator.name}/video/${Math.random().toString(36).slice(2, 13)}`,
      engagement: (likes / views) * 100,
      hashtags: [keyword.replace(/\s+/g, ""), "viral", "fyp", "tips", "trending"],
      hijackScore,
      viralPotential: viralOptions[Math.floor(Math.random() * 3)],
      soundTrending: Math.random() > 0.5,
    }
  }).sort((a, b) => b.hijackScore - a.hijackScore)
}

/**
 * Generate keyword statistics
 */
export function generateKeywordStats(keyword: string, platform: Platform): KeywordStats {
  const isYouTube = platform === "youtube"
  const seasonalityOptions: Seasonality[] = ["evergreen", "seasonal", "trending"]
  const volumeTrendOptions: VolumeTrend[] = ["up", "stable", "down"]

  return {
    keyword,
    platform,
    totalVideos: Math.floor(Math.random() * 10000) + 1000,
    totalViews: Math.floor(Math.random() * 50000000) + 1000000,
    avgViews: Math.floor(Math.random() * 100000) + 10000,
    avgEngagement: Math.random() * 8 + 2,
    topChannels: [
      { name: isYouTube ? "Ahrefs" : "seoexpert", videos: Math.floor(Math.random() * 50) + 10 },
      { name: isYouTube ? "Neil Patel" : "marketingtips", videos: Math.floor(Math.random() * 40) + 5 },
      { name: isYouTube ? "Moz" : "growthhacker", videos: Math.floor(Math.random() * 30) + 5 },
    ],
    trendScore: Math.floor(Math.random() * 40) + 60,
    competition: Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
    hijackOpportunity: Math.floor(Math.random() * 40) + 60,
    monetizationScore: Math.floor(Math.random() * 50) + 50,
    seasonality: seasonalityOptions[Math.floor(Math.random() * 3)],
    avgVideoLength: isYouTube ? "12:30" : "0:45",
    bestUploadDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)],
    bestUploadTime: ["9 AM", "12 PM", "3 PM", "6 PM", "9 PM"][Math.floor(Math.random() * 5)] + " EST",
    searchVolume: Math.floor(Math.random() * 50000) + 5000,
    volumeTrend: volumeTrendOptions[Math.floor(Math.random() * 3)],
    contentTypes: [
      { type: "Tutorial", percentage: Math.floor(Math.random() * 30) + 25 },
      { type: "Review", percentage: Math.floor(Math.random() * 20) + 15 },
      { type: "Comparison", percentage: Math.floor(Math.random() * 15) + 10 },
      { type: "How-to", percentage: Math.floor(Math.random() * 20) + 15 },
      { type: "Other", percentage: Math.floor(Math.random() * 15) + 5 },
    ],
    audienceAge: [
      { range: "18-24", percentage: Math.floor(Math.random() * 20) + 15 },
      { range: "25-34", percentage: Math.floor(Math.random() * 25) + 25 },
      { range: "35-44", percentage: Math.floor(Math.random() * 20) + 15 },
      { range: "45-54", percentage: Math.floor(Math.random() * 15) + 10 },
      { range: "55+", percentage: Math.floor(Math.random() * 10) + 5 },
    ],
  }
}

/**
 * Generate video suggestions for a keyword
 */
export function generateVideoSuggestion(keyword: string): VideoSuggestion {
  return {
    titleFormats: [
      `${keyword} - Complete Beginner's Guide [2024]`,
      `How to ${keyword} in 10 Minutes (Step by Step)`,
      `${keyword} Tutorial: Everything You Need to Know`,
      `I Tried ${keyword} for 30 Days - Here's What Happened`,
      `${keyword} Explained Simply | No BS Guide`,
    ],
    recommendedTags: [
      keyword.toLowerCase(),
      `${keyword} tutorial`,
      `${keyword} guide`,
      `how to ${keyword}`,
      `${keyword} for beginners`,
      `${keyword} tips`,
      `${keyword} 2024`,
      `learn ${keyword}`,
      `${keyword} explained`,
      `best ${keyword}`,
    ],
    recommendedHashtags: [
      keyword.replace(/\s+/g, "").toLowerCase(),
      `${keyword.replace(/\s+/g, "")}tips`,
      "viral",
      "fyp",
      "tutorial",
      "learnontiktok",
      "trending",
      "howto",
    ],
    optimalLength: {
      youtube: "8-15 minutes",
      tiktok: "30-60 seconds",
    },
    contentGaps: [
      `No recent videos on "${keyword} for beginners"`,
      `Missing: Step-by-step walkthrough content`,
      `Opportunity: "${keyword}" case studies`,
      `Low competition: "${keyword}" common mistakes`,
    ],
    bestTimeToPost: "Tuesday-Thursday, 2-4 PM EST",
    difficulty: Math.random() > 0.6 ? "hard" : Math.random() > 0.3 ? "medium" : "easy",
  }
}
