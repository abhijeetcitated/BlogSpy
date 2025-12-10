"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Calendar,
  TrendingDown,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Heart,
  Zap,
  Loader2,
  ExternalLink,
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Clock,
  Shield,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
type DecayReason = "Competitor" | "Outdated" | "Missing Keywords" | "Schema Issues" | "Slow Load"
type DecayStatus = "critical" | "watch"
type MatrixZone = "critical" | "watch" | "low" | "stable"

interface DecayArticle {
  id: string
  title: string
  url: string
  currentRank: number
  previousRank: number
  trafficLoss: number
  decayReason: DecayReason
  trendData: number[]
  status: DecayStatus
  decayRate: number
  trafficValue: number
  lastUpdated: string
}

interface MatrixPoint {
  x: number
  y: number
  id: string
  zone: MatrixZone
  articleId: string
}

interface RecoveredArticle {
  id: string
  title: string
  trafficGain: string
  daysAgo: number
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_DECAY_DATA: DecayArticle[] = [
  {
    id: "1",
    title: "Best Gaming Laptops 2024",
    url: "https://myblog.com/best-gaming-laptops-2024",
    currentRank: 8,
    previousRank: 3,
    trafficLoss: -1200,
    decayReason: "Competitor",
    trendData: [85, 78, 72, 65, 58, 52, 48, 42],
    status: "critical",
    decayRate: 0.85,
    trafficValue: 0.9,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    title: "Top 10 JavaScript Frameworks",
    url: "https://myblog.com/javascript-frameworks",
    currentRank: 12,
    previousRank: 5,
    trafficLoss: -2100,
    decayReason: "Missing Keywords",
    trendData: [92, 88, 80, 72, 65, 55, 48, 40],
    status: "critical",
    decayRate: 0.92,
    trafficValue: 0.95,
    lastUpdated: "2024-01-10",
  },
  {
    id: "3",
    title: "Complete SEO Guide for Beginners",
    url: "https://myblog.com/seo-guide-beginners",
    currentRank: 15,
    previousRank: 4,
    trafficLoss: -1800,
    decayReason: "Outdated",
    trendData: [88, 82, 75, 68, 60, 52, 45, 38],
    status: "critical",
    decayRate: 0.78,
    trafficValue: 0.88,
    lastUpdated: "2023-06-20",
  },
  {
    id: "4",
    title: "How to Start a Blog in 2024",
    url: "https://myblog.com/start-blog-2024",
    currentRank: 6,
    previousRank: 4,
    trafficLoss: -450,
    decayReason: "Competitor",
    trendData: [75, 73, 70, 68, 65, 62, 60, 58],
    status: "watch",
    decayRate: 0.35,
    trafficValue: 0.7,
    lastUpdated: "2024-02-01",
  },
  {
    id: "5",
    title: "Email Marketing Best Practices",
    url: "https://myblog.com/email-marketing-best-practices",
    currentRank: 9,
    previousRank: 7,
    trafficLoss: -320,
    decayReason: "Schema Issues",
    trendData: [68, 66, 64, 62, 60, 58, 56, 55],
    status: "watch",
    decayRate: 0.25,
    trafficValue: 0.5,
    lastUpdated: "2024-01-28",
  },
  {
    id: "6",
    title: "Python vs JavaScript: Which to Learn?",
    url: "https://myblog.com/python-vs-javascript",
    currentRank: 11,
    previousRank: 6,
    trafficLoss: -890,
    decayReason: "Missing Keywords",
    trendData: [80, 75, 70, 65, 60, 55, 50, 48],
    status: "watch",
    decayRate: 0.45,
    trafficValue: 0.65,
    lastUpdated: "2024-01-20",
  },
  {
    id: "7",
    title: "Best WordPress Themes 2024",
    url: "https://myblog.com/best-wordpress-themes",
    currentRank: 14,
    previousRank: 8,
    trafficLoss: -1100,
    decayReason: "Outdated",
    trendData: [72, 68, 62, 58, 52, 48, 45, 42],
    status: "critical",
    decayRate: 0.72,
    trafficValue: 0.75,
    lastUpdated: "2023-09-15",
  },
  {
    id: "8",
    title: "React Hooks Tutorial",
    url: "https://myblog.com/react-hooks-tutorial",
    currentRank: 7,
    previousRank: 5,
    trafficLoss: -280,
    decayReason: "Slow Load",
    trendData: [82, 80, 78, 76, 74, 72, 70, 68],
    status: "watch",
    decayRate: 0.2,
    trafficValue: 0.8,
    lastUpdated: "2024-02-05",
  },
]

const RECOVERED_ARTICLES: RecoveredArticle[] = [
  {
    id: "r1",
    title: "SEO Guide for E-commerce",
    trafficGain: "+20%",
    daysAgo: 3,
  },
  {
    id: "r2",
    title: "Social Media Strategy 2024",
    trafficGain: "+35%",
    daysAgo: 7,
  },
  {
    id: "r3",
    title: "Content Marketing Tips",
    trafficGain: "+18%",
    daysAgo: 12,
  },
]

// ============================================
// DECAY ALERT SYSTEM
// ============================================
type AlertSeverity = "critical" | "warning" | "info"
type AlertChannel = "email" | "slack" | "whatsapp" | "push"

interface DecayAlert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  timestamp: string
  articleId: string | null
  actionTaken: boolean
  channel: AlertChannel
}

