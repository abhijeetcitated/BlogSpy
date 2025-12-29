# 📁 BLOGSPY-SAAS COMPLETE PROJECT STRUCTURE
> Generated: December 26, 2025 | Total: 200+ Folders | 600+ Files

```
blogspy-saas/
│
├── 📄 ROOT FILES
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.ts            # Next.js config
│   ├── tailwind.config.ts        # Tailwind CSS
│   ├── postcss.config.mjs        # PostCSS
│   ├── eslint.config.mjs         # ESLint rules
│   ├── components.json           # shadcn/ui config
│   ├── vercel.json               # Vercel deployment
│   ├── proxy.ts                  # Proxy server
│   ├── next-env.d.ts             # Next.js types
│   └── README.md                 # Documentation
│
├── 📁 .vscode/                   # VS Code settings
│
├── 📁 app/                       # NEXT.JS APP ROUTER
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── sitemap.ts                # SEO sitemap
│   │
│   ├── 📁 (auth)/                # AUTH ROUTES (Grouped)
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   │
│   ├── 📁 (marketing)/           # MARKETING PAGES
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   │
│   ├── 📁 api/                   # API ROUTES
│   │   ├── 📁 alerts/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── preferences/
│   │   │   │   └── route.ts
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   └── test/
│   │   │       └── route.ts
│   │   │
│   │   ├── 📁 auth/
│   │   │   └── route.ts
│   │   │
│   │   ├── 📁 content/
│   │   │   └── route.ts
│   │   │
│   │   ├── 📁 cron/              # CRON JOBS
│   │   │   ├── alert-digest/
│   │   │   │   └── route.ts
│   │   │   ├── decay-detection/
│   │   │   │   └── route.ts
│   │   │   ├── ga4-sync/
│   │   │   │   └── route.ts
│   │   │   └── gsc-sync/
│   │   │       └── route.ts
│   │   │
│   │   ├── 📁 decay-detection/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts
│   │   │   ├── history/
│   │   │   │   ├── route.ts
│   │   │   │   └── [url]/
│   │   │   │       └── route.ts
│   │   │   ├── scores/
│   │   │   │   └── route.ts
│   │   │   ├── summary/
│   │   │   │   └── route.ts
│   │   │   └── trends/
│   │   │       └── route.ts
│   │   │
│   │   ├── 📁 integrations/
│   │   │   ├── 📁 ga4/           # Google Analytics 4
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── connect/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── disconnect/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── properties/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── status/
│   │   │   │   │   └── route.ts
│   │   │   │   └── sync/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── 📁 gsc/           # Google Search Console
│   │   │       ├── callback/
│   │   │       │   └── route.ts
│   │   │       ├── connect/
│   │   │       │   └── route.ts
│   │   │       ├── disconnect/
│   │   │       │   └── route.ts
│   │   │       ├── properties/
│   │   │       │   └── route.ts
│   │   │       ├── status/
│   │   │       │   └── route.ts
│   │   │       └── sync/
│   │   │           └── route.ts
│   │   │
│   │   ├── 📁 keywords/
│   │   │   └── route.ts
│   │   │
│   │   ├── 📁 rankings/
│   │   │   └── route.ts
│   │   │
│   │   ├── 📁 social-tracker/
│   │   │   ├── keywords/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── refresh/
│   │   │       └── route.ts
│   │   │
│   │   ├── 📁 trends/
│   │   │   └── route.ts
│   │   │
│   │   ├── 📁 video-hijack/
│   │   │   ├── 📁 tiktok/
│   │   │   │   ├── hashtag/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── search/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── trending/
│   │   │   │   │   └── route.ts
│   │   │   │   └── video/
│   │   │   │       └── route.ts
│   │   │   └── 📁 youtube/
│   │   │       └── route.ts
│   │   │
│   │   └── 📁 webhooks/
│   │       └── route.ts
│   │
│   ├── 📁 dashboard/             # MAIN DASHBOARD
│   │   ├── page.tsx              # Dashboard home
│   │   │
│   │   ├── 📁 ai-visibility/
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 billing/
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 creation/          # CONTENT CREATION
│   │   │   ├── 📁 ai-writer/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 on-page/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 schema-generator/
│   │   │   │   └── page.tsx
│   │   │   └── 📁 snippet-stealer/
│   │   │       └── page.tsx
│   │   │
│   │   ├── 📁 monetization/
│   │   │   ├── 📁 content-roi/
│   │   │   │   └── page.tsx
│   │   │   └── 📁 earnings-calculator/
│   │   │       └── page.tsx
│   │   │
│   │   ├── 📁 navigation-demo/
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 research/          # RESEARCH TOOLS
│   │   │   ├── 📁 affiliate-finder/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 citation-checker/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 content-calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 gap-analysis/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 keyword-magic/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 overview/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [keyword]/
│   │   │   │       └── page.tsx
│   │   │   ├── 📁 trends/
│   │   │   │   └── page.tsx
│   │   │   └── 📁 video-hijack/
│   │   │       └── page.tsx
│   │   │
│   │   ├── 📁 settings/
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 strategy/          # STRATEGY TOOLS
│   │   │   ├── 📁 roadmap/
│   │   │   │   └── page.tsx
│   │   │   └── 📁 topic-clusters/
│   │   │       ├── page.tsx
│   │   │       └── results/
│   │   │           └── page.tsx
│   │   │
│   │   └── 📁 tracking/          # TRACKING TOOLS
│   │       ├── 📁 ai-visibility/
│   │       │   └── page.tsx
│   │       ├── 📁 cannibalization/
│   │       │   └── page.tsx
│   │       ├── 📁 commerce-tracker/
│   │       │   └── page.tsx
│   │       ├── 📁 community-tracker/
│   │       │   └── page.tsx
│   │       ├── 📁 decay/
│   │       │   └── page.tsx
│   │       ├── 📁 news-tracker/
│   │       │   └── page.tsx
│   │       ├── 📁 rank-tracker/
│   │       │   └── page.tsx
│   │       └── 📁 social-tracker/
│   │           └── page.tsx
│   │
│   ├── 📁 ai-writer/             # LEGACY ROUTES
│   │   ├── components/
│   │   ├── extensions/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── 📁 competitor-gap/
│   │   └── page.tsx
│   │
│   ├── 📁 content-decay/
│   │   └── page.tsx
│   │
│   ├── 📁 content-roadmap/
│   │   └── page.tsx
│   │
│   ├── 📁 keyword-magic/
│   │   └── page.tsx
│   │
│   ├── 📁 keyword-overview/
│   │   └── page.tsx
│   │
│   ├── 📁 on-page-checker/
│   │   └── page.tsx
│   │
│   ├── 📁 pricing/
│   │   └── page.tsx
│   │
│   ├── 📁 rank-tracker/
│   │   └── page.tsx
│   │
│   ├── 📁 settings/
│   │   └── page.tsx
│   │
│   ├── 📁 snippet-stealer/
│   │   └── page.tsx
│   │
│   ├── 📁 topic-clusters/
│   │   └── page.tsx
│   │
│   ├── 📁 trends/
│   │   └── page.tsx
│   │
│   └── 📁 trend-spotter/
│       └── page.tsx
│
├── 📁 assets/                    # STATIC ASSETS
│
├── 📁 components/                # SHARED COMPONENTS
│   ├── 📁 charts/
│   │   ├── index.ts
│   │   └── lazy-charts.tsx
│   │
│   ├── 📁 common/
│   │   ├── index.ts
│   │   └── 📁 data-table/
│   │       └── *.tsx
│   │
│   ├── 📁 features/              # FEATURE COMPONENTS
│   │   ├── 📁 ai-writer/
│   │   ├── 📁 cannibalization/
│   │   ├── 📁 citation-checker/
│   │   ├── 📁 content-decay/
│   │   ├── 📁 content-roadmap/
│   │   ├── 📁 keyword-overview/
│   │   ├── 📁 on-page-checker/
│   │   ├── 📁 rank-tracker/
│   │   ├── 📁 settings/
│   │   ├── 📁 snippet-stealer/
│   │   ├── 📁 trend-spotter/
│   │   └── 📁 video-hijack/
│   │
│   ├── 📁 forms/
│   │   └── *.tsx
│   │
│   ├── 📁 icons/
│   │   └── *.tsx
│   │
│   ├── 📁 layout/
│   │   ├── dashboard-layout.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   │
│   ├── 📁 shared/
│   │   └── *.tsx
│   │
│   └── 📁 ui/                    # SHADCN/UI COMPONENTS
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       ├── 📁 pixel-rank-badge/
│       │   └── *.tsx
│       └── 📁 serp-visualizer/
│           └── *.tsx
│
├── 📁 config/                    # CONFIGURATION
│   ├── constants.ts
│   ├── env.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── site.config.ts
│   └── site.ts
│
├── 📁 constants/                 # GLOBAL CONSTANTS
│   ├── api-endpoints.ts
│   ├── routes.ts
│   └── ui.ts
│
├── 📁 contexts/                  # REACT CONTEXTS
│   ├── auth-context.tsx
│   └── user-context.tsx
│
├── 📁 data/                      # DATA FILES
│   ├── dashboard-mock.ts
│   └── 📁 mock/
│       └── *.ts
│
├── 📁 docs/                      # DOCUMENTATION
│   └── *.md
│
├── 📁 hooks/                     # GLOBAL HOOKS
│   ├── index.ts
│   ├── use-api.ts
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   ├── use-keywords.ts
│   ├── use-local-storage.ts
│   ├── use-mobile.ts
│   └── use-user.ts
│
├── 📁 lib/                       # UTILITY LIBRARIES
│   ├── ai-overview-analyzer.ts
│   ├── api-client.ts
│   ├── api-response.ts
│   ├── cannibalization-analyzer.ts
│   ├── citation-analyzer.ts
│   ├── clerk.ts
│   ├── clustering-algorithm.ts
│   ├── commerce-opportunity-calculator.ts
│   ├── community-decay-calculator.ts
│   ├── constants.ts
│   ├── feature-access.ts
│   ├── formatters.ts
│   ├── geo-calculator.ts
│   ├── logger.ts
│   ├── pixel-calculator.ts
│   ├── rate-limiter.ts
│   ├── rtv-calculator.ts
│   ├── seo.ts
│   ├── social-opportunity-calculator.ts
│   ├── stripe.ts
│   ├── utils.ts
│   ├── validators.ts
│   ├── video-hijack-analyzer.ts
│   ├── video-opportunity-calculator.ts
│   │
│   ├── 📁 alerts/
│   │   └── *.ts
│   │
│   ├── 📁 decay-detection/
│   │   └── *.ts
│   │
│   ├── 📁 google/
│   │   └── *.ts
│   │
│   └── 📁 supabase/
│       └── *.ts
│
├── 📁 prisma/                    # DATABASE SCHEMA
│   └── schema.prisma
│
├── 📁 public/                    # PUBLIC ASSETS
│   ├── manifest.json
│   └── robots.txt
│
├── 📁 services/                  # GLOBAL SERVICES
│   ├── alerts.service.ts
│   ├── api-client.ts
│   ├── api.ts
│   ├── auth.service.ts
│   ├── content.service.ts
│   ├── decay-detection.service.ts
│   ├── ga4.service.ts
│   ├── gsc.service.ts
│   ├── index.ts
│   ├── keywords.service.ts
│   ├── rank-tracker.service.ts
│   ├── rankings.service.ts
│   ├── social-tracker.service.ts
│   ├── stripe.service.ts
│   ├── supabase.service.ts
│   ├── trends.service.ts
│   ├── user.service.ts
│   ├── video-hijack.service.ts
│   │
│   └── 📁 dataforseo/
│       └── *.ts
│
├── 📁 src/                       # SOURCE CODE
│   │
│   ├── 📁 features/              # 🎯 FEATURE MODULES (27)
│   │   │
│   │   ├── 📁 affiliate-finder/
│   │   │   ├── index.ts
│   │   │   ├── affiliate-finder-content.tsx
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 ai-visibility/
│   │   │   ├── index.ts
│   │   │   ├── ai-visibility-content.tsx
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 ai-writer/
│   │   │   ├── index.ts
│   │   │   ├── ai-writer-content.tsx
│   │   │   ├── ai-writer-content-refactored.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 editor/
│   │   │   │   └── 📁 panels/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 extensions/
│   │   │   ├── 📁 hooks/
│   │   │   │   └── 📁 tools/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 styles/
│   │   │   ├── 📁 types/
│   │   │   │   └── 📁 tools/
│   │   │   └── 📁 utils/
│   │   │       └── 📁 tools/
│   │   │
│   │   ├── 📁 cannibalization/
│   │   │   ├── index.ts
│   │   │   ├── cannibalization-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 citation-checker/
│   │   │   ├── index.ts
│   │   │   ├── citation-checker-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 command-palette/
│   │   │   ├── index.ts
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 data/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 commerce-tracker/
│   │   │   ├── index.ts
│   │   │   ├── commerce-tracker-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   └── 📁 types/
│   │   │
│   │   ├── 📁 community-tracker/
│   │   │   ├── index.ts
│   │   │   ├── community-tracker-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 credit-purchase/
│   │   │   │   └── 📁 keyword-card/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   └── 📁 types/
│   │   │
│   │   ├── 📁 competitor-gap/
│   │   │   ├── index.ts
│   │   │   ├── competitor-gap-page.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 competitor-gap-content/
│   │   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 hooks/
│   │   │   │   └── 📁 utils/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 forum-intel-table/
│   │   │   │   │   ├── 📁 actions/
│   │   │   │   │   ├── 📁 badges/
│   │   │   │   │   ├── 📁 constants/
│   │   │   │   │   └── 📁 displays/
│   │   │   │   └── 📁 gap-analysis-table/
│   │   │   │       ├── 📁 actions/
│   │   │   │       ├── 📁 badges/
│   │   │   │       ├── 📁 constants/
│   │   │   │       └── 📁 displays/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 content-calendar/
│   │   │   ├── index.ts
│   │   │   ├── content-calendar-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   └── 📁 types/
│   │   │
│   │   ├── 📁 content-decay/
│   │   │   ├── index.ts
│   │   │   ├── content-decay-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 content-roadmap/
│   │   │   ├── index.ts
│   │   │   ├── content-roadmap-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 content-roi/
│   │   │   ├── index.ts
│   │   │   ├── content-roi-content.tsx
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 integrations/
│   │   │   ├── index.ts
│   │   │   ├── 📁 ga4/
│   │   │   │   ├── 📁 components/
│   │   │   │   └── 📁 hooks/
│   │   │   ├── 📁 gsc/
│   │   │   │   ├── 📁 components/
│   │   │   │   └── 📁 hooks/
│   │   │   └── 📁 shared/
│   │   │       └── 📁 alert-preferences/
│   │   │
│   │   ├── 📁 keyword-magic/
│   │   │   ├── index.ts
│   │   │   ├── keyword-magic-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 keyword-magic/
│   │   │   │   └── 📁 table/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 state/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 keyword-overview/
│   │   │   ├── index.ts
│   │   │   ├── keyword-overview-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 monetization/
│   │   │   ├── index.ts
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 news-tracker/
│   │   │   ├── index.ts
│   │   │   ├── news-tracker-content.tsx
│   │   │   ├── news-tracker-content-refactored.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 config/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   └── 📁 types/
│   │   │
│   │   ├── 📁 notifications/
│   │   │   ├── index.ts
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   └── 📁 types/
│   │   │
│   │   ├── 📁 on-page-checker/
│   │   │   ├── index.ts
│   │   │   ├── on-page-checker-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 rank-tracker/
│   │   │   ├── index.ts
│   │   │   ├── rank-tracker-content.tsx
│   │   │   ├── rank-tracker-content-v2.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 modals/
│   │   │   │   └── 📁 toolbar/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 schema-generator/
│   │   │   ├── index.ts
│   │   │   ├── schema-generator-content.tsx
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │       ├── 📁 generators/
│   │   │       └── 📁 validators/
│   │   │
│   │   ├── 📁 snippet-stealer/
│   │   │   ├── index.ts
│   │   │   ├── snippet-stealer-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 social-tracker/
│   │   │   ├── index.ts
│   │   │   ├── social-tracker-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   │   └── 📁 keyword-card/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 credits/
│   │   │   │   ├── 📁 __mocks__/
│   │   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 config/
│   │   │   │   ├── 📁 hooks/
│   │   │   │   ├── 📁 services/
│   │   │   │   └── 📁 types/
│   │   │   ├── 📁 hooks/
│   │   │   └── 📁 types/
│   │   │
│   │   ├── 📁 topic-clusters/
│   │   │   ├── index.ts
│   │   │   ├── topic-cluster-content.tsx
│   │   │   ├── topic-cluster-page.tsx
│   │   │   ├── 📁 components/
│   │   │   │   └── 📁 network-graph/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   ├── 📁 trend-spotter/
│   │   │   ├── index.ts
│   │   │   ├── trend-spotter-content.tsx
│   │   │   ├── 📁 __mocks__/
│   │   │   ├── 📁 components/
│   │   │   │   └── 📁 calendar/
│   │   │   ├── 📁 constants/
│   │   │   ├── 📁 types/
│   │   │   └── 📁 utils/
│   │   │
│   │   └── 📁 video-hijack/
│   │       ├── index.ts
│   │       ├── video-hijack-content.tsx
│   │       ├── video-hijack-content-refactored.tsx
│   │       ├── 📁 __mocks__/
│   │       ├── 📁 api/
│   │       │   ├── 📁 tiktok/
│   │       │   └── 📁 youtube/
│   │       ├── 📁 components/
│   │       │   ├── 📁 shared/
│   │       │   ├── 📁 tiktok/
│   │       │   └── 📁 youtube/
│   │       ├── 📁 constants/
│   │       ├── 📁 hooks/
│   │       ├── 📁 services/
│   │       ├── 📁 types/
│   │       └── 📁 utils/
│   │
│   └── 📁 shared/                # SHARED MODULES
│       ├── 📁 ai-overview/
│       │   └── 📁 components/
│       │
│       ├── 📁 community-decay/
│       │   └── 📁 components/
│       │
│       ├── 📁 dashboard/
│       │   └── 📁 components/
│       │
│       ├── 📁 geo-score/
│       │   └── 📁 components/
│       │
│       ├── 📁 pricing/
│       │   └── *.tsx
│       │
│       ├── 📁 rtv/
│       │   └── 📁 components/
│       │
│       ├── 📁 settings/
│       │   ├── index.ts
│       │   ├── 📁 components/
│       │   ├── 📁 constants/
│       │   ├── 📁 types/
│       │   └── 📁 utils/
│       │
│       └── 📁 utils/
│           └── *.ts
│
├── 📁 store/                     # ZUSTAND STORES
│   ├── index.ts
│   ├── keyword-store.ts
│   ├── ui-store.ts
│   └── user-store.ts
│
├── 📁 supabase/                  # SUPABASE CONFIG
│   └── 📁 migrations/
│       └── *.sql
│
└── 📁 types/                     # GLOBAL TYPES
    ├── ai-overview.types.ts
    ├── alerts.types.ts
    ├── api.ts
    ├── cannibalization.types.ts
    ├── citation.types.ts
    ├── commerce.types.ts
    ├── community-decay.types.ts
    ├── competitor-gap.types.ts
    ├── content-decay.types.ts
    ├── decay-detection.types.ts
    ├── ga4.types.ts
    ├── global.d.ts
    ├── gsc.types.ts
    ├── index.ts
    ├── keyword-magic.types.ts
    ├── keyword-overview.types.ts
    ├── keyword.types.ts
    ├── news.types.ts
    ├── notifications.types.ts
    ├── on-page.types.ts
    ├── pricing.types.ts
    ├── rank-tracker.types.ts
    ├── serp.types.ts
    ├── settings.types.ts
    ├── snippet-stealer.types.ts
    ├── social-tracker.types.ts
    ├── topic-clusters.types.ts
    ├── trends.types.ts
    ├── user.types.ts
    └── video-hijack.types.ts
```

