// ============================================
// KEYWORD DETAILS DRAWER - Social Tab
// ============================================
// Displays social media opportunities for the keyword
// with "Load Social Data" functionality
// ============================================

"use client"

import * as React from "react"
import {
  MessageCircle,
  Users,
  TrendingUp,
  Youtube,
  Loader2,
  RefreshCw,
  Hash,
  ThumbsUp,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import type { Keyword } from "../../types"
import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"

// ============================================
// TYPES
// ============================================

interface SocialTabProps {
  keyword: Keyword
}

interface RedditPost {
  subreddit: string
  title: string
  upvotes: number
  comments: number
  recency: string
}

interface YouTubeVideo {
  title: string
  channel: string
  views: number
  likes: number
  published: string
}

interface TikTokData {
  hashtag: string
  views: number
  videos: number
  trending: boolean
}

interface SocialData {
  reddit: {
    posts: RedditPost[]
    totalMentions: number
    topSubreddits: string[]
    sentimentScore: number
  }
  youtube: {
    videos: YouTubeVideo[]
    avgViews: number
    competitorChannels: number
  }
  tiktok: {
    hashtags: TikTokData[]
    totalViews: number
    videoCount: number
  }
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

function generateMockSocialData(keyword: string): SocialData {
  const hash = keyword.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const subreddits = ["technology", "gadgets", "AskReddit", "LifeProTips", "productivity", "business"]
  const channels = ["TechReview", "ProductGuide", "BestOf2025", "ExpertAdvice", "TopPicks"]

  return {
    reddit: {
      posts: Array.from({ length: 4 }, (_, i) => ({
        subreddit: subreddits[(hash + i) % subreddits.length],
        title: `${["Best", "Top", "Ultimate guide to", "Honest review:"][i]} ${keyword}`,
        upvotes: Math.floor(50 + (hash * (i + 1)) % 5000),
        comments: Math.floor(10 + (hash * i) % 500),
        recency: ["2h ago", "5h ago", "1d ago", "3d ago"][i],
      })),
      totalMentions: Math.floor(100 + hash % 2000),
      topSubreddits: subreddits.slice(0, 3),
      sentimentScore: Math.round(50 + (hash % 40)),
    },
    youtube: {
      videos: Array.from({ length: 3 }, (_, i) => ({
        title: `${keyword} - ${["Complete Guide", "Review 2025", "Best Options"][i]}`,
        channel: channels[(hash + i) % channels.length],
        views: Math.floor(1000 + (hash * (i + 1)) % 500000),
        likes: Math.floor(50 + (hash * i) % 10000),
        published: ["1 week ago", "2 weeks ago", "1 month ago"][i],
      })),
      avgViews: Math.floor(10000 + hash % 100000),
      competitorChannels: Math.floor(5 + hash % 50),
    },
    tiktok: {
      hashtags: [
        { hashtag: `#${keyword.replace(/\s+/g, "")}`, views: (hash % 10) * 1000000, videos: hash % 10000, trending: hash % 2 === 0 },
        { hashtag: `#${keyword.split(" ")[0]}tips`, views: (hash % 5) * 500000, videos: hash % 5000, trending: hash % 3 === 0 },
        { hashtag: `#${keyword.split(" ")[0]}review`, views: (hash % 3) * 200000, videos: hash % 2000, trending: false },
      ],
      totalViews: (hash % 20) * 1000000,
      videoCount: hash % 50000,
    },
  }
}

// ============================================
// COMPONENT
// ============================================

export function SocialTab({ keyword }: SocialTabProps) {
  const [socialData, setSocialData] = React.useState<SocialData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  // Get social opportunity score
  const socialOpp = generateMockSocialOpportunity(keyword.id, keyword.keyword)

  const loadSocialData = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSocialData(generateMockSocialData(keyword.keyword))
    setIsLoading(false)
    setHasLoaded(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Social Opportunity Score */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            Social Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("text-3xl font-bold", getScoreColor(socialOpp.score))}>
              {socialOpp.score}%
            </span>
            <Badge variant="secondary" className={socialOpp.score >= 70 ? "bg-emerald-500/10 text-emerald-500" : ""}>
              {socialOpp.score >= 70 ? "High Engagement" : socialOpp.score >= 50 ? "Moderate" : "Low Activity"}
            </Badge>
          </div>
          <Progress value={socialOpp.score} className="h-2" />
          <p className="text-xs text-muted-foreground">
            This keyword has {socialOpp.score >= 70 ? "strong" : socialOpp.score >= 50 ? "moderate" : "limited"} social media presence and engagement potential.
          </p>
        </CardContent>
      </Card>

      {/* Load Social Data Button */}
      {!hasLoaded && (
        <Card className="bg-linear-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">Social Media Insights</CardTitle>
            <CardDescription className="mb-4">
              Load real-time data from Reddit, YouTube, and TikTok to discover social opportunities.
            </CardDescription>
            <Button
              onClick={loadSocialData}
              disabled={isLoading}
              className="bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Load Social Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Social Data Results */}
      {socialData && !isLoading && (
        <>
          {/* Reddit Section */}
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-orange-500">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-orange-500" />
                Reddit
              </CardTitle>
              <Badge variant="outline" className="text-orange-500">
                {socialData.reddit.totalMentions} mentions
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Sentiment */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sentiment Score</span>
                <span className={getScoreColor(socialData.reddit.sentimentScore)}>
                  {socialData.reddit.sentimentScore}% Positive
                </span>
              </div>

              {/* Top Subreddits */}
              <div className="flex flex-wrap gap-1">
                {socialData.reddit.topSubreddits.map((sub) => (
                  <Badge key={sub} variant="secondary" className="text-xs">
                    r/{sub}
                  </Badge>
                ))}
              </div>

              {/* Recent Posts */}
              <div className="space-y-2 mt-2">
                {socialData.reddit.posts.slice(0, 3).map((post, i) => (
                  <div key={i} className="p-2 rounded bg-muted/30 text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="text-orange-500">r/{post.subreddit}</span>
                      <span>•</span>
                      <span>{post.recency}</span>
                    </div>
                    <p className="text-foreground line-clamp-1">{post.title}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {formatNumber(post.upvotes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* YouTube Section */}
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-red-500">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube
              </CardTitle>
              <Badge variant="outline" className="text-red-500">
                {socialData.youtube.competitorChannels} competitors
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Avg Views */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg Video Views</span>
                <span className="font-medium">{formatNumber(socialData.youtube.avgViews)}</span>
              </div>

              {/* Top Videos */}
              <div className="space-y-2">
                {socialData.youtube.videos.map((video, i) => (
                  <div key={i} className="p-2 rounded bg-muted/30 text-sm">
                    <p className="font-medium line-clamp-1">{video.title}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="text-red-500">{video.channel}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {formatNumber(video.views)}
                      </span>
                      <span>{video.published}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TikTok Section */}
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-pink-500">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-pink-500" />
                TikTok
              </CardTitle>
              <Badge variant="outline" className="text-pink-500">
                {formatNumber(socialData.tiktok.totalViews)} total views
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {socialData.tiktok.hashtags.map((tag) => (
                <div key={tag.hashtag} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-pink-500">{tag.hashtag}</span>
                    {tag.trending && (
                      <Badge className="bg-pink-500/10 text-pink-500 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" /> Trending
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(tag.views)} views • {formatNumber(tag.videos)} videos
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <Button variant="outline" className="w-full" onClick={loadSocialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Social Data
          </Button>
        </>
      )}
    </div>
  )
}

export default SocialTab
