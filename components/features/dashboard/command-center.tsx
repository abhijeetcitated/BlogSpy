"use client"

import Link from "next/link"
import { Search, PenTool, TrendingUp, Network, Clock, AlertTriangle, Zap, ArrowUp, Target, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingSparkline, CreditRing } from "@/components/charts"

const quickActions = [
  { 
    title: "Write Article", 
    icon: PenTool, 
    color: "from-blue-500/20 to-cyan-500/20", 
    iconColor: "text-blue-400",
    href: "/dashboard/creation/ai-writer"
  },
  {
    title: "Check Rank",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    href: "/dashboard/tracking/rank-tracker"
  },
  { 
    title: "Find Keywords", 
    icon: Search, 
    color: "from-orange-500/20 to-amber-500/20", 
    iconColor: "text-orange-400",
    href: "/dashboard/research/keyword-magic"
  },
  { 
    title: "Cluster Topics", 
    icon: Network, 
    color: "from-cyan-500/20 to-teal-500/20", 
    iconColor: "text-cyan-400",
    href: "/dashboard/strategy/topic-clusters"
  },
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
                placeholder="Search for a keyword, domain, or use ⌘K..."
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
        {/* Trend Spotter Card - Now Clickable */}
        <Link href="/dashboard/research/trends" className="block">
          <Card className="bg-gradient-to-br from-card to-emerald-950/20 border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300 group relative overflow-hidden h-full cursor-pointer">
            <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Trend Spotter</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">+300% Today</Badge>
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground group-hover:text-emerald-400 transition-colors">AI Agents</p>
                  <p className="text-sm text-muted-foreground">Viral keyword detected</p>
                </div>
                <TrendingSparkline />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Opportunities Card - Fix Now Button Wired */}
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
                asChild
                size="sm"
                className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <Link href="/dashboard/tracking/decay">
                  <Zap className="h-4 w-4 mr-2" />
                  Fix Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Health - Now Clickable */}
        <Link href="/dashboard/settings/billing" className="block">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300 h-full cursor-pointer group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Credit Health</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CreditRing used={250} total={1000} />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Rank Tracker Card - Styled Button */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 uppercase tracking-wider font-medium">Rank Tracker</span>
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">12 Keywords in Top 10</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm text-muted-foreground">Avg Position: 14.2</span>
                  <div className="flex items-center gap-0.5 text-emerald-400">
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">2.1</span>
                  </div>
                </div>
              </div>
              {/* Task 1: Styled Cyan Button like "Fix Now" */}
              <Button
                asChild
                size="sm"
                className="w-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
              >
                <Link href="/dashboard/tracking/rank-tracker">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
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
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} border border-border/30 hover:border-border/50 hover:scale-[1.02] transition-all duration-200`}
                  >
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    <span className="text-xs font-medium text-foreground">{action.title}</span>
                  </Link>
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
              <div className="space-y-2">
                {recentSearches.map((item, index) => (
                  <Link
                    key={index}
                    href={`/dashboard/research/overview/${encodeURIComponent(item.keyword)}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-slate-900 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                      <span className="text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                        {item.keyword}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}