---

## 📊 STATS SUMMARY

| Category | Count |
|----------|-------|
| **Total Folders** | 200+ |
| **Feature Modules** | 27 |
| **API Routes** | 40+ |
| **UI Components** | 45+ |
| **Global Services** | 19 |
| **Type Definitions** | 30+ |
| **Total Files** | 600+ |

---

## 🎯 KEY FEATURE MODULES

| # | Feature | Description |
|---|---------|-------------|
| 1 | **affiliate-finder** | Find affiliate opportunities |
| 2 | **ai-visibility** | AI citation tracking |
| 3 | **ai-writer** | AI content generation |
| 4 | **cannibalization** | Keyword cannibalization detection |
| 5 | **citation-checker** | AI citation monitoring |
| 6 | **command-palette** | Global command palette |
| 7 | **commerce-tracker** | E-commerce keyword tracking |
| 8 | **community-tracker** | Reddit/Forum tracking |
| 9 | **competitor-gap** | Gap analysis tool |
| 10 | **content-calendar** | Editorial calendar |
| 11 | **content-decay** | Content freshness tracking |
| 12 | **content-roadmap** | Content planning Kanban |
| 13 | **content-roi** | ROI calculator |
| 14 | **integrations** | GA4/GSC integrations |
| 15 | **keyword-magic** | Advanced keyword research |
| 16 | **keyword-overview** | Keyword details page |
| 17 | **monetization** | Earnings tools |
| 18 | **news-tracker** | News keyword tracking |
| 19 | **notifications** | Notification system |
| 20 | **on-page-checker** | On-page SEO analysis |
| 21 | **rank-tracker** | SERP rank tracking |
| 22 | **schema-generator** | Schema markup generator |
| 23 | **snippet-stealer** | Featured snippet optimizer |
| 24 | **social-tracker** | Social media tracking |
| 25 | **topic-clusters** | Content clustering |
| 26 | **trend-spotter** | Trend detection |
| 27 | **video-hijack** | YouTube/TikTok research |

---

## 🔧 TECH STACK

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui
- **State:** Zustand + React Context
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Payments:** Stripe
- **APIs:** DataForSEO, YouTube, TikTok
- **Deployment:** Vercel

---

*Generated by VS Code + Claude Opus 4.5*
