// ============================================
// KEYWORD DETAILS DRAWER - Social Tab (Vercel/Linear Style)
// ============================================
// High-signal social metrics (YouTube / Reddit / Pinterest)
// - Locked → Loading → Data
// - Minimalism + modern dark mode styling
// - External images use referrerPolicy="no-referrer"
// - All outbound links open in _blank
// ============================================

"use client"

import * as React from "react"
import {
  AlertTriangle,
  ArrowUp,
  Eye,
  Loader2,
  Lock,
  MessageCircle,
  Pin as PinIcon,
  RefreshCw,
  Users,
  Youtube,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import type { CommunityResult, DrawerDataState, Keyword, YouTubeResult } from "../../types"
import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"
import { fetchSocialInsights } from "../../actions/fetch-drawer-data"
import { useKeywordStore } from "../../store"

interface SocialTabProps {
  keyword: Keyword
}

type SocialDataPayload = {
  youtube: YouTubeResult[]
  community: CommunityResult[]
}

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
          <div className="text-sm font-medium text-slate-200">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Lock className="h-5 w-5 text-slate-300" />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-200">Unlock Social Intelligence for “{keywordLabel}”</div>
          <div className="text-xs text-slate-500">YouTube intent • Reddit heat • Pinterest visuals</div>
        </div>

        <Button
          onClick={onLoad}
          disabled={isLoading}
          className="bg-slate-100 text-slate-950 hover:bg-slate-200 transition-all duration-200"
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
        <div key={i} className="flex gap-4 p-3 rounded-lg border border-slate-800 bg-slate-900/40">
          <div className="w-32 h-20 shrink-0 overflow-hidden rounded-md bg-slate-800/50" />
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
            <div className="h-3 w-2/3 bg-slate-800/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonReddit() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="p-3 border-b border-slate-800/50 last:border-b-0">
          <div className="h-4 w-4/5 bg-slate-800/60 rounded" />
          <div className="mt-2 flex items-center gap-2">
            <div className="h-5 w-20 bg-slate-800/40 rounded" />
            <div className="h-3 w-24 bg-slate-800/40 rounded" />
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
        <div
          key={i}
          className="relative aspect-[2/3] rounded-lg overflow-hidden border border-slate-800 bg-slate-900/40"
        >
          <div className="absolute inset-0 bg-slate-800/50" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-xs text-slate-500">No {label} found.</div>
}

