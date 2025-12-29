"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProfile, useCredits } from "@/hooks/use-user"
import { useAuth } from "@/contexts/auth-context"
import {
  Search,
  Flame,
  Crosshair,
  Network,
  Map,
  Sparkles,
  Scissors,
  CheckCircle,
  BarChart2,
  TrendingDown,
  Settings,
  User,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  Copy,
  Video,
  Quote,
  DollarSign,
  Calculator,
  Target,
  ShoppingCart,
  Bot,
  Eye,
  Code2,
  Newspaper,
  MessageCircle,
  Share2,
  CreditCard,
  Key,
  Activity,
  BookOpen,
  HelpCircle,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const projects = [
  { name: "My Tech Blog", id: "1" },
  { name: "Marketing Site", id: "2" },
  { name: "E-commerce Store", id: "3" },
]

const researchItems = [
  { title: "Keyword Magic", icon: Search, href: "/dashboard/research/keyword-magic" },
  { title: "Trend Spotter", icon: Flame, href: "/dashboard/research/trends", accentColor: "text-amber-500" },
  { title: "Competitor Gap", icon: Crosshair, href: "/dashboard/research/gap-analysis" },
  { title: "Affiliate Finder", icon: ShoppingCart, href: "/dashboard/research/affiliate-finder", accentColor: "text-purple-500" },
  { title: "Video Hijack", icon: Video, href: "/dashboard/research/video-hijack", accentColor: "text-red-500" },
  { title: "Am I Cited?", icon: Quote, href: "/dashboard/research/citation-checker", accentColor: "text-violet-500" },
]

const strategyItems = [
  { title: "Topic Clusters", icon: Network, href: "/dashboard/strategy/topic-clusters", accentColor: "text-violet-500" },
  { title: "Content Roadmap", icon: Map, href: "/dashboard/strategy/roadmap" },
]

const creationItems = [
  { title: "AI Writer", icon: Sparkles, href: "/dashboard/creation/ai-writer", accentColor: "text-yellow-400" },
  { title: "Snippet Stealer", icon: Scissors, href: "/dashboard/creation/snippet-stealer" },
  { title: "On-Page Checker", icon: CheckCircle, href: "/dashboard/creation/on-page" },
  { title: "Schema Generator", icon: Code2, href: "/dashboard/creation/schema-generator", accentColor: "text-cyan-500" },
]

const trackingItems = [
  { title: "Rank Tracker", icon: BarChart2, href: "/dashboard/tracking/rank-tracker" },
  { title: "Decay Alerts", icon: TrendingDown, href: "/dashboard/tracking/decay", accentColor: "text-red-500" },
  { title: "Cannibalization", icon: Copy, href: "/dashboard/tracking/cannibalization", accentColor: "text-orange-500" },
  { title: "News Tracker", icon: Newspaper, href: "/dashboard/tracking/news-tracker", accentColor: "text-blue-500" },
  { title: "Community Tracker", icon: MessageCircle, href: "/dashboard/tracking/community-tracker", accentColor: "text-amber-500" },
  { title: "Social Tracker", icon: Share2, href: "/dashboard/tracking/social-tracker", accentColor: "text-pink-500" },
  { title: "Commerce Tracker", icon: ShoppingCart, href: "/dashboard/tracking/commerce-tracker", accentColor: "text-orange-400" },
]

const monetizationItems = [
  { title: "Earnings Calculator", icon: Calculator, href: "/dashboard/monetization/earnings-calculator", accentColor: "text-emerald-500" },
  { title: "Content ROI", icon: Target, href: "/dashboard/monetization/content-roi", accentColor: "text-purple-500" },
]

const aiInsightsItems = [
  { title: "AI Visibility", icon: Bot, href: "/dashboard/ai-visibility", accentColor: "text-cyan-500" },
]

export function AppSidebar() {
  const [selectedProject, setSelectedProject] = useState(projects[0])
  const router = useRouter()
  
  // Get user data from context
  const { displayName, email, plan, avatar, initials, isLoading: profileLoading } = useProfile()
  const { credits, creditPercentage } = useCredits()
  const { logout } = useAuth()
  
  // Derived state
  const isLoading = profileLoading
  const userName = displayName || "User"
  const userEmail = email || "user@example.com"
  const userPlan = plan === "PRO" ? "Pro Plan" : plan === "ENTERPRISE" ? "Enterprise" : "Free Plan"
  const creditsUsed = credits.used
  const creditsTotal = credits.total
  const userAvatar = avatar
  const userInitials = initials

  // Handle sign out
  const handleSignOut = () => {
    logout()
    router.push("/")
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-cyan-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">BlogSpy</span>
        </div>

        {/* Project Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{selectedProject.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {projects.map((project) => (
              <DropdownMenuItem key={project.id} onClick={() => setSelectedProject(project)} className="cursor-pointer">
                <FolderKanban className="h-4 w-4 mr-2" />
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Dashboard Overview */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="gap-3">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Insights Group - Core Feature */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            🤖 AI Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiInsightsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3">
                    <Link href={item.href}>
                      <item.icon className={`h-4 w-4 ${item.accentColor || ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Research Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Research
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {researchItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3">
                    <Link href={item.href}>
                      <item.icon className={`h-4 w-4 ${item.accentColor || ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Strategy Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Strategy
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {strategyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3">
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Creation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Creation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3">
                    <Link href={item.href}>
                      <item.icon className={`h-4 w-4 ${item.accentColor || ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tracking Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Tracking
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trackingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3">
                    <Link href={item.href}>
                      <item.icon className={`h-4 w-4 ${item.accentColor || ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Monetization Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            💰 Monetization
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monetizationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3">
                    <Link href={item.href}>
                      <item.icon className={`h-4 w-4 ${item.accentColor || ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        {/* Credits Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credits</span>
            {isLoading ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <span className="text-sidebar-foreground font-mono">
                {creditsUsed}/{creditsTotal}
              </span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-1.5 w-full" />
          ) : (
            <Progress value={(creditsUsed / creditsTotal) * 100} className="h-1.5" />
          )}
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors cursor-pointer group w-full text-left">
              {isLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <Avatar className="h-8 w-8">
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                  <AvatarFallback className="bg-linear-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userPlan}</p>
                  </>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top" 
            className="w-56 mb-2"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Account Section */}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings?tab=billing" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings?tab=api" className="flex items-center">
                <Key className="mr-2 h-4 w-4" />
                API Keys
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings?tab=usage" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                Usage
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Support Section */}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/docs" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Documentation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/support" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Sign Out */}
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
