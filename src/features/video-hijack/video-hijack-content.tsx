"use client"

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  YouTubeIcon,
  TikTokIcon,
  SearchIcon,
  GlobeIcon,
  ViewsIcon,
  LikeIcon,
  CommentIcon,
  ShareIcon,
  SubscribersIcon,
  TrendingIcon,
  DurationIcon,
  ZapIcon,
  TagIcon,
  HashtagIcon,
  CopyIcon,
  ExternalLinkIcon,
  DownloadIcon,
  SoundIcon,
  ChartIcon,
  PlayIcon,
  VideoIcon,
  ClockIcon,
  TargetIcon,
  UsersIcon,
  LightbulbIcon,
  DollarIcon,
  CalendarIcon,
  TimerIcon,
  FlameIcon,
  BarChartIcon,
  EvergreenIcon,
  SeasonalIcon,
  BoltIcon,
  SortIcon,
  RecentIcon,
} from "@/components/icons/platform-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

// ============================================
// Types
// ============================================

type SearchMode = "domain" | "keyword"
type Platform = "youtube" | "tiktok"
type SortOption = "views" | "engagement" | "recent" | "hijackScore"

interface VideoResult {
  id: string
  title: string
  channel: string
  channelUrl: string
  subscribers: string
  views: number
  likes: number
  comments: number
  publishedAt: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  engagement: number
  tags: string[]
  hijackScore: number // 0-100 - How easy to hijack
  viralPotential: "low" | "medium" | "high"
  contentAge: "fresh" | "aging" | "outdated"
}

interface TikTokResult {
  id: string
  description: string
  creator: string
  creatorUrl: string
  followers: string
  views: number
  likes: number
  shares: number
  comments: number
  publishedAt: string
  duration: string
  videoUrl: string
  engagement: number
  hashtags: string[]
  hijackScore: number
  viralPotential: "low" | "medium" | "high"
  soundTrending: boolean
}

interface KeywordStats {
  keyword: string
  platform: Platform
  totalVideos: number
  totalViews: number
  avgViews: number
  avgEngagement: number
  topChannels: { name: string; videos: number }[]
  trendScore: number
  competition: "low" | "medium" | "high"
  // New fields
  hijackOpportunity: number // 0-100
  monetizationScore: number // 0-100 CPM potential
  seasonality: "evergreen" | "seasonal" | "trending"
  avgVideoLength: string
  bestUploadDay: string
  bestUploadTime: string
  searchVolume: number
  volumeTrend: "up" | "stable" | "down"
  contentTypes: { type: string; percentage: number }[]
  audienceAge: { range: string; percentage: number }[]
}

interface VideoSuggestion {
  titleFormats: string[]
  recommendedTags: string[]
  recommendedHashtags: string[]
  optimalLength: { youtube: string; tiktok: string }
  contentGaps: string[]
  bestTimeToPost: string
  difficulty: "easy" | "medium" | "hard"
}

// ============================================
// Mock Data Generator
// ============================================

function generateMockYouTubeResults(keyword: string): VideoResult[] {
  const channels = [
    { name: "Ahrefs", subs: "500K" },
    { name: "Neil Patel", subs: "1.2M" },
    { name: "Brian Dean", subs: "200K" },
    { name: "Moz", subs: "150K" },
    { name: "SEMrush", subs: "300K" },
  ]

  const viralOptions: ("low" | "medium" | "high")[] = ["low", "medium", "high"]
  const ageOptions: ("fresh" | "aging" | "outdated")[] = ["fresh", "aging", "outdated"]

  return Array.from({ length: 15 }, (_, i) => {
    const channel = channels[i % channels.length]
    const views = Math.floor(Math.random() * 500000) + 10000
    const likes = Math.floor(views * (Math.random() * 0.05 + 0.02))
    const monthsAgo = Math.floor(Math.random() * 12) + 1
    const hijackScore = Math.floor(Math.random() * 60) + 40 // 40-100
    
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
  }).sort((a, b) => b.hijackScore - a.hijackScore) // Sort by hijack opportunity
}

