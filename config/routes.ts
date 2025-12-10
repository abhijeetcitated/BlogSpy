/**
 * Routes Configuration
 * Centralized route definitions for the application
 */

export const routes = {
  // Public Routes
  home: "/",
  features: "/features",
  pricing: "/pricing",
  blog: "/blog",
  about: "/about",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",

  // Auth Routes
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verify: "/verify-email",
  },

  // Dashboard Routes
  dashboard: {
    root: "/dashboard",
    
    // Research
    research: {
      overview: (keyword?: string) => 
        keyword ? `/dashboard/research/overview/${encodeURIComponent(keyword)}` : "/dashboard/research/overview",
      keywordMagic: "/dashboard/research/keyword-magic",
      gapAnalysis: "/dashboard/research/gap-analysis",
      trends: "/dashboard/research/trends",
    },

    // Creation
    creation: {
      aiWriter: "/dashboard/creation/ai-writer",
      onPage: "/dashboard/creation/on-page",
      snippetStealer: "/dashboard/creation/snippet-stealer",
    },

    // Strategy
    strategy: {
      roadmap: "/dashboard/strategy/roadmap",
      topicClusters: "/dashboard/strategy/topic-clusters",
    },

    // Tracking
    tracking: {
      rankTracker: "/dashboard/tracking/rank-tracker",
      decay: "/dashboard/tracking/decay",
    },

    // Settings
    settings: "/dashboard/settings",
    billing: "/dashboard/billing",
    team: "/dashboard/team",
    profile: "/dashboard/profile",
  },

  // API Routes
  api: {
    auth: "/api/auth",
    keywords: "/api/keywords",
    rankings: "/api/rankings",
    content: "/api/content",
    trends: "/api/trends",
    webhooks: "/api/webhooks",
  },
} as const

// Route helpers
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    routes.home,
    routes.features,
    routes.pricing,
    routes.blog,
    routes.about,
    routes.contact,
    routes.terms,
    routes.privacy,
    routes.auth.login,
    routes.auth.register,
    routes.auth.forgotPassword,
  ]
  return publicRoutes.includes(pathname as typeof routes.home)
}

export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/login") ||
         pathname.startsWith("/register") ||
         pathname.startsWith("/forgot-password") ||
         pathname.startsWith("/reset-password") ||
         pathname.startsWith("/verify-email")
}

export function isDashboardRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard")
}

export function getRedirectUrl(pathname: string, isAuthenticated: boolean): string | null {
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute(pathname)) {
    return routes.dashboard.root
  }

  // Redirect unauthenticated users to login from dashboard
  if (!isAuthenticated && isDashboardRoute(pathname)) {
    return `${routes.auth.login}?redirect=${encodeURIComponent(pathname)}`
  }

  return null
}

// Breadcrumb configuration
export const breadcrumbs: Record<string, { label: string; parent?: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/dashboard/research/overview": { label: "Keyword Overview", parent: "/dashboard" },
  "/dashboard/research/keyword-magic": { label: "Keyword Magic", parent: "/dashboard" },
  "/dashboard/research/gap-analysis": { label: "Gap Analysis", parent: "/dashboard" },
  "/dashboard/research/trends": { label: "Trends", parent: "/dashboard" },
  "/dashboard/creation/ai-writer": { label: "AI Writer", parent: "/dashboard" },
  "/dashboard/creation/on-page": { label: "On-Page Checker", parent: "/dashboard" },
  "/dashboard/creation/snippet-stealer": { label: "Snippet Stealer", parent: "/dashboard" },
  "/dashboard/strategy/roadmap": { label: "Content Roadmap", parent: "/dashboard" },
  "/dashboard/strategy/topic-clusters": { label: "Topic Clusters", parent: "/dashboard" },
  "/dashboard/tracking/rank-tracker": { label: "Rank Tracker", parent: "/dashboard" },
  "/dashboard/tracking/decay": { label: "Content Decay", parent: "/dashboard" },
  "/dashboard/settings": { label: "Settings", parent: "/dashboard" },
  "/dashboard/billing": { label: "Billing", parent: "/dashboard" },
  "/dashboard/profile": { label: "Profile", parent: "/dashboard" },
}

export function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = []
  let current = pathname

  while (current && breadcrumbs[current]) {
    crumbs.unshift({
      label: breadcrumbs[current].label,
      href: current,
    })
    current = breadcrumbs[current].parent || ""
  }

  return crumbs
}

export default routes