interface AlertPreferences {
  email: boolean
  slack: boolean
  whatsapp: boolean
  push: boolean
  criticalOnly: boolean
  dailyDigest: boolean
  instantAlerts: boolean
}

const MOCK_ALERTS: DecayAlert[] = [
  {
    id: "alert1",
    title: "🚨 Critical Decay Detected",
    message: "\"Best Gaming Laptops 2024\" dropped 5 positions in 24h - immediate action required",
    severity: "critical",
    timestamp: "2 hours ago",
    articleId: "1",
    actionTaken: false,
    channel: "push",
  },
  {
    id: "alert2",
    title: "⚠️ Competitor Update Alert",
    message: "Competitor ahrefs.com updated their SEO guide - your content may need refresh",
    severity: "warning",
    timestamp: "5 hours ago",
    articleId: "3",
    actionTaken: false,
    channel: "email",
  },
  {
    id: "alert3",
    title: "📉 Traffic Decline Pattern",
    message: "3 articles showing consistent traffic decline over past week",
    severity: "warning",
    timestamp: "8 hours ago",
    articleId: null,
    actionTaken: true,
    channel: "slack",
  },
  {
    id: "alert4",
    title: "🔍 Schema Issues Found",
    message: "\"Email Marketing Best Practices\" missing FAQ schema - easy win opportunity",
    severity: "info",
    timestamp: "1 day ago",
    articleId: "5",
    actionTaken: false,
    channel: "email",
  },
  {
    id: "alert5",
    title: "⏰ Scheduled Refresh Due",
    message: "\"Python vs JavaScript\" is due for quarterly refresh based on your calendar",
    severity: "info",
    timestamp: "1 day ago",
    articleId: "6",
    actionTaken: true,
    channel: "push",
  },
]

const DEFAULT_ALERT_PREFS: AlertPreferences = {
  email: true,
  slack: false,
  whatsapp: true,
  push: true,
  criticalOnly: false,
  dailyDigest: true,
  instantAlerts: true,
}

// Generate matrix points from article data
const generateMatrixPoints = (articles: DecayArticle[]): MatrixPoint[] => {
  return articles.map((article) => {
    // Determine zone based on decay rate and traffic value
    let zone: MatrixZone
    if (article.trafficValue > 0.5 && article.decayRate > 0.5) {
      zone = "critical"
    } else if (article.trafficValue > 0.5 && article.decayRate <= 0.5) {
      zone = "watch"
    } else if (article.trafficValue <= 0.5 && article.decayRate > 0.5) {
      zone = "low"
    } else {
      zone = "stable"
    }

    return {
      x: article.trafficValue * 100,
      y: article.decayRate * 100,
      id: `matrix-${article.id}`,
      zone,
      articleId: article.id,
    }
  })
}

