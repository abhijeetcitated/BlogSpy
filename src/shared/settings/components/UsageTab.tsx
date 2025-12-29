"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Zap, Calendar, Download, FileDown, Filter } from "lucide-react"
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
import { useCredits } from "@/hooks/use-user"

// Feature credit costs
const FEATURE_COSTS = [
  { name: "Keyword Magic", credits: 5, icon: Zap, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  { name: "AI Writer", credits: 25, icon: TrendingUp, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  { name: "Rank Tracker", credits: 10, icon: BarChart3, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  { name: "Trend Spotter", credits: 5, icon: TrendingUp, color: "text-amber-400", bgColor: "bg-amber-500/20" },
]

// Mock usage history (will be replaced with real data from credit_usage_history table)
const MOCK_USAGE_HISTORY = [
  { date: "2024-12-26", feature: "Keyword Magic", credits: 15, queries: 3, status: "completed" },
  { date: "2024-12-25", feature: "AI Writer", credits: 50, queries: 2, status: "completed" },
  { date: "2024-12-24", feature: "Rank Tracker", credits: 20, queries: 2, status: "completed" },
  { date: "2024-12-23", feature: "Keyword Magic", credits: 25, queries: 5, status: "completed" },
  { date: "2024-12-22", feature: "Trend Spotter", credits: 10, queries: 2, status: "completed" },
  { date: "2024-12-21", feature: "AI Writer", credits: 75, queries: 3, status: "completed" },
  { date: "2024-12-20", feature: "Keyword Magic", credits: 10, queries: 2, status: "completed" },
  { date: "2024-12-19", feature: "Rank Tracker", credits: 30, queries: 3, status: "completed" },
]

const FEATURE_ICON_MAP: Record<string, typeof Zap> = {
  "Keyword Magic": Zap,
  "AI Writer": TrendingUp,
  "Rank Tracker": BarChart3,
  "Trend Spotter": TrendingUp,
}

const FEATURE_COLOR_MAP: Record<string, string> = {
  "Keyword Magic": "text-emerald-400",
  "AI Writer": "text-purple-400",
  "Rank Tracker": "text-blue-400",
  "Trend Spotter": "text-amber-400",
}

export function UsageTab() {
  const { credits, creditPercentage, daysUntilReset } = useCredits()
  const [filterFeature, setFilterFeature] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)
  
  const percentage = creditPercentage()
  const renewsInDays = daysUntilReset()

  const filteredHistory = filterFeature === "all" 
    ? MOCK_USAGE_HISTORY 
    : MOCK_USAGE_HISTORY.filter(item => item.feature === filterFeature)

  const handleExportCSV = () => {
    setIsExporting(true)
    
    // Create CSV content
    const headers = ["Date", "Feature", "Credits Used", "Queries", "Status"]
    const rows = filteredHistory.map(item => [
      item.date,
      item.feature,
      item.credits.toString(),
      item.queries.toString(),
      item.status
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `blogspy-usage-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => setIsExporting(false), 1000)
  }

  // Calculate totals
  const totalCreditsUsed = filteredHistory.reduce((sum, item) => sum + item.credits, 0)
  const totalQueries = filteredHistory.reduce((sum, item) => sum + item.queries, 0)

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Usage Overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your credit usage this billing cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Usage Meter */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
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
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Resets in</p>
                <p className="text-lg font-semibold text-foreground">{renewsInDays} days</p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={percentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage}% used</span>
                <span>{credits.remaining.toLocaleString()} remaining</span>
              </div>
            </div>
          </div>

          {/* Feature Credits Cost */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Credits per Feature</h4>
            <div className="grid grid-cols-2 gap-3">
              {FEATURE_COSTS.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded ${feature.bgColor} flex items-center justify-center`}>
                      <feature.icon className={`h-3 w-3 ${feature.color}`} />
                    </div>
                    <span className="text-sm text-foreground">{feature.name}</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{feature.credits} cr</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="bg-card/50 border-border">
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
                  <SelectItem value="all">All Features</SelectItem>
                  <SelectItem value="Keyword Magic">Keyword Magic</SelectItem>
                  <SelectItem value="AI Writer">AI Writer</SelectItem>
                  <SelectItem value="Rank Tracker">Rank Tracker</SelectItem>
                  <SelectItem value="Trend Spotter">Trend Spotter</SelectItem>
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
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-xs text-muted-foreground">Total Credits</p>
              <p className="text-lg font-bold text-foreground">{totalCreditsUsed}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-xs text-muted-foreground">Total Queries</p>
              <p className="text-lg font-bold text-foreground">{totalQueries}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-xs text-muted-foreground">Records</p>
              <p className="text-lg font-bold text-foreground">{filteredHistory.length}</p>
            </div>
          </div>

          <div className="space-y-2">
            {filteredHistory.map((item, index) => {
              const FeatureIcon = FEATURE_ICON_MAP[item.feature] || BarChart3
              const featureColor = FEATURE_COLOR_MAP[item.feature] || "text-muted-foreground"
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center`}>
                      <FeatureIcon className={`h-4 w-4 ${featureColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.feature}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} • {item.queries} {item.queries === 1 ? "query" : "queries"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs"
                    >
                      {item.status}
                    </Badge>
                    <span className="text-sm font-mono text-red-400 min-w-[60px] text-right">
                      -{item.credits} cr
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
        </CardContent>
      </Card>
    </div>
  )
}