export function SocialTab({ keyword }: SocialTabProps) {
  const [state, setState] = React.useState<DrawerDataState>("idle")
  const [data, setData] = React.useState<SocialDataPayload | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // ─────────────────────────────────────────
  // CACHE ACCESS (Zustand)
  // ─────────────────────────────────────────
  const getCachedData = useKeywordStore((s) => s.getCachedData)
  const setDrawerCache = useKeywordStore((s) => s.setDrawerCache)

  // ─────────────────────────────────────────
  // CACHE CHECK ON MOUNT
  // ─────────────────────────────────────────
  React.useEffect(() => {
    if (!keyword?.keyword) return
    
    const cached = getCachedData(keyword.keyword, "social") as SocialDataPayload | null
    if (cached) {
      setData(cached)
      setState("success")
    }
  }, [keyword?.keyword, getCachedData])

  if (!keyword) {
    return <div className="text-xs text-slate-500">No keyword data.</div>
  }

  const socialOpp = generateMockSocialOpportunity(keyword.id, keyword.keyword)

  // ─────────────────────────────────────────
  // LOAD SOCIAL DATA (with cache-first strategy)
  // ─────────────────────────────────────────
  const loadSocialData = async () => {
    // 1. Check cache first (FREE)
    const cached = getCachedData(keyword.keyword, "social") as SocialDataPayload | null
    if (cached) {
      setData(cached)
      setState("success")
      return // No API call needed
    }

    // 2. Cache miss → Call API (PAID - 1 credit)
    setState("loading")
    setError(null)

    try {
      const res = await fetchSocialInsights({ keyword: keyword.keyword, country: "US" })

      if (res?.data?.success && res.data.data) {
        // Store in cache for future use
        setDrawerCache(keyword.keyword, "social", res.data.data)
        setData(res.data.data)
        setState("success")
        return
      }

      setError(res?.data?.error || res?.serverError || "Failed to fetch social data")
      setState("error")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch social data")
      setState("error")
    }
  }

  const youtube: YouTubeResult[] = (data?.youtube ?? []).slice(0, 3)
  const { reddit, pinterest } = splitCommunity(data?.community ?? [])
  const redditSorted = [...reddit].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 8)
  const pinterestGrid = pinterest.slice(0, 9)

  return (
    <div className="space-y-6">
      {/* Always-on: Opportunity */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <div className="text-sm font-medium text-slate-200">Social Opportunity</div>
          </div>
          <div className={cn("text-lg font-semibold", getScoreColor(socialOpp.score))}>{socialOpp.score}%</div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500/80"
            style={{ width: `${Math.max(0, Math.min(100, socialOpp.score))}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          High-signal social presence estimate for this keyword.
        </div>
      </div>

      {/* State */}
      {state === "idle" ? <LockedState keywordLabel={keyword.keyword} onLoad={loadSocialData} isLoading={false} /> : null}

      {state === "loading" ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionHeader
              icon={<Youtube className="h-4 w-4 text-red-500" />}
              title="YouTube"
              subtitle="Video intent"
            />
            <SkeletonYouTube />
          </div>

          <div className="space-y-3">
            <SectionHeader
              icon={<MessageCircle className="h-4 w-4 text-orange-500" />}
              title="Reddit"
              subtitle="Discussion pulse"
            />
            <SkeletonReddit />
          </div>

          <div className="space-y-3">
            <SectionHeader
              icon={<PinIcon className="h-4 w-4 text-pink-500" />}
              title="Pinterest"
              subtitle="Visual trend"
            />
            <SkeletonPinterest />
          </div>
        </div>
      ) : null}

      {state === "error" && error ? (
        <Alert variant="destructive" className="border border-slate-800 bg-slate-900/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm text-slate-200">Failed to load social data</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="text-xs text-slate-500">{error}</div>
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={loadSocialData}
                className="border-slate-800 bg-transparent hover:bg-slate-800/80 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      {state === "success" ? (
        <>
          {/* YouTube (Compact list) */}
          <div className="space-y-3">
            <SectionHeader
              icon={<Youtube className="h-4 w-4 text-red-500" />}
              title="YouTube"
              subtitle="Top videos"
            />

            {youtube.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <EmptyState label="YouTube videos" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {youtube.map((v) => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex gap-4 p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200"
                  >
                    <div className="relative w-32 h-20 shrink-0 overflow-hidden rounded-md border border-slate-800/80">
                      {v.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800/40">
                          <Youtube className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-center gap-1 min-w-0">
                      <h4 className="text-sm font-medium leading-tight text-slate-200 group-hover:text-indigo-400 line-clamp-2">
                        {v.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span className="font-mono text-xs text-indigo-400">
                            {typeof v.views === "number" ? `${formatNumber(v.views)} views` : v.viewsLabel ?? "— views"}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="truncate">{v.channel ?? "Unknown channel"}</span>
                        {v.published ? (
                          <>
                            <span>•</span>
                            <span className="truncate">{v.published}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Reddit (Signal row) */}
          <div className="space-y-3">
            <SectionHeader
              icon={<MessageCircle className="h-4 w-4 text-orange-500" />}
              title="Reddit"
              subtitle="Headlines & heat"
            />

            {redditSorted.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <EmptyState label="Reddit threads" />
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                {redditSorted.map((t) => (
                  <a
                    key={t.url}
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between p-3 border-b border-slate-800/50 last:border-b-0 hover:bg-slate-800/50 transition-all duration-200"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded w-fit">
                        r/{t.subreddit ?? "…"}
                      </div>
                      <h4 className="text-sm text-slate-300 line-clamp-1">{t.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {typeof t.comments === "number" ? t.comments : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono text-slate-400 shrink-0 ml-4">
                      <ArrowUp className="w-3 h-3" /> {typeof t.score === "number" ? t.score : "—"}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Pinterest (Visual grid) */}
          <div className="space-y-3">
            <SectionHeader
              icon={<PinIcon className="h-4 w-4 text-pink-500" />}
              title="Pinterest"
              subtitle="Visual trend"
            />

            {pinterestGrid.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
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
                    className="relative aspect-[2/3] rounded-lg overflow-hidden border border-slate-800 group hover:border-slate-700 transition-all duration-200"
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
                      <div className="w-full h-full flex items-center justify-center bg-slate-900/40">
                        <PinIcon className="h-6 w-6 text-slate-500" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-1">
                      <PinIcon className="w-5 h-5 text-white" />
                      <span className="text-xs font-bold text-white">
                        {typeof p.saves === "number" ? `${formatNumber(p.saves)} Saves` : "— Saves"}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={loadSocialData}
              className="w-full border-slate-800 bg-transparent hover:bg-slate-800/80 transition-all duration-200"
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
