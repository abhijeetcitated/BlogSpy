/**
 * â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
 * â•‘                                                                                                                â•‘
 * â•‘   âš ï¸âš ï¸âš ï¸  CRITICAL FILE - COMPLETE PROJECT STRUCTURE - DO NOT DELETE âš ï¸âš ï¸âš ï¸                                   â•‘
 * â•‘                                                                                                                â•‘
 * â•‘   This file contains the COMPLETE folder and file structure of BlogSpy SaaS application.                      â•‘
 * â•‘   Use this as a reference for understanding the codebase architecture.                                        â•‘
 * â•‘                                                                                                                â•‘
 * â•‘   ðŸ”´ ANY AI MODEL OR DEVELOPER: REFER THIS BEFORE MAKING STRUCTURAL CHANGES ðŸ”´                                â•‘
 * â•‘                                                                                                                â•‘
 * â•‘   Last Updated: December 28, 2025                                                                              â•‘
 * â•‘   Total Features: 27+                                                                                          â•‘
 * â•‘   Framework: Next.js 14 (App Router) + TypeScript + Tailwind CSS                                               â•‘
 * â•‘                                                                                                                â•‘
 * â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// THIS FILE EXPORTS NOTHING - IT IS PURE DOCUMENTATION
// IT WILL NOT AFFECT BUILD, IMPORTS, OR ANY OTHER CODE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/*
â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ
â–ˆ                                                                                                                      â–ˆ
â–ˆ   ðŸ“ BLOGSPY-SAAS - COMPLETE PROJECT STRUCTURE                                                                       â–ˆ
â–ˆ   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•                                                                       â–ˆ
â–ˆ                                                                                                                      â–ˆ
â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ


blogspy-saas/
â”‚
â”œâ”€â”€ ðŸ“„ ROOT CONFIG FILES
â”‚   â”œâ”€â”€ .env.example                    # Environment variables template
â”‚   â”œâ”€â”€ .gitignore                      # Git ignore rules
â”‚   â”œâ”€â”€ .npmrc                          # NPM configuration
â”‚   â”œâ”€â”€ components.json                 # shadcn/ui configuration
â”‚   â”œâ”€â”€ eslint.config.mjs               # ESLint configuration
â”‚   â”œâ”€â”€ next.config.ts                  # Next.js configuration
â”‚   â”œâ”€â”€ next-env.d.ts                   # Next.js TypeScript declarations
â”‚   â”œâ”€â”€ package.json                    # Dependencies & scripts
â”‚   â”œâ”€â”€ package-lock.json               # Locked dependencies
â”‚   â”œâ”€â”€ postcss.config.mjs              # PostCSS configuration
â”‚   â”œâ”€â”€ proxy.ts                        # Proxy server configuration
â”‚   â”œâ”€â”€ README.md                       # Project documentation
â”‚   â”œâ”€â”€ tsconfig.json                   # TypeScript configuration
â”‚   â”œâ”€â”€ tsconfig.tsbuildinfo            # TypeScript build cache
â”‚   â”œâ”€â”€ vercel.json                     # Vercel deployment config
â”‚   â””â”€â”€ _PROJECT_STRUCTURE.ts           # ðŸ“Œ THIS FILE - Project structure
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ app/                             # â•â•â• NEXT.JS APP ROUTER â•â•â•
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“„ Root Files
â”‚   â”‚   â”œâ”€â”€ favicon.ico                 # App favicon
â”‚   â”‚   â”œâ”€â”€ globals.css                 # Global styles
â”‚   â”‚   â”œâ”€â”€ layout.tsx                  # Root layout
â”‚   â”‚   â”œâ”€â”€ page.tsx                    # Landing page (/)
â”‚   â”‚   â””â”€â”€ sitemap.ts                  # Dynamic sitemap
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ (auth)/                      # â•â•â• AUTHENTICATION PAGES â•â•â•
â”‚   â”‚   â”œâ”€â”€ layout.tsx                  # Auth layout (centered)
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /login
â”‚   â”‚   â”œâ”€â”€ register/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /register
â”‚   â”‚   â”œâ”€â”€ forgot-password/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /forgot-password
â”‚   â”‚   â””â”€â”€ verify-email/
â”‚   â”‚       â””â”€â”€ page.tsx                # /verify-email
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ (marketing)/                 # â•â•â• MARKETING PAGES â•â•â•
â”‚   â”‚   â”œâ”€â”€ layout.tsx                  # Marketing layout (header/footer)
â”‚   â”‚   â”œâ”€â”€ about/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /about
â”‚   â”‚   â”œâ”€â”€ blog/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /blog
â”‚   â”‚   â”œâ”€â”€ contact/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /contact
â”‚   â”‚   â”œâ”€â”€ features/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /features
â”‚   â”‚   â”œâ”€â”€ privacy/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /privacy
â”‚   â”‚   â””â”€â”€ terms/
â”‚   â”‚       â””â”€â”€ page.tsx                # /terms
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ dashboard/                   # â•â•â• MAIN APP DASHBOARD â•â•â•
â”‚   â”‚   â”œâ”€â”€ layout.tsx                  # Dashboard layout (sidebar)
â”‚   â”‚   â”œâ”€â”€ loading.tsx                 # Loading state
â”‚   â”‚   â”œâ”€â”€ page.tsx                    # /dashboard (overview)
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ ai-visibility/           # ðŸ¤– AI INSIGHTS
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /dashboard/ai-visibility
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ research/                # ðŸ” RESEARCH SECTION
â”‚   â”‚   â”‚   â”œâ”€â”€ keyword-magic/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/keyword-magic
â”‚   â”‚   â”‚   â”œâ”€â”€ trends/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/trends
â”‚   â”‚   â”‚   â”œâ”€â”€ gap-analysis/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/gap-analysis
â”‚   â”‚   â”‚   â”œâ”€â”€ affiliate-finder/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/affiliate-finder
â”‚   â”‚   â”‚   â”œâ”€â”€ video-hijack/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/video-hijack
â”‚   â”‚   â”‚   â”œâ”€â”€ citation-checker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/citation-checker
â”‚   â”‚   â”‚   â”œâ”€â”€ content-calendar/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/research/content-calendar
â”‚   â”‚   â”‚   â””â”€â”€ overview/
â”‚   â”‚   â”‚       â””â”€â”€ [keyword]/
â”‚   â”‚   â”‚           â””â”€â”€ page.tsx        # /dashboard/research/overview/[keyword]
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ strategy/                # ðŸ“‹ STRATEGY SECTION
â”‚   â”‚   â”‚   â”œâ”€â”€ topic-clusters/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx            # /dashboard/strategy/topic-clusters
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ results/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ page.tsx        # /dashboard/strategy/topic-clusters/results
â”‚   â”‚   â”‚   â””â”€â”€ roadmap/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx            # /dashboard/strategy/roadmap
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ creation/                # âœï¸ CREATION SECTION
â”‚   â”‚   â”‚   â”œâ”€â”€ ai-writer/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/creation/ai-writer
â”‚   â”‚   â”‚   â”œâ”€â”€ snippet-stealer/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/creation/snippet-stealer
â”‚   â”‚   â”‚   â”œâ”€â”€ on-page/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/creation/on-page
â”‚   â”‚   â”‚   â””â”€â”€ schema-generator/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx            # /dashboard/creation/schema-generator
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ tracking/                # ðŸ“Š TRACKING SECTION
â”‚   â”‚   â”‚   â”œâ”€â”€ rank-tracker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/rank-tracker
â”‚   â”‚   â”‚   â”œâ”€â”€ decay/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/decay
â”‚   â”‚   â”‚   â”œâ”€â”€ cannibalization/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/cannibalization
â”‚   â”‚   â”‚   â”œâ”€â”€ news-tracker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/news-tracker
â”‚   â”‚   â”‚   â”œâ”€â”€ community-tracker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/community-tracker
â”‚   â”‚   â”‚   â”œâ”€â”€ social-tracker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/social-tracker
â”‚   â”‚   â”‚   â”œâ”€â”€ commerce-tracker/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/tracking/commerce-tracker
â”‚   â”‚   â”‚   â””â”€â”€ ai-visibility/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx            # /dashboard/tracking/ai-visibility (alt)
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ monetization/            # ðŸ’° MONETIZATION SECTION
â”‚   â”‚   â”‚   â”œâ”€â”€ earnings-calculator/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx            # /dashboard/monetization/earnings-calculator
â”‚   â”‚   â”‚   â””â”€â”€ content-roi/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx            # /dashboard/monetization/content-roi
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ billing/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /dashboard/billing
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ settings/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                # /dashboard/settings
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ ðŸ“‚ navigation-demo/
â”‚   â”‚       â””â”€â”€ page.tsx                # /dashboard/navigation-demo
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ api/                         # â•â•â• API ROUTES â•â•â•
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/auth (Supabase auth)
â”‚   â”‚   â”œâ”€â”€ webhooks/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/webhooks (Payment webhooks)
â”‚   â”‚   â”œâ”€â”€ alerts/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/alerts
â”‚   â”‚   â”œâ”€â”€ content/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/content
â”‚   â”‚   â”œâ”€â”€ cron/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/cron (Scheduled jobs)
â”‚   â”‚   â”œâ”€â”€ decay-detection/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/decay-detection
â”‚   â”‚   â”œâ”€â”€ integrations/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/integrations
â”‚   â”‚   â”œâ”€â”€ keywords/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/keywords
â”‚   â”‚   â”œâ”€â”€ rankings/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/rankings
â”‚   â”‚   â”œâ”€â”€ social-tracker/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/social-tracker
â”‚   â”‚   â”œâ”€â”€ trends/
â”‚   â”‚   â”‚   â””â”€â”€ route.ts                # /api/trends
â”‚   â”‚   â””â”€â”€ video-hijack/
â”‚   â”‚       â””â”€â”€ route.ts                # /api/video-hijack
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ pricing/
â”‚   â”‚   â””â”€â”€ page.tsx                    # /pricing
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ settings/
â”‚   â”‚   â””â”€â”€ page.tsx                    # /settings (public)
â”‚   â”‚
â”‚   â””â”€â”€ ðŸ“‚ [Legacy Routes - To be cleaned]
â”‚       â”œâ”€â”€ ai-writer/
â”‚       â”œâ”€â”€ competitor-gap/
â”‚       â”œâ”€â”€ content-decay/
â”‚       â”œâ”€â”€ content-roadmap/
â”‚       â”œâ”€â”€ keyword-magic/
â”‚       â”œâ”€â”€ keyword-overview/
â”‚       â”œâ”€â”€ on-page-checker/
â”‚       â”œâ”€â”€ rank-tracker/
â”‚       â”œâ”€â”€ snippet-stealer/
â”‚       â”œâ”€â”€ topic-clusters/
â”‚       â”œâ”€â”€ trend-spotter/
â”‚       â””â”€â”€ trends/
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ src/                             # â•â•â• SOURCE CODE (FEATURES) â•â•â•
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ features/                    # â•â•â• FEATURE MODULES â•â•â•
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ ai-visibility/           # ðŸ¤– AI VISIBILITY (CORE FEATURE)
â”‚   â”‚   â”‚   â”œâ”€â”€ _INTEGRATION_GUIDE.ts   # ðŸ“Œ Integration documentation
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts                # Barrel exports
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ AIVisibilityDashboard.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ CitationCard.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ FactPricingGuard.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ PlatformBreakdown.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ QueryOpportunities.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ VisibilityTrendChart.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ index.tsx           # AI platforms, icons, sample data
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ index.ts            # TypeScript types
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚       â””â”€â”€ index.ts            # Utility functions
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ ai-writer/               # âœï¸ AI WRITER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ ai-writer-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ai-writer-content-refactored.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ extensions/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ styles/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ keyword-magic/           # ðŸ”® KEYWORD MAGIC
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ keyword-magic-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ state/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ keyword-overview/        # ðŸ“Š KEYWORD OVERVIEW
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ keyword-overview-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ rank-tracker/            # ðŸ“ˆ RANK TRACKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ rank-tracker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ rank-tracker-content-v2.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ content-decay/           # ðŸ“‰ CONTENT DECAY
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ content-decay-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ competitor-gap/          # ðŸŽ¯ COMPETITOR GAP
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ competitor-gap-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ competitor-gap-content/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ topic-clusters/          # ðŸŒ TOPIC CLUSTERS
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ topic-cluster-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ topic-cluster-page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ content-roadmap/         # ðŸ—ºï¸ CONTENT ROADMAP
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ content-roadmap-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ snippet-stealer/         # âœ‚ï¸ SNIPPET STEALER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ snippet-stealer-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ on-page-checker/         # âœ… ON-PAGE CHECKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ on-page-checker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ schema-generator/        # ðŸ—ï¸ SCHEMA GENERATOR
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ trend-spotter/           # ðŸ”¥ TREND SPOTTER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ trend-spotter.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ affiliate-finder/        # ðŸ’µ AFFILIATE FINDER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ video-hijack/            # ðŸŽ¬ VIDEO HIJACK
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ video-hijack-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ video-hijack-content-refactored.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ citation-checker/        # ðŸ“œ CITATION CHECKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ citation-checker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ cannibalization/         # ðŸ”„ CANNIBALIZATION
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ cannibalization-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ content-calendar/        # ðŸ“… CONTENT CALENDAR
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ content-calendar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ news-tracker/            # ðŸ“° NEWS TRACKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ news-tracker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ news-tracker-content-refactored.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ api-pricing.config.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ community-tracker/       # ðŸ’¬ COMMUNITY TRACKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ community-tracker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ social-tracker/          # ðŸ“± SOCIAL TRACKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ social-tracker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ credits/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ config/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ pricing.config.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ commerce-tracker/        # ðŸ›’ COMMERCE TRACKER
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ commerce-tracker-content.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ content-roi/             # ðŸ’¹ CONTENT ROI
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ monetization/            # ðŸ’° MONETIZATION
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ command-palette/         # âŒ˜ COMMAND PALETTE
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“‚ notifications/           # ðŸ”” NOTIFICATIONS
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â””â”€â”€ __mocks__/
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ ðŸ“‚ integrations/            # ðŸ”— INTEGRATIONS (GA4/GSC)
â”‚   â”‚       â”œâ”€â”€ index.ts
â”‚   â”‚       â”œâ”€â”€ ga4/
â”‚   â”‚       â”œâ”€â”€ gsc/
â”‚   â”‚       â””â”€â”€ shared/
â”‚   â”‚
â”‚   â””â”€â”€ ðŸ“‚ shared/                      # â•â•â• SHARED MODULES â•â•â•
â”‚       â”œâ”€â”€ ðŸ“‚ ai-overview/
â”‚       â”œâ”€â”€ ðŸ“‚ community-decay/
â”‚       â”œâ”€â”€ ðŸ“‚ dashboard/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ CommandCenter.tsx
â”‚       â”‚   â””â”€â”€ components/
â”‚       â”œâ”€â”€ ðŸ“‚ geo-score/
â”‚       â”œâ”€â”€ ðŸ“‚ pricing/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â””â”€â”€ PricingModal.tsx
â”‚       â”œâ”€â”€ ðŸ“‚ rtv/
â”‚       â”œâ”€â”€ ðŸ“‚ settings/
â”‚       â”‚   â”œâ”€â”€ index.ts
â”‚       â”‚   â”œâ”€â”€ settings-content.tsx
â”‚       â”‚   â”œâ”€â”€ components/
â”‚       â”‚   â”œâ”€â”€ constants/
â”‚       â”‚   â”œâ”€â”€ types/
â”‚       â”‚   â””â”€â”€ utils/
â”‚       â””â”€â”€ ðŸ“‚ utils/
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ components/                      # â•â•â• SHARED UI COMPONENTS â•â•â•
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ ui/                          # shadcn/ui Components
â”‚   â”‚   â”œâ”€â”€ ai-overview-card.tsx
â”‚   â”‚   â”œâ”€â”€ alert-dialog.tsx
â”‚   â”‚   â”œâ”€â”€ avatar.tsx
â”‚   â”‚   â”œâ”€â”€ badge.tsx
â”‚   â”‚   â”œâ”€â”€ button.tsx
â”‚   â”‚   â”œâ”€â”€ card.tsx
â”‚   â”‚   â”œâ”€â”€ checkbox.tsx
â”‚   â”‚   â”œâ”€â”€ collapsible.tsx
â”‚   â”‚   â”œâ”€â”€ community-decay-badge.tsx
â”‚   â”‚   â”œâ”€â”€ dialog.tsx
â”‚   â”‚   â”œâ”€â”€ dropdown-menu.tsx
â”‚   â”‚   â”œâ”€â”€ geo-score-ring.tsx
â”‚   â”‚   â”œâ”€â”€ input.tsx
â”‚   â”‚   â”œâ”€â”€ label.tsx
â”‚   â”‚   â”œâ”€â”€ pixel-rank-badge/
â”‚   â”‚   â”œâ”€â”€ platform-opportunity-badges.tsx
â”‚   â”‚   â”œâ”€â”€ popover.tsx
â”‚   â”‚   â”œâ”€â”€ progress.tsx
â”‚   â”‚   â”œâ”€â”€ rtv-badge.tsx
â”‚   â”‚   â”œâ”€â”€ scroll-area.tsx
â”‚   â”‚   â”œâ”€â”€ select.tsx
â”‚   â”‚   â”œâ”€â”€ separator.tsx
â”‚   â”‚   â”œâ”€â”€ serp-visualizer/
â”‚   â”‚   â”œâ”€â”€ sheet.tsx
â”‚   â”‚   â”œâ”€â”€ sidebar.tsx
â”‚   â”‚   â”œâ”€â”€ skeleton.tsx
â”‚   â”‚   â”œâ”€â”€ slider.tsx
â”‚   â”‚   â”œâ”€â”€ switch.tsx
â”‚   â”‚   â”œâ”€â”€ table.tsx
â”‚   â”‚   â”œâ”€â”€ tabs.tsx
â”‚   â”‚   â”œâ”€â”€ textarea.tsx
â”‚   â”‚   â””â”€â”€ tooltip.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ layout/                      # Layout Components
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ app-sidebar.tsx             # Main sidebar navigation
â”‚   â”‚   â””â”€â”€ top-nav.tsx                 # Top navigation bar
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ shared/                      # Marketing Components
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ cta-section.tsx
â”‚   â”‚   â”œâ”€â”€ marketing-footer.tsx
â”‚   â”‚   â””â”€â”€ marketing-header.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ charts/                      # Chart Components
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ chart-styles.ts
â”‚   â”‚   â”œâ”€â”€ credit-ring.tsx
â”‚   â”‚   â”œâ”€â”€ kd-ring.tsx
â”‚   â”‚   â”œâ”€â”€ lazy-charts.tsx
â”‚   â”‚   â”œâ”€â”€ sparkline.tsx
â”‚   â”‚   â”œâ”€â”€ trending-sparkline.tsx
â”‚   â”‚   â””â”€â”€ velocity-chart.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ common/                      # Common UI Components
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ index.tsx
â”‚   â”‚   â”œâ”€â”€ data-table/
â”‚   â”‚   â”œâ”€â”€ demo-wrapper.tsx
â”‚   â”‚   â”œâ”€â”€ empty-state.tsx
â”‚   â”‚   â”œâ”€â”€ error-boundary.tsx
â”‚   â”‚   â”œâ”€â”€ loading-spinner.tsx
â”‚   â”‚   â”œâ”€â”€ page-header.tsx
â”‚   â”‚   â””â”€â”€ page-loading.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ forms/                       # Form Components
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ keyword-search-form.tsx
â”‚   â”‚   â”œâ”€â”€ settings-form.tsx
â”‚   â”‚   â”œâ”€â”€ settings-form-cards.tsx
â”‚   â”‚   â”œâ”€â”€ settings-form-types.ts
â”‚   â”‚   â””â”€â”€ url-analyzer-form.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ icons/                       # Icon Components
â”‚   â”‚   â””â”€â”€ platform-icons.tsx
â”‚   â”‚
â”‚   â””â”€â”€ ðŸ“‚ features/                    # Feature-specific Components
â”‚       â”œâ”€â”€ index.ts
â”‚       â”œâ”€â”€ ai-writer/
â”‚       â”œâ”€â”€ cannibalization/
â”‚       â”œâ”€â”€ citation-checker/
â”‚       â”œâ”€â”€ content-decay/
â”‚       â”œâ”€â”€ content-roadmap/
â”‚       â”œâ”€â”€ keyword-overview/
â”‚       â”œâ”€â”€ on-page-checker/
â”‚       â”œâ”€â”€ rank-tracker/
â”‚       â”œâ”€â”€ settings/
â”‚       â”œâ”€â”€ snippet-stealer/
â”‚       â”œâ”€â”€ trend-spotter/
â”‚       â””â”€â”€ video-hijack/
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ lib/                             # â•â•â• LIBRARY CODE â•â•â•
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“„ Core Utilities
â”‚   â”‚   â”œâ”€â”€ api-client.ts               # API client wrapper
â”‚   â”‚   â”œâ”€â”€ api-response.ts             # API response helpers
â”‚   â”‚   â”œâ”€â”€ clerk.ts                    # Clerk auth config
â”‚   â”‚   â”œâ”€â”€ constants.ts                # Global constants
â”‚   â”‚   â”œâ”€â”€ feature-access.ts           # Feature gating
â”‚   â”‚   â”œâ”€â”€ formatters.ts               # Data formatters
â”‚   â”‚   â”œâ”€â”€ logger.ts                   # Logging utility
â”‚   â”‚   â”œâ”€â”€ rate-limiter.ts             # Rate limiting
â”‚   â”‚   â”œâ”€â”€ seo.ts                      # SEO utilities
â”‚   â”‚   â”œâ”€â”€ Lemon Squeezy.ts                   # Lemon Squeezy config
â”‚   â”‚   â”œâ”€â”€ utils.ts                    # General utilities
â”‚   â”‚   â””â”€â”€ validators.ts               # Validation helpers
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“„ Analyzers & Calculators
â”‚   â”‚   â”œâ”€â”€ ai-overview-analyzer.ts
â”‚   â”‚   â”œâ”€â”€ cannibalization-analyzer.ts
â”‚   â”‚   â”œâ”€â”€ citation-analyzer.ts
â”‚   â”‚   â”œâ”€â”€ clustering-algorithm.ts
â”‚   â”‚   â”œâ”€â”€ commerce-opportunity-calculator.ts
â”‚   â”‚   â”œâ”€â”€ community-decay-calculator.ts
â”‚   â”‚   â”œâ”€â”€ geo-calculator.ts
â”‚   â”‚   â”œâ”€â”€ pixel-calculator.ts
â”‚   â”‚   â”œâ”€â”€ rtv-calculator.ts
â”‚   â”‚   â”œâ”€â”€ social-opportunity-calculator.ts
â”‚   â”‚   â””â”€â”€ video-opportunity-calculator.ts
â”‚   â”‚   â””â”€â”€ video-hijack-analyzer.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ supabase/                    # Supabase Client
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ client.ts                   # Browser client
â”‚   â”‚   â””â”€â”€ server.ts                   # Server client
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ google/                      # Google APIs
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ config.ts
â”‚   â”‚   â”œâ”€â”€ ga4-client.ts               # Google Analytics 4
â”‚   â”‚   â”œâ”€â”€ gsc-client.ts               # Google Search Console
â”‚   â”‚   â””â”€â”€ oauth.ts                    # OAuth handling
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ alerts/                      # Alert System
â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”œâ”€â”€ dispatcher.ts
â”‚   â”‚   â”œâ”€â”€ email-sender.ts
â”‚   â”‚   â”œâ”€â”€ slack-sender.ts
â”‚   â”‚   â””â”€â”€ webhook-sender.ts
â”‚   â”‚
â”‚   â””â”€â”€ ðŸ“‚ decay-detection/             # Decay Detection
â”‚       â”œâ”€â”€ index.ts
â”‚       â”œâ”€â”€ calculator.ts
â”‚       â””â”€â”€ trend-analyzer.ts
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ services/                        # â•â•â• BUSINESS LOGIC SERVICES â•â•â•
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ api.ts
â”‚   â”œâ”€â”€ api-client.ts
â”‚   â”œâ”€â”€ alerts.service.ts
â”‚   â”œâ”€â”€ auth.service.ts
â”‚   â”œâ”€â”€ content.service.ts
â”‚   â”œâ”€â”€ decay-detection.service.ts
â”‚   â”œâ”€â”€ ga4.service.ts
â”‚   â”œâ”€â”€ gsc.service.ts
â”‚   â”œâ”€â”€ keywords.service.ts
â”‚   â”œâ”€â”€ rank-tracker.service.ts
â”‚   â”œâ”€â”€ rankings.service.ts
â”‚   â”œâ”€â”€ social-tracker.service.ts
â”‚   â”œâ”€â”€ Lemon Squeezy.service.ts
â”‚   â”œâ”€â”€ supabase.service.ts
â”‚   â”œâ”€â”€ trends.service.ts
â”‚   â”œâ”€â”€ user.service.ts
â”‚   â”œâ”€â”€ video-hijack.service.ts
â”‚   â””â”€â”€ ðŸ“‚ dataforseo/                  # DataForSEO Integration
â”‚       â”œâ”€â”€ index.ts
â”‚       â”œâ”€â”€ client.ts
â”‚       â”œâ”€â”€ keywords.ts
â”‚       â””â”€â”€ serp.ts
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ hooks/                           # â•â•â• REACT HOOKS â•â•â•
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ use-api.ts                      # API call hook
â”‚   â”œâ”€â”€ use-auth.ts                     # Authentication hook
â”‚   â”œâ”€â”€ use-debounce.ts                 # Debounce hook
â”‚   â”œâ”€â”€ use-keywords.ts                 # Keywords data hook
â”‚   â”œâ”€â”€ use-local-storage.ts            # Local storage hook
â”‚   â”œâ”€â”€ use-mobile.ts                   # Mobile detection hook
â”‚   â””â”€â”€ use-user.ts                     # User data hook
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ contexts/                        # â•â•â• REACT CONTEXTS â•â•â•
â”‚   â”œâ”€â”€ auth-context.tsx                # Authentication context
â”‚   â””â”€â”€ user-context.tsx                # User data context
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ store/                           # â•â•â• ZUSTAND STORES â•â•â•
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ keyword-store.ts                # Keywords state
â”‚   â”œâ”€â”€ ui-store.ts                     # UI state
â”‚   â””â”€â”€ user-store.ts                   # User state
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ types/                           # â•â•â• TYPESCRIPT TYPES â•â•â•
â”‚   â”œâ”€â”€ index.ts                        # Main exports
â”‚   â”œâ”€â”€ ai-overview.types.ts
â”‚   â”œâ”€â”€ alerts.types.ts
â”‚   â”œâ”€â”€ api.ts
â”‚   â”œâ”€â”€ cannibalization.types.ts
â”‚   â”œâ”€â”€ citation.types.ts
â”‚   â”œâ”€â”€ cluster.types.ts
â”‚   â”œâ”€â”€ community-decay.types.ts
â”‚   â”œâ”€â”€ competitor.types.ts
â”‚   â”œâ”€â”€ content.types.ts
â”‚   â”œâ”€â”€ dashboard.ts
â”‚   â”œâ”€â”€ decay-detection.types.ts
â”‚   â”œâ”€â”€ ga4.types.ts
â”‚   â”œâ”€â”€ geo.types.ts
â”‚   â”œâ”€â”€ gsc.types.ts
â”‚   â”œâ”€â”€ keyword.ts
â”‚   â”œâ”€â”€ keyword.types.ts
â”‚   â”œâ”€â”€ pixel.types.ts
â”‚   â”œâ”€â”€ platform-opportunity.types.ts
â”‚   â”œâ”€â”€ project.ts
â”‚   â”œâ”€â”€ ranking.types.ts
â”‚   â”œâ”€â”€ rtv.types.ts
â”‚   â”œâ”€â”€ snippet.types.ts
â”‚   â”œâ”€â”€ trend.types.ts
â”‚   â”œâ”€â”€ user.ts
â”‚   â”œâ”€â”€ user.types.ts
â”‚   â””â”€â”€ video-hijack.types.ts
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ config/                          # â•â•â• APP CONFIGURATION â•â•â•
â”‚   â”œâ”€â”€ index.ts
â”‚   â”œâ”€â”€ constants.ts                    # App constants
â”‚   â”œâ”€â”€ env.ts                          # Environment config
â”‚   â”œâ”€â”€ routes.ts                       # Route definitions
â”‚   â”œâ”€â”€ site.ts                         # Site metadata
â”‚   â””â”€â”€ site.config.ts                  # Site configuration
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ constants/                       # â•â•â• GLOBAL CONSTANTS â•â•â•
â”‚   â”œâ”€â”€ api-endpoints.ts                # API endpoints
â”‚   â”œâ”€â”€ routes.ts                       # Route constants
â”‚   â””â”€â”€ ui.ts                           # UI constants
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ data/                            # â•â•â• MOCK DATA â•â•â•
â”‚   â”œâ”€â”€ dashboard-mock.ts
â”‚   â””â”€â”€ mock/
â”‚       â”œâ”€â”€ index.ts
â”‚       â”œâ”€â”€ content.ts
â”‚       â”œâ”€â”€ keywords.ts
â”‚       â”œâ”€â”€ rankings.ts
â”‚       â”œâ”€â”€ trends.ts
â”‚       â””â”€â”€ users.ts
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ prisma/                          # â•â•â• DATABASE SCHEMA â•â•â•
â”‚   â””â”€â”€ schema.prisma                   # Prisma schema
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ supabase/                        # â•â•â• SUPABASE CONFIG â•â•â•
â”‚   â””â”€â”€ migrations/                     # Database migrations
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ public/                          # â•â•â• STATIC ASSETS â•â•â•
â”‚   â”œâ”€â”€ favicon.svg
â”‚   â”œâ”€â”€ file.svg
â”‚   â”œâ”€â”€ globe.svg
â”‚   â”œâ”€â”€ logo.svg
â”‚   â”œâ”€â”€ manifest.json
â”‚   â”œâ”€â”€ next.svg
â”‚   â”œâ”€â”€ og-image.svg
â”‚   â”œâ”€â”€ robots.txt
â”‚   â”œâ”€â”€ vercel.svg
â”‚   â”œâ”€â”€ window.svg
â”‚   â””â”€â”€ assets/
â”‚       â””â”€â”€ icons/
â”‚           â””â”€â”€ ai-platforms/           # AI Platform SVG Icons
â”‚               â”œâ”€â”€ apple-siri.svg
â”‚               â”œâ”€â”€ chatgpt.svg
â”‚               â”œâ”€â”€ claude.svg
â”‚               â”œâ”€â”€ gemini.svg
â”‚               â”œâ”€â”€ google-aio.svg
â”‚               â”œâ”€â”€ perplexity.svg
â”‚               â””â”€â”€ searchgpt.svg
â”‚
â”‚
â”œâ”€â”€ ðŸ“‚ docs/                            # â•â•â• DOCUMENTATION â•â•â•
â”‚   â”œâ”€â”€ AI_VISIBILITY_FEATURE_SPEC.md
â”‚   â”œâ”€â”€ BACKEND_INFRASTRUCTURE_GUIDE.md
â”‚   â”œâ”€â”€ FEATURES-FIX-TODO.md
â”‚   â”œâ”€â”€ feature-analysis-summary.md
â”‚   â””â”€â”€ [Feature Analysis Files...]
â”‚
â”‚
â””â”€â”€ ðŸ“‚ .vscode/                         # â•â•â• VS CODE CONFIG â•â•â•
    â””â”€â”€ settings.json


â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ
â–ˆ                                                                                                                      â–ˆ
â–ˆ   ðŸ“Š FEATURE COUNT SUMMARY                                                                                           â–ˆ
â–ˆ   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•                                                                                           â–ˆ
â–ˆ                                                                                                                      â–ˆ
â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ SECTION               â”‚ FEATURES                                                                                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ¤– AI Insights        â”‚ AI Visibility (1)                                                                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ” Research           â”‚ Keyword Magic, Trend Spotter, Competitor Gap, Affiliate Finder,                           â”‚
â”‚                       â”‚ Video Hijack, Citation Checker, Content Calendar (7)                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ“‹ Strategy           â”‚ Topic Clusters, Content Roadmap (2)                                                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ âœï¸ Creation           â”‚ AI Writer, Snippet Stealer, On-Page Checker, Schema Generator (4)                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ“Š Tracking           â”‚ Rank Tracker, Decay Alerts, Cannibalization, News Tracker,                                â”‚
â”‚                       â”‚ Community Tracker, Social Tracker, Commerce Tracker (7)                                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ’° Monetization       â”‚ Earnings Calculator, Content ROI (2)                                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ”— Utilities          â”‚ Command Palette, Notifications, Integrations (GA4/GSC) (3)                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TOTAL                 â”‚ 27 FEATURES                                                                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜


â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ
â–ˆ                                                                                                                      â–ˆ
â–ˆ   ðŸ”§ TECH STACK                                                                                                      â–ˆ
â–ˆ   â•â•â•â•â•â•â•â•â•â•â•â•â•                                                                                                      â–ˆ
â–ˆ                                                                                                                      â–ˆ
â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ LAYER                 â”‚ TECHNOLOGY                                                                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Framework             â”‚ Next.js 14 (App Router)                                                                   â”‚
â”‚ Language              â”‚ TypeScript                                                                                â”‚
â”‚ Styling               â”‚ Tailwind CSS + shadcn/ui                                                                  â”‚
â”‚ State Management      â”‚ Zustand + React Context                                                                   â”‚
â”‚ Database              â”‚ Supabase (PostgreSQL)                                                                     â”‚
â”‚ ORM                   â”‚ Prisma                                                                                    â”‚
â”‚ Authentication        â”‚ Supabase Auth                                                                             â”‚
â”‚ Payments              â”‚ Lemon Squeezy + Lemon Squeezy                                                                    â”‚
â”‚ Charts                â”‚ Recharts                                                                                  â”‚
â”‚ Forms                 â”‚ React Hook Form + Zod                                                                     â”‚
â”‚ Icons                 â”‚ Lucide React                                                                              â”‚
â”‚ Deployment            â”‚ Vercel                                                                                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

*/

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EMPTY EXPORT - Makes this a valid TypeScript module without affecting any other code
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export {}