function generateMockTikTokResults(keyword: string): TikTokResult[] {
  const creators = [
    { name: "seoexpert", followers: "500K" },
    { name: "marketingtips", followers: "1.2M" },
    { name: "digitalmarketer", followers: "800K" },
    { name: "growthhacker", followers: "300K" },
    { name: "contentcreator", followers: "600K" },
  ]

  const viralOptions: ("low" | "medium" | "high")[] = ["low", "medium", "high"]

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

function generateKeywordStats(keyword: string, platform: Platform): KeywordStats {
  const isYouTube = platform === "youtube"
  const seasonalityOptions: ("evergreen" | "seasonal" | "trending")[] = ["evergreen", "seasonal", "trending"]
  const volumeTrendOptions: ("up" | "stable" | "down")[] = ["up", "stable", "down"]
  
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
    // New fields
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

function generateVideoSuggestion(keyword: string): VideoSuggestion {
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

// ============================================
// Helpers
// ============================================

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

function getCompetitionColor(competition: string) {
  switch (competition) {
    case "low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/30"
    case "high": return "text-red-500 bg-red-500/10 border-red-500/30"
    default: return "text-muted-foreground"
  }
}

function getHijackScoreColor(score: number) {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-amber-500"
  return "text-red-500"
}

function getHijackScoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

function getViralPotentialColor(potential: string) {
  switch (potential) {
    case "high": return "text-emerald-500 bg-emerald-500/10"
    case "medium": return "text-amber-500 bg-amber-500/10"
    case "low": return "text-slate-500 bg-slate-500/10"
    default: return "text-muted-foreground"
  }
}

function getContentAgeColor(age: string) {
  switch (age) {
    case "fresh": return "text-emerald-500"
    case "aging": return "text-amber-500"
    case "outdated": return "text-red-500"
    default: return "text-muted-foreground"
  }
}

function getSeasonalityIcon(seasonality: string) {
  switch (seasonality) {
    case "evergreen": return <EvergreenIcon size={24} className="text-emerald-500" />
    case "seasonal": return <SeasonalIcon size={24} className="text-blue-500" />
    case "trending": return <BoltIcon size={24} className="text-orange-500" />
    default: return <ChartIcon size={24} className="text-muted-foreground" />
  }
}

function getVolumeTrendIcon(trend: string) {
  switch (trend) {
    case "up": return { icon: ArrowUp, color: "text-emerald-500" }
    case "down": return { icon: ArrowDown, color: "text-red-500" }
    default: return { icon: Minus, color: "text-muted-foreground" }
  }
}

const ITEMS_PER_PAGE = 10

// ============================================
// Main Component
// ============================================

export function VideoHijackContent() {
  // Search state
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword")
  const [searchInput, setSearchInput] = useState("")
  const [searchedQuery, setSearchedQuery] = useState("")

  // Platform state
  const [platform, setPlatform] = useState<Platform>("youtube")

  // Results state
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [youtubeResults, setYoutubeResults] = useState<VideoResult[]>([])
  const [tiktokResults, setTiktokResults] = useState<TikTokResult[]>([])
  const [keywordStats, setKeywordStats] = useState<KeywordStats | null>(null)
  const [videoSuggestion, setVideoSuggestion] = useState<VideoSuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Sort & Filter
  const [sortBy, setSortBy] = useState<SortOption>("hijackScore")
  const [currentPage, setCurrentPage] = useState(1)

  // Sorted results
  const sortedYoutubeResults = useMemo(() => {
    const sorted = [...youtubeResults]
    switch (sortBy) {
      case "hijackScore": return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
      case "views": return sorted.sort((a, b) => b.views - a.views)
      case "engagement": return sorted.sort((a, b) => b.engagement - a.engagement)
      case "recent": return sorted
      default: return sorted
    }
  }, [youtubeResults, sortBy])

  const sortedTiktokResults = useMemo(() => {
    const sorted = [...tiktokResults]
    switch (sortBy) {
      case "hijackScore": return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
      case "views": return sorted.sort((a, b) => b.views - a.views)
      case "engagement": return sorted.sort((a, b) => b.engagement - a.engagement)
      case "recent": return sorted
      default: return sorted
    }
  }, [tiktokResults, sortBy])

  // Pagination
  const currentResults = platform === "youtube" ? sortedYoutubeResults : sortedTiktokResults
  const totalPages = Math.ceil(currentResults.length / ITEMS_PER_PAGE)
  const paginatedResults = currentResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ============================================
  // Handlers
  // ============================================

  const handleSearch = useCallback(() => {
    if (!searchInput.trim()) {
      toast.error("Enter a keyword or domain", {
        description: searchMode === "keyword"
          ? "Enter a keyword to find video opportunities"
          : "Enter your domain to find keywords with video results",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(false)

    // TODO: Replace with actual API calls
    // YouTube Data API v3: Search, Videos, Channels endpoints
    // TikTok API: Video search, hashtag search
    setTimeout(() => {
      const query = searchInput.trim()
      setSearchedQuery(query)
      setYoutubeResults(generateMockYouTubeResults(query))
      setTiktokResults(generateMockTikTokResults(query))
      setKeywordStats(generateKeywordStats(query, platform))
      setVideoSuggestion(generateVideoSuggestion(query))
      setIsLoading(false)
      setHasSearched(true)
      setCurrentPage(1)

      toast.success("Search Complete!", {
        description: `Found video results for "${query}"`,
      })
    }, 2000)
  }, [searchInput, searchMode, platform])

  const handleExport = useCallback(() => {
    const results = platform === "youtube" ? youtubeResults : tiktokResults
    if (results.length === 0) {
      toast.error("No data to export")
      return
    }

    const csv = platform === "youtube"
      ? [
          ["Title", "Channel", "Views", "Likes", "Comments", "Engagement %", "Duration", "URL"].join(","),
          ...youtubeResults.map(v => [
            `"${v.title}"`,
            v.channel,
            v.views,
            v.likes,
            v.comments,
            v.engagement.toFixed(2),
            v.duration,
            v.videoUrl,
          ].join(",")),
        ].join("\n")
      : [
          ["Description", "Creator", "Views", "Likes", "Shares", "Engagement %", "URL"].join(","),
          ...tiktokResults.map(v => [
            `"${v.description.slice(0, 50)}..."`,
            v.creator,
            v.views,
            v.likes,
            v.shares,
            v.engagement.toFixed(2),
            v.videoUrl,
          ].join(",")),
        ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${platform}-${searchedQuery}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Exported!", { description: `${results.length} videos exported` })
  }, [platform, youtubeResults, tiktokResults, searchedQuery])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied!")
  }

  // ============================================
  // Render
  // ============================================

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2 sm:gap-3 flex-nowrap">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <VideoIcon size={20} className="text-red-500" />
              </div>
              <span className="whitespace-nowrap">Video Keyword Research</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Find trending video opportunities on YouTube & TikTok
            </p>
          </div>

          {hasSearched && (
            <Button
              onClick={handleExport}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {/* ==================== SEARCH BOX ==================== */}
        <div className="rounded-xl border border-border bg-card p-6">
          {/* Search Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Search by:</span>
            <div className="flex rounded-lg border border-border p-1 bg-muted/30">
              <button
                onClick={() => setSearchMode("keyword")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                  searchMode === "keyword"
                    ? "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <SearchIcon className="w-3.5 h-3.5" />
                Keyword
              </button>
              <button
                onClick={() => setSearchMode("domain")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                  searchMode === "domain"
                    ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <GlobeIcon className="w-3.5 h-3.5" />
                Domain
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              {searchMode === "keyword" ? (
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder={
                  searchMode === "keyword"
                    ? "Enter keyword (e.g., SEO tutorial, best laptops 2024)"
                    : "Enter domain (e.g., example.com)"
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-11 bg-background border-border text-foreground"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchInput.trim()}
              className="h-11 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {searchMode === "keyword"
              ? "Search for any topic to see video performance, top creators, and opportunities"
              : "Enter your domain to find keywords where you rank that have video results in SERPs"}
          </p>
        </div>

        {/* ==================== LOADING STATE ==================== */}
        {isLoading && (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
              <VideoIcon size={24} className="text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-foreground font-medium mt-4">Searching videos...</p>
            <p className="text-muted-foreground text-sm mt-1">
              Fetching data from YouTube & TikTok
            </p>
          </div>
        )}

        {/* ==================== EMPTY STATE ==================== */}
        {!isLoading && !hasSearched && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 flex flex-col items-center justify-center text-center">
            <div className="flex gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <YouTubeIcon size={32} className="text-red-500" />
              </div>
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <TikTokIcon size={32} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Video Keyword Research</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Search any keyword to discover video opportunities on YouTube & TikTok.
              See views, engagement, top creators, and trend scores.
            </p>

            {/* What APIs provide */}
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
              <div className="p-4 rounded-xl bg-background border border-border text-left">
                <div className="flex items-center gap-2 mb-2">
                  <YouTubeIcon size={20} className="text-red-500" />
                  <span className="font-medium text-foreground">YouTube Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Video views, likes, comments</li>
                  <li>• Channel subscribers</li>
                  <li>• Video duration & publish date</li>
                  <li>• Search volume indicators</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border text-left">
                <div className="flex items-center gap-2 mb-2">
                  <TikTokIcon size={20} />
                  <span className="font-medium text-foreground">TikTok Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Video views, likes, shares</li>
                  <li>• Creator followers</li>
                  <li>• Trending hashtags</li>
                  <li>• Engagement rates</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================== RESULTS ==================== */}
        {!isLoading && hasSearched && (
          <>
            {/* Platform Tabs + Sort (stack on mobile) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-muted/50 border border-border">
                <button
                  onClick={() => { setPlatform("youtube"); setCurrentPage(1) }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                    platform === "youtube"
                      ? "bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <YouTubeIcon size={18} className={platform === "youtube" ? "text-white" : "text-red-500"} />
                  YouTube
                  <Badge variant={platform === "youtube" ? "outline" : "secondary"} className={cn("ml-1 text-xs", platform === "youtube" && "border-white/30 text-white")}>
                    {youtubeResults.length}
                  </Badge>
                </button>
                <button
                  onClick={() => { setPlatform("tiktok"); setCurrentPage(1) }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                    platform === "tiktok"
                      ? "bg-linear-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <TikTokIcon size={18} className={platform === "tiktok" ? "text-white" : "text-foreground"} />
                  TikTok
                  <Badge variant={platform === "tiktok" ? "outline" : "secondary"} className={cn("ml-1 text-xs", platform === "tiktok" && "border-white/30 text-white")}>
                    {tiktokResults.length}
                  </Badge>
                </button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                  <SortIcon size={16} className="mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hijackScore">
                    <span className="flex items-center gap-2">
                      <TargetIcon size={14} className="text-emerald-500" />
                      Hijack Score
                    </span>
                  </SelectItem>
                  <SelectItem value="views">
                    <span className="flex items-center gap-2">
                      <ViewsIcon size={14} className="text-blue-500" />
                      Most Views
                    </span>
                  </SelectItem>
                  <SelectItem value="engagement">
                    <span className="flex items-center gap-2">
                      <ChartIcon size={14} className="text-purple-500" />
                      Highest Engagement
                    </span>
                  </SelectItem>
                  <SelectItem value="recent">
                    <span className="flex items-center gap-2">
                      <RecentIcon size={14} className="text-amber-500" />
                      Most Recent
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ==================== COMPREHENSIVE STATS DASHBOARD ==================== */}
            {keywordStats && (
              <div className="space-y-4">
                {/* Row 1: Main Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {/* Hijack Opportunity - MAIN SCORE */}
                  <div className="col-span-2 rounded-xl border-2 border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 p-4">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                      <ZapIcon size={20} className="text-emerald-500" />
                      <span className="text-sm font-semibold">Hijack Opportunity</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold text-emerald-500">{keywordStats.hijackOpportunity}</p>
                      <span className="text-sm text-muted-foreground mb-1">/100</span>
                    </div>
                    <Progress value={keywordStats.hijackOpportunity} className="h-2 mt-2" />
                  </div>

                  {/* Monetization Score */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                      <DollarIcon size={16} className="text-amber-500" />
                      <span className="text-xs">CPM Potential</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{keywordStats.monetizationScore}</p>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>

                  {/* Search Volume */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <SearchIcon size={16} />
                      <span className="text-xs">Search Vol</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold text-foreground">{formatViews(keywordStats.searchVolume)}</p>
                      {(() => {
                        const trend = getVolumeTrendIcon(keywordStats.volumeTrend)
                        const TrendIcon = trend.icon
                        return <TrendIcon className={cn("w-4 h-4", trend.color)} />
                      })()}
                    </div>
                  </div>

                  {/* Total Videos */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <VideoIcon size={16} />
                      <span className="text-xs">Total Videos</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatViews(keywordStats.totalVideos)}
                    </p>
                  </div>

                  {/* Total Views */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <ViewsIcon size={16} />
                      <span className="text-xs">Total Views</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatViews(keywordStats.totalViews)}
                    </p>
                  </div>

                  {/* Avg Engagement */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <LikeIcon size={16} />
                      <span className="text-xs">Engagement</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {keywordStats.avgEngagement.toFixed(1)}%
                    </p>
                  </div>

                  {/* Competition */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TargetIcon size={16} />
                      <span className="text-xs">Competition</span>
                    </div>
                    <Badge className={cn("mt-1 capitalize", getCompetitionColor(keywordStats.competition))}>
                      {keywordStats.competition}
                    </Badge>
                  </div>
                </div>

                {/* Row 2: Insights Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {/* Seasonality */}
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    {getSeasonalityIcon(keywordStats.seasonality)}
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-semibold capitalize">{keywordStats.seasonality}</p>
                    </div>
                  </div>

                  {/* Best Upload Day */}
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    <CalendarIcon size={20} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Best Day</p>
                      <p className="text-sm font-semibold">{keywordStats.bestUploadDay}</p>
                    </div>
                  </div>

                  {/* Best Upload Time */}
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    <ClockIcon size={20} className="text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Best Time</p>
                      <p className="text-sm font-semibold">{keywordStats.bestUploadTime}</p>
                    </div>
                  </div>

                  {/* Avg Video Length */}
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    <TimerIcon size={20} className="text-cyan-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Length</p>
                      <p className="text-sm font-semibold">{keywordStats.avgVideoLength}</p>
                    </div>
                  </div>

                  {/* Trend Score */}
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    <FlameIcon size={20} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Trend Score</p>
                      <p className="text-sm font-semibold text-orange-500">{keywordStats.trendScore}/100</p>
                    </div>
                  </div>

                  {/* Avg Views */}
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    <PlayIcon size={20} className="text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Views</p>
                      <p className="text-sm font-semibold">{formatViews(keywordStats.avgViews)}</p>
                    </div>
                  </div>
                </div>

                {/* Row 3: Content Type & Audience Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Type Distribution */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <VideoIcon size={16} className="text-purple-500" />
                      Content Type Distribution
                    </h3>
                    <div className="space-y-2">
                      {keywordStats.contentTypes.map((ct) => (
                        <div key={ct.type} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20">{ct.type}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${ct.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">{ct.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audience Age Distribution */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <UsersIcon size={16} className="text-blue-500" />
                      Audience Age Distribution
                    </h3>
                    <div className="space-y-2">
                      {keywordStats.audienceAge.map((age) => (
                        <div key={age.range} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-12">{age.range}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${age.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">{age.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid with Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Left: Results List */}
              <div className="xl:col-span-3 space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {paginatedResults.length} of {currentResults.length} videos for &quot;{searchedQuery}&quot;
                  </span>
                  {totalPages > 1 && <span>Page {currentPage} of {totalPages}</span>}
                </div>

              {/* YouTube Results */}
              {platform === "youtube" && (
                <div className="space-y-3">
                  {(paginatedResults as VideoResult[]).map((video, i) => (
                    <div
                      key={video.id}
                      className="rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-red-500/30 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Top Row: Rank + Score + Badges (Mobile) */}
                        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-xs sm:text-sm font-bold text-red-500">
                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={cn(
                                "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center border-2",
                                video.hijackScore >= 80 
                                  ? "border-emerald-500 bg-emerald-500/10" 
                                  : video.hijackScore >= 60 
                                  ? "border-amber-500 bg-amber-500/10"
                                  : "border-red-500 bg-red-500/10"
                              )}>
                                <ZapIcon size={10} className={cn("sm:w-3 sm:h-3", getHijackScoreColor(video.hijackScore))} />
                                <span className={cn("text-[10px] sm:text-xs font-bold", getHijackScoreColor(video.hijackScore))}>
                                  {video.hijackScore}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">Hijack Score: {video.hijackScore}/100</p>
                              <p className="text-xs text-muted-foreground">Higher = easier to outrank</p>
                            </TooltipContent>
                          </Tooltip>
                          {/* Badges - Mobile inline with rank */}
                          <div className="flex gap-1 sm:hidden ml-auto">
                            <Badge className={cn("text-[10px] capitalize", getViralPotentialColor(video.viralPotential))}>
                              <FlameIcon size={8} className="mr-0.5" />
                              {video.viralPotential}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start gap-2">
                            <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-2 sm:truncate flex-1">{video.title}</h3>
                            {/* Badges - Desktop only */}
                            <div className="hidden sm:flex gap-1.5 shrink-0">
                              <Badge className={cn("text-xs capitalize", getViralPotentialColor(video.viralPotential))}>
                                <FlameIcon size={10} className="mr-1" />
                                {video.viralPotential}
                              </Badge>
                              <Badge variant="outline" className={cn("text-xs", getContentAgeColor(video.contentAge))}>
                                <ClockIcon size={10} className="mr-1" />
                                {video.contentAge}
                              </Badge>
                            </div>
                          </div>
                          {/* Creator Info */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <SubscribersIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                              {video.channel} ({video.subscribers})
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span className="flex items-center gap-1">
                              <DurationIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                              {video.duration}
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span>{video.publishedAt}</span>
                          </div>
                          
                          {/* Stats - Mobile: Inline row */}
                          <div className="flex sm:hidden items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40">
                              <ViewsIcon size={12} className="text-muted-foreground" />
                              <span className="font-semibold">{formatViews(video.views)}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40">
                              <LikeIcon size={12} className="text-muted-foreground" />
                              <span className="font-semibold">{formatViews(video.likes)}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40">
                              <CommentIcon size={12} className="text-muted-foreground" />
                              <span className="font-semibold">{formatViews(video.comments)}</span>
                            </div>
                          </div>

                          {/* YouTube Tags */}
                          <div className="flex gap-1 flex-wrap">
                            {video.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] sm:text-xs bg-red-500/10 text-red-500 cursor-pointer hover:bg-red-500/20 px-1.5 py-0"
                                onClick={() => handleCopy(tag)}
                              >
                                <TagIcon size={8} className="mr-0.5 sm:w-2.5 sm:h-2.5 sm:mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {video.tags.length > 3 && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                                +{video.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stats - Desktop */}
                        <div className="hidden sm:flex items-center gap-3 text-sm shrink-0">
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1 justify-center">
                              <ViewsIcon size={14} className="text-muted-foreground" />
                              <p className="font-bold text-foreground">{formatViews(video.views)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">views</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1 justify-center">
                              <LikeIcon size={14} className="text-muted-foreground" />
                              <p className="font-bold text-foreground">{formatViews(video.likes)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">likes</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1 justify-center">
                              <CommentIcon size={14} className="text-muted-foreground" />
                              <p className="font-bold text-foreground">{formatViews(video.comments)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">comments</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                            <p className="font-bold text-emerald-500">{video.engagement.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">engage</p>
                          </div>
                        </div>

                        {/* Actions - Always Visible */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-red-500/10 hover:text-red-500"
                                onClick={() => handleCopy(video.title)}
                              >
                                <CopyIcon size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Copy title</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-red-500/10 hover:text-red-500"
                                onClick={() => window.open(video.videoUrl, "_blank")}
                              >
                                <ExternalLinkIcon size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Watch video</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TikTok Results */}
              {platform === "tiktok" && (
                <div className="space-y-3">
                  {(paginatedResults as TikTokResult[]).map((video, i) => (
                    <div
                      key={video.id}
                      className="rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-cyan-500/30 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Top Row: Rank + Score + Badges (Mobile) */}
                        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-xs sm:text-sm font-bold text-cyan-500">
                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={cn(
                                "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center border-2",
                                video.hijackScore >= 80 
                                  ? "border-emerald-500 bg-emerald-500/10" 
                                  : video.hijackScore >= 60 
                                  ? "border-amber-500 bg-amber-500/10"
                                  : "border-red-500 bg-red-500/10"
                              )}>
                                <ZapIcon size={10} className={cn("sm:w-3 sm:h-3", getHijackScoreColor(video.hijackScore))} />
                                <span className={cn("text-[10px] sm:text-xs font-bold", getHijackScoreColor(video.hijackScore))}>
                                  {video.hijackScore}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">Hijack Score: {video.hijackScore}/100</p>
                              <p className="text-xs text-muted-foreground">Higher = easier to outrank</p>
                            </TooltipContent>
                          </Tooltip>
                          {/* Badges - Mobile inline with rank */}
                          <div className="flex gap-1 sm:hidden ml-auto">
                            <Badge className={cn("text-[10px] capitalize", getViralPotentialColor(video.viralPotential))}>
                              <FlameIcon size={8} className="mr-0.5" />
                              {video.viralPotential}
                            </Badge>
                            {video.soundTrending && (
                              <Badge className="text-[10px] bg-pink-500/10 text-pink-500">
                                <SoundIcon size={8} className="mr-0.5" />
                                Trending
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start gap-2">
                            <p className="font-medium text-foreground text-sm sm:text-base line-clamp-2 flex-1">{video.description}</p>
                            {/* Badges - Desktop only */}
                            <div className="hidden sm:flex gap-1.5 shrink-0">
                              <Badge className={cn("text-xs capitalize", getViralPotentialColor(video.viralPotential))}>
                                <FlameIcon size={10} className="mr-1" />
                                {video.viralPotential}
                              </Badge>
                              {video.soundTrending && (
                                <Badge className="text-xs bg-pink-500/10 text-pink-500">
                                  <SoundIcon size={10} className="mr-1" />
                                  Trending Sound
                                </Badge>
                              )}
                            </div>
                          </div>
                          {/* Creator Info */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <SubscribersIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                              @{video.creator} ({video.followers})
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span className="flex items-center gap-1">
                              <DurationIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                              {video.duration}
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span>{video.publishedAt}</span>
                          </div>
                          
                          {/* Stats - Mobile: Inline row */}
                          <div className="flex sm:hidden items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40">
                              <ViewsIcon size={12} className="text-muted-foreground" />
                              <span className="font-semibold">{formatViews(video.views)}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40">
                              <LikeIcon size={12} className="text-muted-foreground" />
                              <span className="font-semibold">{formatViews(video.likes)}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40">
                              <ShareIcon size={12} className="text-muted-foreground" />
                              <span className="font-semibold">{formatViews(video.shares)}</span>
                            </div>
                          </div>

                          {/* TikTok Hashtags */}
                          <div className="flex gap-1 flex-wrap">
                            {video.hashtags.slice(0, 4).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] sm:text-xs bg-cyan-500/10 text-cyan-500 cursor-pointer hover:bg-cyan-500/20 px-1.5 py-0"
                                onClick={() => handleCopy(`#${tag}`)}
                              >
                                <HashtagIcon size={8} className="mr-0.5 sm:w-2.5 sm:h-2.5" />
                                {tag}
                              </Badge>
                            ))}
                            {video.hashtags.length > 4 && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                                +{video.hashtags.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stats - Desktop */}
                        <div className="hidden sm:flex items-center gap-3 text-sm shrink-0">
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1 justify-center">
                              <ViewsIcon size={14} className="text-muted-foreground" />
                              <p className="font-bold text-foreground">{formatViews(video.views)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">views</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1 justify-center">
                              <LikeIcon size={14} className="text-muted-foreground" />
                              <p className="font-bold text-foreground">{formatViews(video.likes)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">likes</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1 justify-center">
                              <ShareIcon size={14} className="text-muted-foreground" />
                              <p className="font-bold text-foreground">{formatViews(video.shares)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">shares</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                            <p className="font-bold text-emerald-500">{video.engagement.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">engage</p>
                          </div>
                        </div>

                        {/* Actions - Always Visible */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-cyan-500/10 hover:text-cyan-500"
                                onClick={() => handleCopy(video.description)}
                              >
                                <CopyIcon size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Copy description</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-cyan-500/10 hover:text-cyan-500"
                                onClick={() => window.open(video.videoUrl, "_blank")}
                              >
                                <ExternalLinkIcon size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Watch video</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
              </div>

              {/* Right Sidebar */}
              <div className="xl:col-span-1 space-y-4">
                {/* Top Creators/Channels */}
                {keywordStats && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <UsersIcon size={16} className="text-purple-500" />
                      </div>
                      {platform === "youtube" ? "Top Channels" : "Top Creators"}
                    </h3>
                    <div className="space-y-3">
                      {keywordStats.topChannels.map((channel, i) => (
                        <div key={channel.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-500">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{channel.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {channel.videos} videos
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video SEO Tips */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <LightbulbIcon size={16} className="text-amber-500" />
                    </div>
                    Video SEO Tips
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Focus on keywords with high views but low engagement",
                      "Longer videos (10-15 min) rank better on YouTube",
                      "Add timestamps and chapters for better CTR",
                      "Create video for queries with \"how to\" intent",
                      "First 24-48 hours engagement is crucial",
                    ].map((tip, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <span className="text-amber-500 mt-0.5">💡</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Keywords */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <TrendingIcon size={16} className="text-cyan-500" />
                    </div>
                    Related Topics
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      `${searchedQuery} tutorial`,
                      `${searchedQuery} for beginners`,
                      `best ${searchedQuery}`,
                      `${searchedQuery} tips`,
                      `${searchedQuery} 2024`,
                      `how to ${searchedQuery}`,
                    ].map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setSearchInput(topic)
                          handleCopy(topic)
                        }}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <BarChartIcon size={16} className="text-emerald-500" />
                    </div>
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Avg Views</span>
                      <span className="text-sm font-semibold text-foreground">
                        {keywordStats ? formatViews(keywordStats.avgViews) : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Best Performer</span>
                      <span className="text-sm font-semibold text-emerald-500">
                        {platform === "youtube" && youtubeResults[0] 
                          ? formatViews(youtubeResults[0].views)
                          : platform === "tiktok" && tiktokResults[0]
                          ? formatViews(tiktokResults[0].views)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Avg Engagement</span>
                      <span className="text-sm font-semibold text-foreground">
                        {keywordStats ? `${keywordStats.avgEngagement.toFixed(1)}%` : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Videos Analyzed</span>
                      <span className="text-sm font-semibold text-foreground">
                        {platform === "youtube" ? youtubeResults.length : tiktokResults.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== VIDEO CREATION SUGGESTIONS ==================== */}
            {videoSuggestion && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-linear-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30">
                      <ZapIcon size={20} className="text-violet-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">Video Creation Insights</h3>
                      <p className="text-xs text-muted-foreground">Suggestions based on top performing videos</p>
                    </div>
                  </div>
                  {showSuggestions ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {showSuggestions && (
                  <div className="p-4 pt-0 space-y-4">
                    {/* Title Suggestions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <LightbulbIcon size={16} className="text-amber-500" />
                        Recommended Title Formats
                      </div>
                      <div className="space-y-2">
                        {videoSuggestion.titleFormats.slice(0, 3).map((title, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border group"
                          >
                            <p className="text-sm text-foreground">{title}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopy(title)}
                            >
                              <CopyIcon size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags & Hashtags */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* YouTube Tags */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <TagIcon size={16} className="text-red-500" />
                          YouTube Tags
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {videoSuggestion.recommendedTags.slice(0, 8).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-red-500/10 text-red-500 cursor-pointer hover:bg-red-500/20"
                              onClick={() => handleCopy(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleCopy(videoSuggestion.recommendedTags.join(", "))}
                        >
                          <CopyIcon size={14} className="mr-2" />
                          Copy All Tags
                        </Button>
                      </div>

                      {/* TikTok Hashtags */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <HashtagIcon size={16} className="text-cyan-500" />
                          TikTok Hashtags
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {videoSuggestion.recommendedHashtags.slice(0, 8).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-cyan-500/10 text-cyan-500 cursor-pointer hover:bg-cyan-500/20"
                              onClick={() => handleCopy(`#${tag}`)}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleCopy(videoSuggestion.recommendedHashtags.map(t => `#${t}`).join(" "))}
                        >
                          <CopyIcon size={14} className="mr-2" />
                          Copy All Hashtags
                        </Button>
                      </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DurationIcon size={14} />
                          <span className="text-xs">YouTube Length</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{videoSuggestion.optimalLength.youtube}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DurationIcon size={14} />
                          <span className="text-xs">TikTok Length</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{videoSuggestion.optimalLength.tiktok}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingIcon size={14} />
                          <span className="text-xs">Best Time</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{videoSuggestion.bestTimeToPost}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TargetIcon size={14} />
                          <span className="text-xs">Difficulty</span>
                        </div>
                        <Badge className={cn("capitalize", getCompetitionColor(videoSuggestion.difficulty))}>
                          {videoSuggestion.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Gaps */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <TargetIcon size={16} className="text-emerald-500" />
                        Content Gaps & Opportunities
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {videoSuggestion.contentGaps.map((gap, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                          >
                            <ZapIcon size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground">{gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
