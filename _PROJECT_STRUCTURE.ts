/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                                ║
 * ║   ⚠️⚠️⚠️  CRITICAL FILE - COMPLETE PROJECT STRUCTURE - DO NOT DELETE ⚠️⚠️⚠️                                   ║
 * ║                                                                                                                ║
 * ║   This file contains the COMPLETE folder and file structure of BlogSpy SaaS application.                      ║
 * ║   Use this as a reference for understanding the codebase architecture.                                        ║
 * ║                                                                                                                ║
 * ║   🔴 ANY AI MODEL OR DEVELOPER: REFER THIS BEFORE MAKING STRUCTURAL CHANGES 🔴                                ║
 * ║                                                                                                                ║
 * ║   Last Updated: December 28, 2025                                                                              ║
 * ║   Total Features: 27+                                                                                          ║
 * ║   Framework: Next.js 14 (App Router) + TypeScript + Tailwind CSS                                               ║
 * ║                                                                                                                ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// THIS FILE EXPORTS NOTHING - IT IS PURE DOCUMENTATION
// IT WILL NOT AFFECT BUILD, IMPORTS, OR ANY OTHER CODE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/*
████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
█                                                                                                                      █
█   📁 BLOGSPY-SAAS - COMPLETE PROJECT STRUCTURE                                                                       █
█   ════════════════════════════════════════════                                                                       █
█                                                                                                                      █
████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████


