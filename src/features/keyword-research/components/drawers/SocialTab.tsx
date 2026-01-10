// ============================================
// KEYWORD DETAILS DRAWER - Social Tab (Vercel/Linear Style)
// ============================================
// High-signal social metrics (YouTube / Reddit / Pinterest)
// UX v2: Platform Switcher (focus 1 platform at a time)
// - Locked → Loading → Data
// - YouTube Intelligence Engine integration
// - Fixed-height scroll area to prevent header/tab fatigue
// - Subtle fade animation when switching platforms
// - External images use referrerPolicy="no-referrer"
// - All outbound links open in _blank
// ============================================

"use client"

import * as React from "react"
import {
  AlertTriangle,
  ArrowUp,
  Loader2,
  Lock,
  MessageCircle,
  Pin,
  RefreshCw,
  Users,
} from "lucide-react"

import { YouTubeIcon, RedditIcon, PinterestIcon, QuoraIcon } from "@/components/icons/platform-icons"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"

import type { CommunityResult, DrawerDataState, Keyword, YouTubeResult } from "../../types"
import { fetchSocialInsights } from "../../actions/fetch-drawer-data"
import { useKeywordStore } from "../../store"
import { YouTubeStrategyPanel, YouTubeVideoCard } from "./YouTubeStrategyPanel"
import {
  analyzeYouTubeCompetition,
  analyzeVideosWithBadges,
  type YouTubeVideoInput,
  type YouTubeIntelligenceResult,
  type AnalyzedVideo,
} from "../../utils/youtube-intelligence"

interface SocialTabProps {
  keyword: Keyword
}

type SocialDataPayload = {
  youtube: YouTubeResult[]
  community: CommunityResult[]
}

type ActivePlatform = "youtube" | "reddit" | "pinterest" | "quora"

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return `${num}`
}

function splitCommunity(results: CommunityResult[]): {
  reddit: CommunityResult[]
  pinterest: CommunityResult[]
} {
  const reddit = results.filter((r) => r.platform === "reddit")
  const pinterest = results.filter((r) => r.platform === "pinterest")
  return { reddit, pinterest }
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400"
  if (score >= 50) return "text-amber-400"
  return "text-rose-400"
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}

