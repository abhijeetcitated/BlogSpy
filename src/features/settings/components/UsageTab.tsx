"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  TrendingUp,
  Zap,
  Calendar,
  Download,
  FileDown,
  Filter,
} from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

// Storage Janitor: add a cron job to aggregate bill_transactions older than 30 days
// into monthly totals and delete raw records older than 90 days to stay under 500MB.

const PAGE_SIZE = 50

type BillTransaction = {
  id: string
  amount: number
  type: string
  description: string | null
  feature_name: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  idempotency_key: string | null
}

const FEATURE_ICON_MAP: Record<string, typeof Zap> = {
  "Keyword Explorer": Zap,
  "Rank Tracker": BarChart3,
  "AI Visibility": TrendingUp,
  "AI Writer": TrendingUp,
  "Trend Spotter": TrendingUp,
  "Video Hijack": TrendingUp,
  Other: BarChart3,
}

const FEATURE_COLOR_MAP: Record<string, string> = {
  "Keyword Explorer": "text-emerald-400",
  "Rank Tracker": "text-blue-400",
  "AI Visibility": "text-amber-400",
  "AI Writer": "text-purple-400",
  "Trend Spotter": "text-amber-400",
  "Video Hijack": "text-amber-400",
  Other: "text-muted-foreground",
}

const FEATURE_GROUPS = ["AI", "SEO", "Rank Tracker"] as const

const GROUP_ICON_MAP: Record<(typeof FEATURE_GROUPS)[number], typeof Zap> = {
  AI: Zap,
  SEO: TrendingUp,
  "Rank Tracker": BarChart3,
}

const GROUP_COLOR_MAP: Record<(typeof FEATURE_GROUPS)[number], string> = {
  AI: "text-amber-400",
  SEO: "text-emerald-400",
  "Rank Tracker": "text-blue-400",
}

function mapFeatureName(
  featureName: string | null,
  description: string | null,
  idempotencyKey: string | null
): string {
  if (featureName && featureName.trim().length > 0) return featureName
  const source = `${description ?? ""} ${idempotencyKey ?? ""}`.toLowerCase()

  if (source.includes("keyword")) return "Keyword Explorer"
  if (source.includes("rank")) return "Rank Tracker"
  if (source.includes("ai visibility") || source.includes("ai-overview")) return "AI Visibility"
  if (source.includes("ai writer") || source.includes("writer")) return "AI Writer"
  if (source.includes("trend")) return "Trend Spotter"
  if (source.includes("video") || source.includes("youtube")) return "Video Hijack"
  return "Other"
}

function extractTarget(description: string | null, metadata: Record<string, unknown> | null): string {
  const meta = metadata ?? {}
  const metaTarget =
    (typeof meta.keyword === "string" && meta.keyword.trim()) ||
    (typeof meta.target === "string" && meta.target.trim()) ||
    (typeof meta.document === "string" && meta.document.trim()) ||
    (typeof meta.slug === "string" && meta.slug.trim()) ||
    null

  if (metaTarget) return metaTarget
  if (!description) return "--"
  const colonSplit = description.split(":")
  if (colonSplit.length > 1) {
    return colonSplit.slice(1).join(":").trim() || "--"
  }
  const dashSplit = description.split(" - ")
  if (dashSplit.length > 1) {
    return dashSplit.slice(1).join(" - ").trim() || "--"
  }
  return "--"
}

function mapFeatureGroup(featureName: string, description: string | null): (typeof FEATURE_GROUPS)[number] {
  const source = `${featureName} ${description ?? ""}`.toLowerCase()
  if (source.includes("rank")) return "Rank Tracker"
  if (source.includes("ai") || source.includes("writer")) return "AI"
  return "SEO"
}