blogspy-saas/
│
├── 📄 ROOT CONFIG FILES
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore                      # Git ignore rules
│   ├── .npmrc                          # NPM configuration
│   ├── components.json                 # shadcn/ui configuration
│   ├── eslint.config.mjs               # ESLint configuration
│   ├── next.config.ts                  # Next.js configuration
│   ├── next-env.d.ts                   # Next.js TypeScript declarations
│   ├── package.json                    # Dependencies & scripts
│   ├── package-lock.json               # Locked dependencies
│   ├── postcss.config.mjs              # PostCSS configuration
│   ├── proxy.ts                        # Proxy server configuration
│   ├── README.md                       # Project documentation
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tsconfig.tsbuildinfo            # TypeScript build cache
│   ├── vercel.json                     # Vercel deployment config
│   └── _PROJECT_STRUCTURE.ts           # 📌 THIS FILE - Project structure
│
│
├── 📂 app/                             # ═══ NEXT.JS APP ROUTER ═══
│   │
│   ├── 📄 Root Files
│   │   ├── favicon.ico                 # App favicon
│   │   ├── globals.css                 # Global styles
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page (/)
│   │   └── sitemap.ts                  # Dynamic sitemap
│   │
│   ├── 📂 (auth)/                      # ═══ AUTHENTICATION PAGES ═══
│   │   ├── layout.tsx                  # Auth layout (centered)
│   │   ├── login/
│   │   │   └── page.tsx                # /login
│   │   ├── register/
│   │   │   └── page.tsx                # /register
│   │   ├── forgot-password/
│   │   │   └── page.tsx                # /forgot-password
│   │   └── verify-email/
│   │       └── page.tsx                # /verify-email
│   │
│   ├── 📂 (marketing)/                 # ═══ MARKETING PAGES ═══
│   │   ├── layout.tsx                  # Marketing layout (header/footer)
│   │   ├── about/
│   │   │   └── page.tsx                # /about
│   │   ├── blog/
│   │   │   └── page.tsx                # /blog
│   │   ├── contact/
│   │   │   └── page.tsx                # /contact
│   │   ├── features/
│   │   │   └── page.tsx                # /features
│   │   ├── privacy/
│   │   │   └── page.tsx                # /privacy
│   │   └── terms/
│   │       └── page.tsx                # /terms
│   │
│   ├── 📂 dashboard/                   # ═══ MAIN APP DASHBOARD ═══
│   │   ├── layout.tsx                  # Dashboard layout (sidebar)
│   │   ├── loading.tsx                 # Loading state
│   │   ├── page.tsx                    # /dashboard (overview)
│   │   │
│   │   ├── 📂 ai-visibility/           # 🤖 AI INSIGHTS
│   │   │   └── page.tsx                # /dashboard/ai-visibility
│   │   │
│   │   ├── 📂 research/                # 🔍 RESEARCH SECTION
│   │   │   ├── keyword-magic/
│   │   │   │   └── page.tsx            # /dashboard/research/keyword-magic
│   │   │   ├── trends/
│   │   │   │   └── page.tsx            # /dashboard/research/trends
│   │   │   ├── gap-analysis/
│   │   │   │   └── page.tsx            # /dashboard/research/gap-analysis
│   │   │   ├── affiliate-finder/
│   │   │   │   └── page.tsx            # /dashboard/research/affiliate-finder
│   │   │   ├── video-hijack/
│   │   │   │   └── page.tsx            # /dashboard/research/video-hijack
│   │   │   ├── citation-checker/
│   │   │   │   └── page.tsx            # /dashboard/research/citation-checker
│   │   │   ├── content-calendar/
│   │   │   │   └── page.tsx            # /dashboard/research/content-calendar
│   │   │   └── overview/
│   │   │       └── [keyword]/
│   │   │           └── page.tsx        # /dashboard/research/overview/[keyword]
│   │   │
│   │   ├── 📂 strategy/                # 📋 STRATEGY SECTION
│   │   │   ├── topic-clusters/
│   │   │   │   ├── page.tsx            # /dashboard/strategy/topic-clusters
│   │   │   │   └── results/
│   │   │   │       └── page.tsx        # /dashboard/strategy/topic-clusters/results
│   │   │   └── roadmap/
│   │   │       └── page.tsx            # /dashboard/strategy/roadmap
│   │   │
│   │   ├── 📂 creation/                # ✍️ CREATION SECTION
│   │   │   ├── ai-writer/
│   │   │   │   └── page.tsx            # /dashboard/creation/ai-writer
│   │   │   ├── snippet-stealer/
│   │   │   │   └── page.tsx            # /dashboard/creation/snippet-stealer
│   │   │   ├── on-page/
│   │   │   │   └── page.tsx            # /dashboard/creation/on-page
│   │   │   └── schema-generator/
│   │   │       └── page.tsx            # /dashboard/creation/schema-generator
│   │   │
│   │   ├── 📂 tracking/                # 📊 TRACKING SECTION
│   │   │   ├── rank-tracker/
│   │   │   │   └── page.tsx            # /dashboard/tracking/rank-tracker
│   │   │   ├── decay/
│   │   │   │   └── page.tsx            # /dashboard/tracking/decay
│   │   │   ├── cannibalization/
│   │   │   │   └── page.tsx            # /dashboard/tracking/cannibalization
│   │   │   ├── news-tracker/
│   │   │   │   └── page.tsx            # /dashboard/tracking/news-tracker
│   │   │   ├── community-tracker/
│   │   │   │   └── page.tsx            # /dashboard/tracking/community-tracker
│   │   │   ├── social-tracker/
│   │   │   │   └── page.tsx            # /dashboard/tracking/social-tracker
│   │   │   ├── commerce-tracker/
│   │   │   │   └── page.tsx            # /dashboard/tracking/commerce-tracker
│   │   │   └── ai-visibility/
│   │   │       └── page.tsx            # /dashboard/tracking/ai-visibility (alt)
│   │   │
│   │   ├── 📂 monetization/            # 💰 MONETIZATION SECTION
│   │   │   ├── earnings-calculator/
│   │   │   │   └── page.tsx            # /dashboard/monetization/earnings-calculator
│   │   │   └── content-roi/
│   │   │       └── page.tsx            # /dashboard/monetization/content-roi
│   │   │
│   │   ├── 📂 billing/
│   │   │   └── page.tsx                # /dashboard/billing
│   │   │
│   │   ├── 📂 settings/
│   │   │   └── page.tsx                # /dashboard/settings
│   │   │
│   │   └── 📂 navigation-demo/
│   │       └── page.tsx                # /dashboard/navigation-demo
│   │
│   ├── 📂 api/                         # ═══ API ROUTES ═══
│   │   ├── auth/
│   │   │   └── route.ts                # /api/auth (Supabase auth)
│   │   ├── webhooks/
│   │   │   └── route.ts                # /api/webhooks (Payment webhooks)
│   │   ├── alerts/
│   │   │   └── route.ts                # /api/alerts
│   │   ├── content/
│   │   │   └── route.ts                # /api/content
│   │   ├── cron/
│   │   │   └── route.ts                # /api/cron (Scheduled jobs)
│   │   ├── decay-detection/
│   │   │   └── route.ts                # /api/decay-detection
│   │   ├── integrations/
│   │   │   └── route.ts                # /api/integrations
│   │   ├── keywords/
│   │   │   └── route.ts                # /api/keywords
│   │   ├── rankings/
│   │   │   └── route.ts                # /api/rankings
│   │   ├── social-tracker/
│   │   │   └── route.ts                # /api/social-tracker
│   │   ├── trends/
│   │   │   └── route.ts                # /api/trends
│   │   └── video-hijack/
│   │       └── route.ts                # /api/video-hijack
│   │
│   ├── 📂 pricing/
│   │   └── page.tsx                    # /pricing
│   │
│   ├── 📂 settings/
│   │   └── page.tsx                    # /settings (public)
│   │
│   └── 📂 [Legacy Routes - To be cleaned]
│       ├── ai-writer/
│       ├── competitor-gap/
│       ├── content-decay/
│       ├── content-roadmap/
│       ├── keyword-magic/
│       ├── keyword-overview/
│       ├── on-page-checker/
│       ├── rank-tracker/
│       ├── snippet-stealer/
│       ├── topic-clusters/
│       ├── trend-spotter/
│       └── trends/
│
│
├── 📂 src/                             # ═══ SOURCE CODE (FEATURES) ═══
│   │
│   ├── 📂 features/                    # ═══ FEATURE MODULES ═══
│   │   │
│   │   ├── 📂 ai-visibility/           # 🤖 AI VISIBILITY (CORE FEATURE)
│   │   │   ├── _INTEGRATION_GUIDE.ts   # 📌 Integration documentation
│   │   │   ├── index.ts                # Barrel exports
│   │   │   ├── components/
│   │   │   │   ├── index.ts
│   │   │   │   ├── AIVisibilityDashboard.tsx
│   │   │   │   ├── CitationCard.tsx
│   │   │   │   ├── FactPricingGuard.tsx
│   │   │   │   ├── PlatformBreakdown.tsx
│   │   │   │   ├── QueryOpportunities.tsx
│   │   │   │   └── VisibilityTrendChart.tsx
│   │   │   ├── constants/
│   │   │   │   └── index.tsx           # AI platforms, icons, sample data
│   │   │   ├── types/
│   │   │   │   └── index.ts            # TypeScript types
│   │   │   └── utils/
│   │   │       └── index.ts            # Utility functions
│   │   │
│   │   ├── 📂 ai-writer/               # ✍️ AI WRITER
│   │   │   ├── index.ts
│   │   │   ├── ai-writer-content.tsx
│   │   │   ├── ai-writer-content-refactored.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── extensions/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 keyword-magic/           # 🔮 KEYWORD MAGIC
│   │   │   ├── index.ts
│   │   │   ├── keyword-magic-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── state/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 keyword-overview/        # 📊 KEYWORD OVERVIEW
│   │   │   ├── index.ts
│   │   │   ├── keyword-overview-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 rank-tracker/            # 📈 RANK TRACKER
│   │   │   ├── index.ts
│   │   │   ├── rank-tracker-content.tsx
│   │   │   ├── rank-tracker-content-v2.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 content-decay/           # 📉 CONTENT DECAY
│   │   │   ├── index.ts
│   │   │   ├── content-decay-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 competitor-gap/          # 🎯 COMPETITOR GAP
│   │   │   ├── index.ts
│   │   │   ├── competitor-gap-content.tsx
│   │   │   ├── competitor-gap-content/
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 topic-clusters/          # 🌐 TOPIC CLUSTERS
│   │   │   ├── index.ts
│   │   │   ├── topic-cluster-content.tsx
│   │   │   ├── topic-cluster-page.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── 📂 content-roadmap/         # 🗺️ CONTENT ROADMAP
│   │   │   ├── index.ts
│   │   │   ├── content-roadmap-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 snippet-stealer/         # ✂️ SNIPPET STEALER
│   │   │   ├── index.ts
│   │   │   ├── snippet-stealer-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 on-page-checker/         # ✅ ON-PAGE CHECKER
│   │   │   ├── index.ts
│   │   │   ├── on-page-checker-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 schema-generator/        # 🏗️ SCHEMA GENERATOR
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── 📂 trend-spotter/           # 🔥 TREND SPOTTER
│   │   │   ├── index.ts
│   │   │   ├── trend-spotter.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 affiliate-finder/        # 💵 AFFILIATE FINDER
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── 📂 video-hijack/            # 🎬 VIDEO HIJACK
│   │   │   ├── index.ts
│   │   │   ├── video-hijack-content.tsx
│   │   │   ├── video-hijack-content-refactored.tsx
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 citation-checker/        # 📜 CITATION CHECKER
│   │   │   ├── index.ts
│   │   │   ├── citation-checker-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 cannibalization/         # 🔄 CANNIBALIZATION
│   │   │   ├── index.ts
│   │   │   ├── cannibalization-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 content-calendar/        # 📅 CONTENT CALENDAR
│   │   │   ├── index.ts
│   │   │   ├── content-calendar.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 news-tracker/            # 📰 NEWS TRACKER
│   │   │   ├── index.ts
│   │   │   ├── news-tracker-content.tsx
│   │   │   ├── news-tracker-content-refactored.tsx
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   │   └── api-pricing.config.ts
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 community-tracker/       # 💬 COMMUNITY TRACKER
│   │   │   ├── index.ts
│   │   │   ├── community-tracker-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 social-tracker/          # 📱 SOCIAL TRACKER
│   │   │   ├── index.ts
│   │   │   ├── social-tracker-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── credits/
│   │   │   │   └── config/
│   │   │   │       └── pricing.config.ts
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 commerce-tracker/        # 🛒 COMMERCE TRACKER
│   │   │   ├── index.ts
│   │   │   ├── commerce-tracker-content.tsx
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── __mocks__/
│   │   │
│   │   ├── 📂 content-roi/             # 💹 CONTENT ROI
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── 📂 monetization/            # 💰 MONETIZATION
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── 📂 command-palette/         # ⌘ COMMAND PALETTE
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── 📂 notifications/           # 🔔 NOTIFICATIONS
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── __mocks__/
│   │   │
│   │   └── 📂 integrations/            # 🔗 INTEGRATIONS (GA4/GSC)
│   │       ├── index.ts
│   │       ├── ga4/
│   │       ├── gsc/
│   │       └── shared/
│   │
│   └── 📂 shared/                      # ═══ SHARED MODULES ═══
│       ├── 📂 ai-overview/
│       ├── 📂 community-decay/
│       ├── 📂 dashboard/
│       │   ├── index.ts
│       │   ├── CommandCenter.tsx
│       │   └── components/
│       ├── 📂 geo-score/
│       ├── 📂 pricing/
│       │   ├── index.ts
│       │   └── PricingModal.tsx
│       ├── 📂 rtv/
│       ├── 📂 settings/
│       │   ├── index.ts
│       │   ├── settings-content.tsx
│       │   ├── components/
│       │   ├── constants/
│       │   ├── types/
│       │   └── utils/
│       └── 📂 utils/
│
│
├── 📂 components/                      # ═══ SHARED UI COMPONENTS ═══
│   │
│   ├── 📂 ui/                          # shadcn/ui Components
│   │   ├── ai-overview-card.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── community-decay-badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── geo-score-ring.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pixel-rank-badge/
│   │   ├── platform-opportunity-badges.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── rtv-badge.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── serp-visualizer/
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   │
│   ├── 📂 layout/                      # Layout Components
│   │   ├── index.ts
│   │   ├── app-sidebar.tsx             # Main sidebar navigation
│   │   └── top-nav.tsx                 # Top navigation bar
│   │
│   ├── 📂 shared/                      # Marketing Components
│   │   ├── index.ts
│   │   ├── cta-section.tsx
│   │   ├── marketing-footer.tsx
│   │   └── marketing-header.tsx
│   │
│   ├── 📂 charts/                      # Chart Components
│   │   ├── index.ts
│   │   ├── chart-styles.ts
│   │   ├── credit-ring.tsx
│   │   ├── kd-ring.tsx
│   │   ├── lazy-charts.tsx
│   │   ├── sparkline.tsx
│   │   ├── trending-sparkline.tsx
│   │   └── velocity-chart.tsx
│   │
│   ├── 📂 common/                      # Common UI Components
│   │   ├── index.ts
│   │   ├── index.tsx
│   │   ├── data-table/
│   │   ├── demo-wrapper.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── page-header.tsx
│   │   └── page-loading.tsx
│   │
│   ├── 📂 forms/                       # Form Components
│   │   ├── index.ts
│   │   ├── keyword-search-form.tsx
│   │   ├── settings-form.tsx
│   │   ├── settings-form-cards.tsx
│   │   ├── settings-form-types.ts
│   │   └── url-analyzer-form.tsx
│   │
│   ├── 📂 icons/                       # Icon Components
│   │   └── platform-icons.tsx
│   │
│   └── 📂 features/                    # Feature-specific Components
│       ├── index.ts
│       ├── ai-writer/
│       ├── cannibalization/
│       ├── citation-checker/
│       ├── content-decay/
│       ├── content-roadmap/
│       ├── keyword-overview/
│       ├── on-page-checker/
│       ├── rank-tracker/
│       ├── settings/
│       ├── snippet-stealer/
│       ├── trend-spotter/
│       └── video-hijack/
│
│
├── 📂 lib/                             # ═══ LIBRARY CODE ═══
│   │
│   ├── 📄 Core Utilities
│   │   ├── api-client.ts               # API client wrapper
│   │   ├── api-response.ts             # API response helpers
│   │   ├── clerk.ts                    # Clerk auth config
│   │   ├── constants.ts                # Global constants
│   │   ├── feature-access.ts           # Feature gating
│   │   ├── formatters.ts               # Data formatters
│   │   ├── logger.ts                   # Logging utility
│   │   ├── rate-limiter.ts             # Rate limiting
│   │   ├── seo.ts                      # SEO utilities
│   │   ├── stripe.ts                   # Stripe config
│   │   ├── utils.ts                    # General utilities
│   │   └── validators.ts               # Validation helpers
│   │
│   ├── 📄 Analyzers & Calculators
│   │   ├── ai-overview-analyzer.ts
│   │   ├── cannibalization-analyzer.ts
│   │   ├── citation-analyzer.ts
│   │   ├── clustering-algorithm.ts
│   │   ├── commerce-opportunity-calculator.ts
│   │   ├── community-decay-calculator.ts
│   │   ├── geo-calculator.ts
│   │   ├── pixel-calculator.ts
│   │   ├── rtv-calculator.ts
│   │   ├── social-opportunity-calculator.ts
│   │   └── video-opportunity-calculator.ts
│   │   └── video-hijack-analyzer.ts
│   │
│   ├── 📂 supabase/                    # Supabase Client
│   │   ├── index.ts
│   │   ├── client.ts                   # Browser client
│   │   └── server.ts                   # Server client
│   │
│   ├── 📂 google/                      # Google APIs
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── ga4-client.ts               # Google Analytics 4
│   │   ├── gsc-client.ts               # Google Search Console
│   │   └── oauth.ts                    # OAuth handling
│   │
│   ├── 📂 alerts/                      # Alert System
│   │   ├── index.ts
│   │   ├── dispatcher.ts
│   │   ├── email-sender.ts
│   │   ├── slack-sender.ts
│   │   └── webhook-sender.ts
│   │
│   └── 📂 decay-detection/             # Decay Detection
│       ├── index.ts
│       ├── calculator.ts
│       └── trend-analyzer.ts
│
│
├── 📂 services/                        # ═══ BUSINESS LOGIC SERVICES ═══
│   ├── index.ts
│   ├── api.ts
│   ├── api-client.ts
│   ├── alerts.service.ts
│   ├── auth.service.ts
│   ├── content.service.ts
│   ├── decay-detection.service.ts
│   ├── ga4.service.ts
│   ├── gsc.service.ts
│   ├── keywords.service.ts
│   ├── rank-tracker.service.ts
│   ├── rankings.service.ts
│   ├── social-tracker.service.ts
│   ├── stripe.service.ts
│   ├── supabase.service.ts
│   ├── trends.service.ts
│   ├── user.service.ts
│   ├── video-hijack.service.ts
│   └── 📂 dataforseo/                  # DataForSEO Integration
│       ├── index.ts
│       ├── client.ts
│       ├── keywords.ts
│       └── serp.ts
│
│
├── 📂 hooks/                           # ═══ REACT HOOKS ═══
│   ├── index.ts
│   ├── use-api.ts                      # API call hook
│   ├── use-auth.ts                     # Authentication hook
│   ├── use-debounce.ts                 # Debounce hook
│   ├── use-keywords.ts                 # Keywords data hook
│   ├── use-local-storage.ts            # Local storage hook
│   ├── use-mobile.ts                   # Mobile detection hook
│   └── use-user.ts                     # User data hook
│
│
├── 📂 contexts/                        # ═══ REACT CONTEXTS ═══
│   ├── auth-context.tsx                # Authentication context
│   └── user-context.tsx                # User data context
│
│
├── 📂 store/                           # ═══ ZUSTAND STORES ═══
│   ├── index.ts
│   ├── keyword-store.ts                # Keywords state
│   ├── ui-store.ts                     # UI state
│   └── user-store.ts                   # User state
│
│
├── 📂 types/                           # ═══ TYPESCRIPT TYPES ═══
│   ├── index.ts                        # Main exports
│   ├── ai-overview.types.ts
│   ├── alerts.types.ts
│   ├── api.ts
│   ├── cannibalization.types.ts
│   ├── citation.types.ts
│   ├── cluster.types.ts
│   ├── community-decay.types.ts
│   ├── competitor.types.ts
│   ├── content.types.ts
│   ├── dashboard.ts
│   ├── decay-detection.types.ts
│   ├── ga4.types.ts
│   ├── geo.types.ts
│   ├── gsc.types.ts
│   ├── keyword.ts
│   ├── keyword.types.ts
│   ├── pixel.types.ts
│   ├── platform-opportunity.types.ts
│   ├── project.ts
│   ├── ranking.types.ts
│   ├── rtv.types.ts
│   ├── snippet.types.ts
│   ├── trend.types.ts
│   ├── user.ts
│   ├── user.types.ts
│   └── video-hijack.types.ts
│
│
├── 📂 config/                          # ═══ APP CONFIGURATION ═══
│   ├── index.ts
│   ├── constants.ts                    # App constants
│   ├── env.ts                          # Environment config
│   ├── routes.ts                       # Route definitions
│   ├── site.ts                         # Site metadata
│   └── site.config.ts                  # Site configuration
│
│
├── 📂 constants/                       # ═══ GLOBAL CONSTANTS ═══
│   ├── api-endpoints.ts                # API endpoints
│   ├── routes.ts                       # Route constants
│   └── ui.ts                           # UI constants
│
│
├── 📂 data/                            # ═══ MOCK DATA ═══
│   ├── dashboard-mock.ts
│   └── mock/
│       ├── index.ts
│       ├── content.ts
│       ├── keywords.ts
│       ├── rankings.ts
│       ├── trends.ts
│       └── users.ts
│
│
├── 📂 prisma/                          # ═══ DATABASE SCHEMA ═══
│   └── schema.prisma                   # Prisma schema
│
│
├── 📂 supabase/                        # ═══ SUPABASE CONFIG ═══
│   └── migrations/                     # Database migrations
│
│
├── 📂 public/                          # ═══ STATIC ASSETS ═══
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.svg
│   ├── manifest.json
│   ├── next.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── vercel.svg
│   ├── window.svg
│   └── assets/
│       └── icons/
│           └── ai-platforms/           # AI Platform SVG Icons
│               ├── apple-siri.svg
│               ├── chatgpt.svg
│               ├── claude.svg
│               ├── gemini.svg
│               ├── google-aio.svg
│               ├── perplexity.svg
│               └── searchgpt.svg
│
│
├── 📂 docs/                            # ═══ DOCUMENTATION ═══
│   ├── AI_VISIBILITY_FEATURE_SPEC.md
│   ├── BACKEND_INFRASTRUCTURE_GUIDE.md
│   ├── FEATURES-FIX-TODO.md
│   ├── feature-analysis-summary.md
│   └── [Feature Analysis Files...]
│
│
└── 📂 .vscode/                         # ═══ VS CODE CONFIG ═══
    └── settings.json