// ============================================
// SPARKLINE COMPONENT (SVG-based)
// ============================================
function DecaySparkline({ data, width = 60, height = 20 }: { data: number[]; width?: number; height?: number }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  // Determine color based on trend (declining = red)
  const isDecreasing = data[data.length - 1] < data[0]
  const strokeColor = isDecreasing ? "#ef4444" : "#22c55e"

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkGradient-${data.join("-")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ContentDecayContent() {
  const router = useRouter()
  
  // Core states
  const [articles] = useState<DecayArticle[]>(MOCK_DECAY_DATA)
  const [revivingIds, setRevivingIds] = useState<Set<string>>(new Set())
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set())
  const [isAutoScheduling, setIsAutoScheduling] = useState(false)
  
  // UI states
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)
  const [highlightedArticleId, setHighlightedArticleId] = useState<string | null>(null)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Alert states
  const [alerts, setAlerts] = useState<DecayAlert[]>(MOCK_ALERTS)
  const [alertPrefs, setAlertPrefs] = useState<AlertPreferences>(DEFAULT_ALERT_PREFS)
  const [showAlertPanel, setShowAlertPanel] = useState(false)

  // Refs for scrolling
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Computed data
  const criticalArticles = useMemo(
    () => articles.filter((a) => a.status === "critical"),
    [articles]
  )
  
  const watchArticles = useMemo(
    () => articles.filter((a) => a.status === "watch"),
    [articles]
  )

  const matrixPoints = useMemo(() => generateMatrixPoints(articles), [articles])

  const totalTrafficAtRisk = useMemo(
    () => articles.reduce((sum, a) => sum + Math.abs(a.trafficLoss), 0),
    [articles]
  )

  // Toast helper
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Handle "Revive with AI" click
  const handleReviveWithAI = useCallback(async (articleId: string) => {
    setRevivingIds((prev) => new Set([...prev, articleId]))
    
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Navigate to AI Writer with revival mode
    router.push(`/dashboard/creation/ai-writer?mode=revival&articleId=${articleId}`)
  }, [router])

  // Handle "Schedule" click for watch list items
  const handleSchedule = useCallback((articleId: string) => {
    setScheduledIds((prev) => new Set([...prev, articleId]))
    showNotification("Article added to content calendar 📅")
  }, [showNotification])

  // Handle "Auto-Schedule Refresh" for all critical articles
  const handleAutoScheduleAll = useCallback(async () => {
    setIsAutoScheduling(true)
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Mark all critical articles as scheduled
    const criticalIds = criticalArticles.map((a) => a.id)
    setScheduledIds((prev) => new Set([...prev, ...criticalIds]))
    
    setIsAutoScheduling(false)
    showNotification(`${criticalArticles.length} Critical Articles added to roadmap ✅`)
  }, [criticalArticles, showNotification])

  // Handle matrix dot click - scroll to and highlight article
  const handleMatrixDotClick = useCallback((articleId: string) => {
    setHighlightedArticleId(articleId)
    
    // Scroll to the article
    const articleRef = articleRefs.current.get(articleId)
    if (articleRef) {
      articleRef.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    
    // Remove highlight after 3 seconds
    setTimeout(() => setHighlightedArticleId(null), 3000)
  }, [])

  // Dismiss alert
  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    showNotification("Alert dismissed")
  }, [showNotification])

  // Mark alert as actioned
  const handleMarkActioned = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, actionTaken: true } : a
    ))
    showNotification("Marked as actioned ✓")
  }, [showNotification])

  // Toggle alert preference
  const toggleAlertPref = useCallback((key: keyof AlertPreferences) => {
    setAlertPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Unread alerts count
  const unreadAlertsCount = useMemo(
    () => alerts.filter(a => !a.actionTaken).length,
    [alerts]
  )

  // Get article by ID for tooltip
  const getArticleById = useCallback(
    (articleId: string) => articles.find((a) => a.id === articleId),
    [articles]
  )

  // Get decay reason display
  const getDecayReasonDisplay = (reason: DecayReason) => {
    const displays: Record<DecayReason, string> = {
      Competitor: "Competitor Updated Content",
      Outdated: "Content Outdated",
      "Missing Keywords": "Missing LSI Keywords",
      "Schema Issues": "Missing Schema Markup",
      "Slow Load": "Slow Page Load",
    }
    return displays[reason]
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Triage Header */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-orange-950/30 to-amber-950/20 border border-red-900/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <Activity className="w-7 h-7 text-red-400" />
              </div>
              {/* Pulse animation */}
              <div
                className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-400">
                {criticalArticles.length} Articles Critical
              </h1>
              <p className="text-amber-400/80 text-sm mt-0.5">
                You are risking{" "}
                <span className="font-semibold text-amber-400">
                  -{totalTrafficAtRisk.toLocaleString()} visits/mo
                </span>{" "}
                if not fixed.
              </p>
            </div>
          </div>
          <Button
            onClick={handleAutoScheduleAll}
            disabled={isAutoScheduling}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white gap-2 shadow-lg shadow-amber-900/30"
          >
            {isAutoScheduling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Auto-Schedule Refresh
              </>
            )}
          </Button>
        </div>

        {/* Decay Alert Center */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setShowAlertPanel(!showAlertPanel)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <BellRing className="w-5 h-5 text-amber-400" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Decay Alert Center</h2>
                <p className="text-xs text-muted-foreground">{unreadAlertsCount} unread alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {alertPrefs.email && <Mail className="w-4 h-4 text-muted-foreground" />}
                {alertPrefs.slack && <MessageSquare className="w-4 h-4 text-muted-foreground" />}
                {alertPrefs.whatsapp && <MessageSquare className="w-4 h-4 text-emerald-400" />}
                {alertPrefs.push && <Bell className="w-4 h-4 text-muted-foreground" />}
              </div>
              <TrendingDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                showAlertPanel && "rotate-180"
              )} />
            </div>
          </div>

          {showAlertPanel && (
            <div className="border-t border-border">
              {/* Alert Preferences */}
              <div className="p-4 bg-muted/20 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Alert Channels</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleAlertPref("email")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        alertPrefs.email ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </button>
                    <button 
                      onClick={() => toggleAlertPref("slack")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        alertPrefs.slack ? "bg-purple-500/20 text-purple-400" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <MessageSquare className="w-3 h-3" />
                      Slack
                    </button>
                    <button 
                      onClick={() => toggleAlertPref("whatsapp")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        alertPrefs.whatsapp ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => toggleAlertPref("push")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        alertPrefs.push ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Bell className="w-3 h-3" />
                      Push
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => toggleAlertPref("criticalOnly")}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                      alertPrefs.criticalOnly ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Shield className="w-3 h-3" />
                    Critical Only
                  </button>
                  <button
                    onClick={() => toggleAlertPref("dailyDigest")}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                      alertPrefs.dailyDigest ? "bg-cyan-500/20 text-cyan-400" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    Daily Digest
                  </button>
                  <button
                    onClick={() => toggleAlertPref("instantAlerts")}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                      alertPrefs.instantAlerts ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Zap className="w-3 h-3" />
                    Instant Alerts
                  </button>
                </div>
              </div>

              {/* Alert List */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All caught up! No new alerts.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-4 hover:bg-muted/30 transition-colors",
                        !alert.actionTaken && "bg-muted/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              alert.severity === "critical" && "bg-red-500",
                              alert.severity === "warning" && "bg-amber-500",
                              alert.severity === "info" && "bg-blue-500"
                            )} />
                            <span className={cn(
                              "text-sm font-medium",
                              alert.actionTaken ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {alert.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.timestamp}
                            </span>
                            {alert.channel === "email" && <Mail className="w-3 h-3" />}
                            {alert.channel === "slack" && <MessageSquare className="w-3 h-3" />}
                            {alert.channel === "whatsapp" && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                            {alert.channel === "push" && <Bell className="w-3 h-3" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.actionTaken && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleMarkActioned(alert.id)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Done
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {alert.articleId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs mt-2"
                          onClick={() => {
                            handleMatrixDotClick(alert.articleId!)
                            handleMarkActioned(alert.id)
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Article
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decay Matrix */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Decay Matrix</h2>
              <p className="text-sm text-muted-foreground">
                Click on any dot to jump to that article
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Urgent Fix</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Watch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-muted-foreground">Low Priority</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Stable</span>
              </div>
            </div>
          </div>

          {/* Matrix Chart */}
          <div className="relative h-72 bg-slate-900/50 rounded-lg border border-border overflow-hidden">
            {/* Quadrant backgrounds */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="bg-slate-800/30 border-r border-b border-border/30" />
              <div className="bg-red-950/20 border-b border-border/30" />
              <div className="bg-emerald-950/10 border-r border-border/30" />
              <div className="bg-amber-950/10" />
            </div>

            {/* Quadrant labels */}
            <div className="absolute top-3 left-3 text-xs text-slate-500">Low Priority</div>
            <div className="absolute top-3 right-3 text-xs text-red-400 font-medium">Urgent Fix</div>
            <div className="absolute bottom-3 left-3 text-xs text-emerald-500">Stable</div>
            <div className="absolute bottom-3 right-3 text-xs text-amber-400">Watch</div>

            {/* Axis labels */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-1 text-[10px] text-muted-foreground">
              Traffic Value →
            </div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground rotate-[-90deg] origin-center whitespace-nowrap">
              Decay Rate →
            </div>

            {/* Data points */}
            {matrixPoints.map((point) => {
              const article = getArticleById(point.articleId)
              const dotColor = {
                critical: "bg-red-500",
                watch: "bg-amber-500",
                low: "bg-slate-500",
                stable: "bg-emerald-500",
              }[point.zone]

              const glowColor = {
                critical: "shadow-red-500/50",
                watch: "shadow-amber-500/50",
                low: "shadow-slate-500/30",
                stable: "shadow-emerald-500/30",
              }[point.zone]

              return (
                <Tooltip key={point.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "absolute w-3 h-3 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                        dotColor,
                        glowColor,
                        highlightedArticleId === point.articleId && "ring-2 ring-white scale-150"
                      )}
                      style={{
                        left: `${point.x}%`,
                        bottom: `${point.y}%`,
                        transform: "translate(-50%, 50%)",
                      }}
                      onClick={() => handleMatrixDotClick(point.articleId)}
                      onMouseEnter={() => setHoveredDot(point.id)}
                      onMouseLeave={() => setHoveredDot(null)}
                    >
                      {point.zone === "critical" && (
                        <div
                          className="absolute inset-0 rounded-full bg-red-500/40 animate-ping"
                          style={{ animationDuration: "2s" }}
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-slate-800 border-slate-700 max-w-[200px]"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {article?.title}
                      </p>
                      <p className="text-red-400 text-xs">
                        Traffic Loss: {article?.trafficLoss.toLocaleString()}/mo
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Click to view details
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Revival Queue - Critical Articles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-foreground">Revival Queue</h2>
            <span className="text-xs text-muted-foreground ml-2">
              Critical articles requiring immediate attention
            </span>
          </div>

          <div className="space-y-3">
            {criticalArticles.map((article) => {
              const isReviving = revivingIds.has(article.id)
              const isScheduled = scheduledIds.has(article.id)
              const isHighlighted = highlightedArticleId === article.id

              return (
                <div
                  key={article.id}
                  ref={(el) => {
                    if (el) articleRefs.current.set(article.id, el)
                  }}
                  className={cn(
                    "p-4 rounded-xl bg-card border transition-all duration-300",
                    isHighlighted
                      ? "border-white/50 ring-2 ring-white/20 bg-slate-800/80"
                      : "border-red-900/50 hover:border-red-800/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground truncate hover:text-red-400 transition-colors flex items-center gap-1.5 group"
                        >
                          {article.title}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          {getDecayReasonDisplay(article.decayReason)}
                        </span>
                        {isScheduled && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Scheduled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Rank:</span>
                          <span className="text-red-400 font-medium">#{article.currentRank}</span>
                          <span className="text-muted-foreground text-xs">
                            (was #{article.previousRank})
                          </span>
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Traffic Loss:</span>
                          <span className="text-red-400 font-medium">
                            {article.trafficLoss.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Trend:</span>
                          <DecaySparkline data={article.trendData} width={60} height={20} />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleReviveWithAI(article.id)}
                      disabled={isReviving}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2 shadow-lg shadow-violet-900/40 shrink-0"
                    >
                      {isReviving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Reviving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Revive with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Watch List - Warning Articles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-foreground">Watch List</h2>
            <span className="text-xs text-muted-foreground ml-2">
              Showing early signs of decay
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {watchArticles.map((article) => {
              const isScheduled = scheduledIds.has(article.id)
              const isHighlighted = highlightedArticleId === article.id

              return (
                <div
                  key={article.id}
                  ref={(el) => {
                    if (el) articleRefs.current.set(article.id, el)
                  }}
                  className={cn(
                    "p-4 rounded-xl bg-card border transition-all duration-300",
                    isHighlighted
                      ? "border-white/50 ring-2 ring-white/20 bg-slate-800/80"
                      : "border-amber-900/30 hover:border-amber-800/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground truncate mb-2 block hover:text-amber-400 transition-colors"
                      >
                        {article.title}
                      </a>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400/80 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        {getDecayReasonDisplay(article.decayReason)}
                      </span>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">Rank:</span>
                          <span className="text-amber-400 font-medium">#{article.currentRank}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">Loss:</span>
                          <span className="text-amber-400/80">{article.trafficLoss}/mo</span>
                        </div>
                        <DecaySparkline data={article.trendData} width={50} height={18} />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSchedule(article.id)}
                      disabled={isScheduled}
                      className={cn(
                        "shrink-0 text-xs transition-all",
                        isScheduled
                          ? "border-emerald-500/50 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/30"
                          : "border-amber-800/50 text-amber-400 hover:bg-amber-900/20 bg-transparent"
                      )}
                    >
                      {isScheduled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Scheduled ✓
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Schedule
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recovered Section */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-emerald-950/10 border border-emerald-900/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-emerald-400">Recently Revived</h2>
          </div>
          <div className="flex items-center gap-6">
            {RECOVERED_ARTICLES.map((article, i) => (
              <div key={article.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-foreground text-sm">{article.title}</span>
                </div>
                <span className="text-emerald-400 font-medium text-sm">{article.trafficGain}</span>
                <span className="text-muted-foreground text-xs">{article.daysAgo}d ago</span>
                {i < RECOVERED_ARTICLES.length - 1 && (
                  <div className="w-px h-4 bg-border ml-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-foreground">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}