function LockedState({
  keywordLabel,
  onLoad,
  isLoading,
}: {
  keywordLabel: string
  onLoad: () => void
  isLoading: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 sm:p-6">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted border border-border flex items-center justify-center">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">
            Unlock Social Intelligence for "{keywordLabel}"
          </div>
          <div className="text-xs text-muted-foreground">YouTube strategy • Reddit heat • Pinterest visuals</div>
        </div>

        <Button
          onClick={onLoad}
          disabled={isLoading}
          variant="outline"
          className={cn(
            "h-10",
            "border-primary/30 text-primary hover:bg-primary/10",
            "bg-transparent transition-all duration-200"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              🔄 Load Social Data (⚡ 1 Credit)
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function SkeletonYouTube() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4 p-3 rounded-lg border border-border bg-card/40">
          <div className="w-32 h-20 shrink-0 overflow-hidden rounded-md bg-muted/50" />
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="h-4 w-5/6 bg-muted/60 rounded" />
            <div className="h-3 w-2/3 bg-muted/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonStrategyPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 border border-border/50 bg-card/40">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted/60 rounded" />
            <div className="h-8 w-16 bg-muted/50 rounded" />
          </div>
          <div className="h-6 w-48 bg-muted/50 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted/60 rounded" />
            <div className="h-5 w-24 bg-muted/50 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border border-border/50 bg-card/40 h-32" />
        <div className="rounded-xl p-4 border border-border/50 bg-card/40 h-32" />
      </div>
    </div>
  )
}

function SkeletonReddit() {
  return (
    <div className="rounded-lg border border-border bg-card/40 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="p-3 border-b border-border/50 last:border-b-0">
          <div className="h-4 w-4/5 bg-muted/60 rounded" />
          <div className="mt-2 flex items-center gap-2">
            <div className="h-5 w-20 bg-muted/40 rounded" />
            <div className="h-3 w-24 bg-muted/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonPinterest() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border bg-card/40">
          <div className="absolute inset-0 bg-muted/50" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-xs text-muted-foreground">No {label} found.</div>
}

function mapToVideoInput(video: YouTubeResult, index: number): YouTubeVideoInput {
  const mockSubscriberCount = video.views
    ? Math.floor(video.views / (2 + Math.random() * 8))
    : Math.floor(Math.random() * 50_000)

  const mockDurationSeconds = 180 + Math.floor(Math.random() * 720)

  return {
    title: video.title,
    url: video.url,
    thumbnailUrl: video.thumbnailUrl,
    views: video.views ?? null,
    viewsLabel: video.viewsLabel,
    channel: video.channel,
    published: video.published,
    subscriberCount: mockSubscriberCount,
    durationSeconds: mockDurationSeconds,
    publishedAt: null,
  }
}

const ContentFade: React.FC<React.PropsWithChildren<{ activeKey: string }>> = ({ activeKey, children }) => {
  return (
    <div key={activeKey} className="animate-in fade-in duration-200">
      {children}
    </div>
  )
}

export function SocialTab({ keyword }: SocialTabProps) {
  const [state, setState] = React.useState<DrawerDataState>("idle")
  const [data, setData] = React.useState<SocialDataPayload | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Platform Switcher
  const [activePlatform, setActivePlatform] = React.useState<ActivePlatform>("youtube")

  // YouTube Intelligence Analysis State
  const [youtubeAnalysis, setYoutubeAnalysis] = React.useState<YouTubeIntelligenceResult | null>(null)
  const [analyzedVideos, setAnalyzedVideos] = React.useState<AnalyzedVideo[]>([])

  // Cache (Zustand)
  const getCachedData = useKeywordStore((s) => s.getCachedData)
  const setDrawerCache = useKeywordStore((s) => s.setDrawerCache)

  const processYouTubeData = React.useCallback((youtubeData: YouTubeResult[]) => {
    if (youtubeData.length === 0) {
      setYoutubeAnalysis(null)
      setAnalyzedVideos([])
      return
    }

    const videoInputs: YouTubeVideoInput[] = youtubeData.map(mapToVideoInput)
    const analysis = analyzeYouTubeCompetition(videoInputs)
    setYoutubeAnalysis(analysis)

    const withBadges = analyzeVideosWithBadges(videoInputs)
    setAnalyzedVideos(withBadges)
  }, [])

  React.useEffect(() => {
    if (!keyword?.keyword) return

    // Reset platform focus per keyword
    setActivePlatform("youtube")

    const cached = getCachedData(keyword.keyword, "social") as SocialDataPayload | null
    if (cached) {
      setData(cached)
      setState("success")
      processYouTubeData(cached.youtube ?? [])
    }
  }, [keyword?.keyword, getCachedData, processYouTubeData])

  if (!keyword) {
    return <div className="text-xs text-muted-foreground">No keyword data.</div>
  }

  const socialOpp = generateMockSocialOpportunity(keyword.id, keyword.keyword)

  const loadSocialData = async () => {
    const cached = getCachedData(keyword.keyword, "social") as SocialDataPayload | null
    if (cached) {
      setData(cached)
      setState("success")
      processYouTubeData(cached.youtube ?? [])
      return
    }

    setState("loading")
    setError(null)

    try {
      const res = await fetchSocialInsights({ keyword: keyword.keyword, country: "US" })

      if (res?.data?.success && res.data.data) {
        setDrawerCache(keyword.keyword, "social", res.data.data)
        setData(res.data.data)
        setState("success")
        processYouTubeData(res.data.data.youtube ?? [])
        return
      }

      setError(res?.data?.error || res?.serverError || "Failed to fetch social data")
      setState("error")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch social data")
      setState("error")
    }
  }

  const { reddit, pinterest } = splitCommunity(data?.community ?? [])
  const redditSorted = [...reddit].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 16)
  const pinterestGrid = pinterest.slice(0, 18)

  const youtubeCount = analyzedVideos.length
  const redditCount = reddit.length
  const pinterestCount = pinterest.length
  const quoraCount = 0

  const platformCardBase =
    "group relative rounded-xl border bg-card/50 backdrop-blur-sm p-3 sm:p-4 text-left transition-all duration-200"

  const platformCards: Array<{
    key: ActivePlatform
    label: string
    subtext: string
    icon: React.ReactNode
    activeClass: string
    inactiveClass: string
    disabled?: boolean
  }> = [
    {
      key: "youtube",
      label: "YouTube",
      subtext: youtubeCount > 0 ? `${youtubeCount} Videos` : "No videos",
      icon: <YouTubeIcon className="h-4 w-4 text-red-500" />,
      activeClass: "border-amber-500/60 bg-amber-500/10",
      inactiveClass: "border-border hover:border-amber-500/30",
    },
    {
      key: "reddit",
      label: "Reddit",
      subtext: redditCount > 0 ? `${redditCount} Threads` : "No threads",
      icon: <RedditIcon className="h-4 w-4 text-orange-500" />,
      activeClass: "border-orange-500/60 bg-orange-500/10",
      inactiveClass: "border-border hover:border-orange-500/30",
    },
    {
      key: "pinterest",
      label: "Pinterest",
      subtext: pinterestCount > 0 ? "High Visual" : "No pins",
      icon: <PinterestIcon className="h-4 w-4 text-pink-500" />,
      activeClass: "border-pink-500/60 bg-pink-500/10",
      inactiveClass: "border-border hover:border-pink-500/30",
    },
    {
      key: "quora",
      label: "Quora",
      subtext: quoraCount > 0 ? `${quoraCount} Opportunities` : "Coming soon",
      icon: <QuoraIcon className="h-4 w-4 text-blue-500" />,
      activeClass: "border-blue-500/60 bg-blue-500/10",
      inactiveClass: "border-border hover:border-blue-500/30",
      disabled: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Section A: Global Header */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium text-foreground">Social Opportunity</div>
          </div>
          <div className={cn("text-lg font-semibold", getScoreColor(socialOpp.score))}>{socialOpp.score}%</div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary/80" style={{ width: `${Math.max(0, Math.min(100, socialOpp.score))}%` }} />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">High-signal social presence estimate for this keyword.</div>
      </div>

      {/* State: Idle (Locked) */}
      {state === "idle" ? <LockedState keywordLabel={keyword.keyword} onLoad={loadSocialData} isLoading={false} /> : null}

      {/* State: Loading */}
      {state === "loading" ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionHeader
              icon={<YouTubeIcon className="h-4 w-4 text-red-500" />}
              title="YouTube Intelligence"
              subtitle="Analyzing competition..."
            />
            <SkeletonStrategyPanel />
            <SkeletonYouTube />
          </div>

          <div className="space-y-3">
            <SectionHeader
              icon={<RedditIcon className="h-4 w-4 text-orange-500" />}
              title="Reddit"
              subtitle="Discussion pulse"
            />
            <SkeletonReddit />
          </div>

          <div className="space-y-3">
            <SectionHeader
              icon={<PinterestIcon className="h-4 w-4 text-pink-500" />}
              title="Pinterest"
              subtitle="Visual trend"
            />
            <SkeletonPinterest />
          </div>
        </div>
      ) : null}

      {/* State: Error */}
      {state === "error" && error ? (
        <Alert variant="destructive" className="border border-border bg-card/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm text-foreground">Failed to load social data</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="text-xs text-muted-foreground">{error}</div>
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={loadSocialData}
                className="border-border bg-transparent hover:bg-accent transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* State: Success */}
      {state === "success" ? (
        <>
          {/* Section B: Platform Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {platformCards.map((card) => {
              const isActive = activePlatform === card.key
              const isDisabled = Boolean(card.disabled)

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => {
                    if (isDisabled) return
                    setActivePlatform(card.key)
                  }}
                  disabled={isDisabled}
                  className={cn(
                    platformCardBase,
                    isActive ? card.activeClass : card.inactiveClass,
                    isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {card.icon}
                      <div className="text-sm font-semibold text-foreground">{card.label}</div>
                    </div>
                    {isActive ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{card.subtext}</div>
                </button>
              )
            })}
          </div>

          {/* Section C: Dynamic Content Area (fixed scroll) */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="h-[500px] overflow-y-auto p-4">
              <ContentFade activeKey={activePlatform}>
                {activePlatform === "youtube" ? (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={<YouTubeIcon className="h-4 w-4 text-red-500" />}
                      title="YouTube"
                      subtitle="Strategy dashboard"
                    />

                    {youtubeAnalysis ? (
                      <YouTubeStrategyPanel analysis={youtubeAnalysis} />
                    ) : (
                      <div className="rounded-xl border border-border bg-card/50 p-4">
                        <EmptyState label="YouTube analysis" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider pl-1">
                        Top Videos (Proof List)
                      </div>
                      {analyzedVideos.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                          <EmptyState label="YouTube videos" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {analyzedVideos.slice(0, 10).map((video) => (
                            <YouTubeVideoCard key={video.url} video={video} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {activePlatform === "reddit" ? (
                  <div className="space-y-3">
                    <SectionHeader
                      icon={<MessageCircle className="h-4 w-4 text-orange-500" />}
                      title="Reddit"
                      subtitle="Threads & heat"
                    />

                    {redditSorted.length === 0 ? (
                      <div className="rounded-xl border border-border bg-card/50 p-4">
                        <EmptyState label="Reddit threads" />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                        {redditSorted.map((t) => (
                          <a
                            key={t.url}
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start justify-between p-3 border-b border-border/50 last:border-b-0 hover:bg-accent/50 transition-all duration-200"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded w-fit">
                                r/{t.subreddit ?? "…"}
                              </div>
                              <h4 className="text-sm text-foreground/80 line-clamp-1">{t.title}</h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" /> {typeof t.comments === "number" ? t.comments : "—"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground shrink-0 ml-4">
                              <ArrowUp className="w-3 h-3" /> {typeof t.score === "number" ? t.score : "—"}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {activePlatform === "pinterest" ? (
                  <div className="space-y-3">
                    <SectionHeader
                      icon={<Pin className="h-4 w-4 text-pink-500" />}
                      title="Pinterest"
                      subtitle="Visual grid"
                    />

                    {pinterestGrid.length === 0 ? (
                      <div className="rounded-xl border border-border bg-card/50 p-4">
                        <EmptyState label="Pinterest pins" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {pinterestGrid.map((p) => (
                          <a
                            key={p.url}
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border group hover:border-ring transition-all duration-200"
                          >
                            {p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.imageUrl}
                                alt="Pinterest"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-card/40">
                                <Pin className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-1">
                              <Pin className="w-5 h-5 text-white" />
                              <span className="text-xs font-bold text-white">
                                {typeof p.saves === "number" ? `${formatNumber(p.saves)} Saves` : "— Saves"}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {activePlatform === "quora" ? (
                  <div className="space-y-3">
                    <SectionHeader
                      icon={
                        <div className="h-4 w-4 rounded-sm bg-blue-500/15 flex items-center justify-center">
                          <span className="text-[10px] leading-none font-semibold text-blue-400">Q</span>
                        </div>
                      }
                      title="Quora"
                      subtitle="Coming soon"
                    />

                    <div className="rounded-xl border border-border bg-card/50 p-4">
                      <div className="text-xs text-muted-foreground">
                        Quora extraction + opportunity scoring will appear here.
                      </div>
                    </div>
                  </div>
                ) : null}
              </ContentFade>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={loadSocialData}
              className={cn(
                "h-10 w-full",
                "border-primary/30 text-primary hover:bg-primary/10",
                "bg-transparent transition-all duration-200"
              )}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Social Data
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default SocialTab