████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
█                                                                                                                      █
█   📊 FEATURE COUNT SUMMARY                                                                                           █
█   ════════════════════════                                                                                           █
█                                                                                                                      █
████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SECTION               │ FEATURES                                                                                  │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🤖 AI Insights        │ AI Visibility (1)                                                                         │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 Research           │ Keyword Magic, Trend Spotter, Competitor Gap, Affiliate Finder,                           │
│                       │ Video Hijack, Citation Checker, Content Calendar (7)                                      │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📋 Strategy           │ Topic Clusters, Content Roadmap (2)                                                       │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ ✍️ Creation           │ AI Writer, Snippet Stealer, On-Page Checker, Schema Generator (4)                         │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 Tracking           │ Rank Tracker, Decay Alerts, Cannibalization, News Tracker,                                │
│                       │ Community Tracker, Social Tracker, Commerce Tracker (7)                                   │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ 💰 Monetization       │ Earnings Calculator, Content ROI (2)                                                      │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔗 Utilities          │ Command Palette, Notifications, Integrations (GA4/GSC) (3)                                │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ TOTAL                 │ 27 FEATURES                                                                               │
└───────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────┘


████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
█                                                                                                                      █
█   🔧 TECH STACK                                                                                                      █
█   ═════════════                                                                                                      █
█                                                                                                                      █
████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LAYER                 │ TECHNOLOGY                                                                                │
├───────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
│ Framework             │ Next.js 14 (App Router)                                                                   │
│ Language              │ TypeScript                                                                                │
│ Styling               │ Tailwind CSS + shadcn/ui                                                                  │
│ State Management      │ Zustand + React Context                                                                   │
│ Database              │ Supabase (PostgreSQL)                                                                     │
│ ORM                   │ Prisma                                                                                    │
│ Authentication        │ Supabase Auth                                                                             │
│ Payments              │ Stripe + Lemon Squeezy                                                                    │
│ Charts                │ Recharts                                                                                  │
│ Forms                 │ React Hook Form + Zod                                                                     │
│ Icons                 │ Lucide React                                                                              │
│ Deployment            │ Vercel                                                                                    │
└───────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────┘

*/

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// EMPTY EXPORT - Makes this a valid TypeScript module without affecting any other code
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export {}
