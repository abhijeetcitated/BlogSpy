"use client"

import { Search, PenTool, TrendingUp, Network, Clock, AlertTriangle, CheckCircle2, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingSparkline } from "@/components/trending-sparkline"
import { CreditRing } from "@/components/credit-ring"

const quickActions = [
  { title: "Write Article", icon: PenTool, color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
  {
    title: "Check Rank",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
  { title: "Find Keywords", icon: Search, color: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-400" },
  { title: "Cluster Topics", icon: Network, color: "from-cyan-500/20 to-teal-500/20", iconColor: "text-cyan-400" },
]

const recentSearches = [
  { keyword: "best seo tools 2024", time: "2 hours ago" },
  { keyword: "nextjs templates", time: "5 hours ago" },
  { keyword: "ai content writing", time: "Yesterday" },
]

export function CommandCenter() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Good afternoon, John. Ready to dominate the SERPs?</h1>
        </div>
        <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground font-normal">
          {today}
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-card via-card to-emerald-950/10 border-border/50 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-8 relative">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <Input
                placeholder="Enter a keyword, domain, or topic..."
                className="h-16 pl-14 pr-24 text-lg bg-background/80 border-border hover:border-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all placeholder:text-muted-foreground/50 rounded-xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="hidden sm:inline-flex h-7 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-xs text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Press Enter to search or use <span className="font-mono text-foreground/70">⌘K</span> for quick access
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-emerald-950/20 border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Trend Spotter</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">+300% Today</Badge>
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">AI Agents</p>
                <p className="text-sm text-muted-foreground">Viral keyword detected</p>
              </div>
              <TrendingSparkline />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-amber-950/10 border-border/50 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-400 uppercase tracking-wider font-medium">Opportunities</span>
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">3 articles</p>
                <p className="text-sm text-muted-foreground">dropped to Page 2</p>
              </div>
              <Button
                size="sm"
                className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
              >
                <Zap className="h-4 w-4 mr-2" />
                Fix Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Health */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Credit Health</span>
              <CreditRing used={250} total={1000} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">System Status</span>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-foreground">API Status</span>
                  </div>
                  <span className="text-xs text-emerald-400">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-foreground">Credits</span>
                  </div>
                  <span className="text-xs text-emerald-400">Healthy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Spans 2 columns */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Quick Actions</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} border border-border/30 hover:border-border/50 hover:scale-[1.02] transition-all duration-200`}
                  >
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    <span className="text-xs font-medium text-foreground">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Spans 2 columns */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Recent Activity</span>
              <div className="space-y-3">
                {recentSearches.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                        {item.keyword}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