export function UsageTab() {
  const [filterFeature, setFilterFeature] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [credits, setCredits] = useState({ total: 0, used: 0, remaining: 0 })
  const [transactions, setTransactions] = useState<BillTransaction[]>([])
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()
    let isActive = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    let creditsChannel: ReturnType<typeof supabase.channel> | null = null

    const loadCreditsAndTransactions = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user
        if (!user || !isActive) {
          setIsLoading(false)
          return
        }

        const { data: creditsRow } = await supabase
          .from("bill_credits")
          .select("credits_total, credits_used")
          .eq("user_id", user.id)
          .maybeSingle()

        const creditsTotal = creditsRow?.credits_total ?? 0
        const creditsUsed = creditsRow?.credits_used ?? 0
        const creditsRemaining = Math.max(creditsTotal - creditsUsed, 0)
        if (isActive) {
          setCredits({ total: creditsTotal, used: creditsUsed, remaining: creditsRemaining })
        }

        const { data: txRows } = await supabase
          .from("bill_transactions")
          .select("id, amount, type, description, feature_name, metadata, created_at, idempotency_key")
          .eq("user_id", user.id)
          .in("type", ["usage", "refund"])
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1)

        if (isActive) {
          setTransactions((txRows ?? []) as BillTransaction[])
          setHasMore((txRows ?? []).length === PAGE_SIZE)
        }
      } catch (error) {
        console.error("[UsageTab] Failed to load usage data", error)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    const subscribeTransactions = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user || !isActive) return

      channel = supabase
        .channel("public:bill_transactions")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bill_transactions",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const next = payload.new as BillTransaction
            setTransactions((prev) => {
              if (prev.some((tx) => tx.id === next.id)) return prev
              return [next, ...prev].slice(0, PAGE_SIZE)
            })
          }
        )
        .subscribe()

      creditsChannel = supabase
        .channel("public:bill_credits")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bill_credits",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const next = payload.new as { credits_total?: number; credits_used?: number }
            setCredits((prev) => {
              const total = next.credits_total ?? prev.total
              const used = next.credits_used ?? prev.used
              const remaining = Math.max(total - used, 0)
              return { total, used, remaining }
            })
          }
        )
        .subscribe()
    }

    loadCreditsAndTransactions()
    subscribeTransactions()

    return () => {
      isActive = false
      if (channel) supabase.removeChannel(channel)
      if (creditsChannel) supabase.removeChannel(creditsChannel)
    }
  }, [])

  const loadMore = async () => {
    if (!isSupabaseConfigured() || isLoadingMore || !hasMore) return
    setIsLoadingMore(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) {
        setIsLoadingMore(false)
        return
      }

      const currentCount = transactions.length
      const { data: txRows } = await supabase
        .from("bill_transactions")
        .select("id, amount, type, description, feature_name, metadata, created_at, idempotency_key")
        .eq("user_id", user.id)
        .in("type", ["usage", "refund"])
        .order("created_at", { ascending: false })
        .range(currentCount, currentCount + PAGE_SIZE - 1)

      setTransactions((prev) => [...prev, ...((txRows ?? []) as BillTransaction[])])
      setHasMore((txRows ?? []).length === PAGE_SIZE)
    } catch (error) {
      console.error("[UsageTab] Failed to load more transactions", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const percentage = credits.total === 0 ? 0 : Math.round((credits.used / credits.total) * 100)

  const mappedTransactions = useMemo(
    () =>
      transactions.map((tx) => ({
        ...tx,
        feature: mapFeatureName(tx.feature_name, tx.description, tx.idempotency_key),
        group: mapFeatureGroup(
          mapFeatureName(tx.feature_name, tx.description, tx.idempotency_key),
          tx.description
        ),
        target: extractTarget(tx.description, tx.metadata),
        status: tx.type === "refund" ? "Refunded" : "Completed",
        credits: Math.abs(tx.amount),
      })),
    [transactions]
  )

  const featureOptions = useMemo(() => {
    const set = new Set<string>()
    mappedTransactions.forEach((tx) => set.add(tx.feature))
    return ["all", ...Array.from(set)]
  }, [mappedTransactions])

  const filteredHistory =
    filterFeature === "all"
      ? mappedTransactions
      : mappedTransactions.filter((item) => item.feature === filterFeature)

  const usageByFeature = useMemo(() => {
    const usage = new Map<string, number>()
    FEATURE_GROUPS.forEach((group) => usage.set(group, 0))
    mappedTransactions.forEach((tx) => {
      if (tx.type !== "refund") {
        usage.set(tx.group, (usage.get(tx.group) ?? 0) + Math.abs(tx.amount))
      }
    })
    const total = Array.from(usage.values()).reduce((sum, value) => sum + value, 0)
    return {
      total,
      rows: Array.from(usage.entries()).map(([feature, creditsUsed]) => ({
        feature,
        creditsUsed,
        percentage: total === 0 ? 0 : Math.round((creditsUsed / total) * 100),
      })),
    }
  }, [mappedTransactions])

  const handleExportCSV = () => {
    setIsExporting(true)

    const headers = ["Date", "Feature", "Target", "Credits Used", "Status", "Type"]
    const rows = filteredHistory.map((item) => [
      item.created_at,
      item.feature,
      item.target,
      item.credits.toString(),
      item.status,
      item.type,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `citated-usage-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsExporting(false), 600)
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card className="bg-slate-950/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-foreground">Usage Overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your credit usage this billing cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading usage data...</div>
          ) : (
            <>
              {/* Main Usage Meter */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-linear-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Credits Used</p>
                      <p className="text-2xl font-bold text-foreground">
                        {credits.used.toLocaleString()} 
                        <span className="text-sm font-normal text-muted-foreground"> / {credits.total.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress
                    value={percentage}
                    className="h-3 bg-[#FFD700]/20 [&_[data-slot=progress-indicator]]:bg-[#FFD700]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage}% used</span>
                    <span>{credits.remaining.toLocaleString()} remaining</span>
                  </div>
                </div>
              </div>

              {/* Usage by Feature */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Usage by Feature</h4>
                {usageByFeature.rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No usage yet.</p>
                ) : (
                  <div className="space-y-3">
                    {usageByFeature.rows.map((row) => {
                      const Icon = GROUP_ICON_MAP[row.feature as keyof typeof GROUP_ICON_MAP] || BarChart3
                      const color =
                        GROUP_COLOR_MAP[row.feature as keyof typeof GROUP_COLOR_MAP] || "text-muted-foreground"
                      return (
                        <div key={row.feature} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded bg-muted flex items-center justify-center">
                                <Icon className={`h-4 w-4 ${color}`} />
                              </div>
                              <span className="text-foreground">{row.feature}</span>
                            </div>
                            <span className="text-muted-foreground">{row.creditsUsed.toLocaleString()} cr</span>
                          </div>
                          <Progress
                            value={row.percentage}
                            className="h-2 bg-[#FFD700]/15 [&_[data-slot=progress-indicator]]:bg-[#FFD700]"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="bg-slate-950/60 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your credit usage history
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <Select value={filterFeature} onValueChange={setFilterFeature}>
                <SelectTrigger className="w-[160px] h-9 bg-input/50 border-border text-foreground">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All features" />
                </SelectTrigger>
                <SelectContent>
                  {featureOptions.map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature === "all" ? "All Features" : feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isExporting}
                className="border-border text-muted-foreground hover:bg-accent bg-transparent"
              >
                {isExporting ? (
                  <FileDown className="h-4 w-4 mr-2 animate-bounce" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredHistory.map((item) => {
              const FeatureIcon = FEATURE_ICON_MAP[item.feature] || BarChart3
              const featureColor = FEATURE_COLOR_MAP[item.feature] || "text-muted-foreground"
              const isRefund = item.type === "refund"
              const badgeStyles = isRefund
                ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                : "border-muted-foreground/30 text-muted-foreground bg-muted/20"
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center`}>
                      <FeatureIcon className={`h-4 w-4 ${featureColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.feature}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "MMM d, yyyy")} - {item.target}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${badgeStyles} text-xs`}
                    >
                      {item.status}
                    </Badge>
                    <span
                      className={`text-sm font-mono min-w-[70px] text-right ${isRefund ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {isRefund ? "+" : "-"}
                      {item.credits} cr
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No usage history found</p>
              {filterFeature !== "all" && (
                <Button 
                  variant="link" 
                  className="text-emerald-400 mt-2"
                  onClick={() => setFilterFeature("all")}
                >
                  Clear filter
                </Button>
              )}
            </div>
          )}

          {hasMore && filteredHistory.length > 0 && (
            <div className="pt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="border-border text-muted-foreground hover:bg-accent bg-transparent"
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
