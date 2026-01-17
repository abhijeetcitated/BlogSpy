# BlogSpy — Complete Product & Codebase Report (No-Change)

**Date**: 2026-01-13  
**Workspace**: `e:\startup\blogspy-saas`  
**Scope**: Read-only analysis. No UI/UX or code changes performed.

---

## 1) Executive Summary

BlogSpy is a modern SEO SaaS built on **Next.js App Router** with **TypeScript**, **Tailwind**, **Prisma (Postgres/Supabase)**, **TanStack Query**, and **Zustand**. The product centers around keyword research, SERP intelligence, rank tracking, content optimization, and AI-assisted workflows. The UX pattern is a **dashboard shell** with a sidebar + top nav, and feature pages implemented as App Router routes.

Key strengths:
- Broad feature coverage (research → creation → tracking → strategy → monetization)
- Clear route organization with dashboard subsections
- Prisma schema supports core SaaS entities (User, Project, Keyword cache, Rankings, Content, Subscriptions)

---

## 2) Tech Stack & Major Dependencies

From `package.json`:
- Framework: `next` (Next.js) + React
- Language: TypeScript (strict implied by repo guidance)
- Styling: Tailwind
- UI: Radix + shadcn/ui components under `components/ui/`
- Server state: `@tanstack/react-query`
- Client state: `zustand`
- DB/ORM: `prisma`, `@prisma/client`
- Auth: (project guideline says Clerk; DB schema includes `clerkId`)
- Analytics/toasts: `@vercel/analytics`, `sonner`
- Validation: `zod`
- HTTP: `axios`
- Rate limiting: Upstash (`@upstash/ratelimit`, `@upstash/redis`)
- Security middleware: Arcjet (`@arcjet/next`)

Build script:
- `npm run build` runs `npx prisma generate && next build`

---

## 3) Application Shell, Layout, and Global Providers

From `app/layout.tsx`:
- Global fonts: Geist Sans + Geist Mono
- Providers wrapped at root:
  - `QueryProvider` (TanStack Query)
  - `AuthProvider`
  - `UserProvider`
- Global Toaster: Sonner (`theme="dark"`, `position="top-right"`)
- Vercel Analytics enabled

Metadata:
- SEO metadata configured (OpenGraph/Twitter/manifest/icons)
- `metadataBase` derived from `NEXT_PUBLIC_APP_URL`

Implication:
- The app expects consistent provider setup for auth/user state and query caching across routes.

---

## 4) Route Map (High-Level)

Source: `BLOGSPY_COMPLETE_TREE_WITH_PURPOSE.md` (app routes only; docs excluded)

### 4.1 Marketing & Auth
- `(marketing)/about`, `(marketing)/blog`, `(marketing)/contact`, `(marketing)/features`, `(marketing)/privacy`, `(marketing)/terms`
- `(auth)/login`, `(auth)/register`, `(auth)/forgot-password`, `(auth)/verify-email`
- `auth/callback/route.ts`

### 4.2 Top-Level Feature Entry Routes
(appear as standalone routes under `app/`)
- `ai-writer/`
- `competitor-gap/`
- `content-decay/`
- `content-roadmap/`
- `keyword-magic/`
- `keyword-overview/`
- `on-page-checker/`
- `pricing/`
- `rank-tracker/`
- `settings/`
- `snippet-stealer/`
- `topic-clusters/`
- `trend-spotter/`
- `trends/`

### 4.3 Dashboard (Protected Area)
`app/page.tsx` currently renders a dashboard shell:
- Sidebar + top nav + `CommandCenter`

Dashboard subtree under `app/dashboard/` includes:
- `dashboard/research/*` (affiliate-finder, citation-checker, content-calendar, gap-analysis, keyword-magic, overview/[keyword], trends, video-hijack)
- `dashboard/creation/*` (ai-writer, on-page, schema-generator, snippet-stealer)
- `dashboard/tracking/*` (rank-tracker, decay, ai-visibility, cannibalization, commerce-tracker, community-tracker, news-tracker, social-tracker)
- `dashboard/strategy/*` (roadmap, topic-clusters + results)
- `dashboard/monetization/*` (content-roi, earnings-calculator)
- `dashboard/billing/`
- `dashboard/settings/`

Note:
- There is both top-level feature routing and dashboard-namespaced routing for many features.

---

## 5) Feature Inventory (Product Level)

From `BLOGSPY_FEATURES_ANALYSIS.md` (code-audit based):

### Domain 1 — Research Tools
- Keyword Magic (primary)
- Competitor Gap Analysis
- Video Hijack
- Citation Checker (AI Overviews / SGE citation visibility)
- Trend Spotter
- Affiliate Finder
- Content Calendar
- Schema Generator
- Keyword Overview
- On-Page Checker

### Domain 2 — Content Creation
- AI Writer
- Snippet Stealer

(Additional domains exist in the report file; not fully included in the excerpt viewed, but the dashboard tree indicates further features such as cannibalization, trackers, monetization tools.)

---

## 6) Data Model (Prisma / Postgres)

From `prisma/schema.prisma` (observed portion):

### Core SaaS entities
- `User`
  - `clerkId` (unique), email identity, optional name/avatar
  - plan + credits
  - relations: `projects`, `content`, `searches`, `subscriptions`
- `Subscription`
  - Stripe identifiers, status, plan, period end
- `Project`
  - per-user domain-based project container
  - relations: `rankings`, `content`, `competitors`

### Keyword + Tracking
- `Keyword` (global cache)
  - unique by `(text, country)`
  - stores metrics (volume, difficulty, CPC, intent)
  - stores `trendData` and `serpData` as JSON
- `Ranking`
  - join of `Project` and `Keyword` with position history

### Content
- `Content`
  - per-user URL-based unique constraint
  - status + decay risk + cached analysis JSON

### Competitor
- `Competitor` model exists (partial excerpt), indicating competitor metrics caching.

Implication:
- Keywords are cached globally; projects and content are per-user.
- Credit-based operations likely map to keyword refresh / SERP refresh.

---

## 7) UI Component Architecture (Observed)

From `BLOGSPY_COMPLETE_TREE_WITH_PURPOSE.md`:

- `components/ui/`: shadcn/radix UI primitives and custom UI widgets (e.g., SERP visualizer, pixel rank badge, rings, dialogs, etc.)
- `components/layout/`: `app-sidebar.tsx`, `top-nav.tsx`
- `components/common/`: data table system, empty/error/loading wrappers
- `components/charts/`: sparkline, velocity chart, rings
- `components/features/`: domain feature component entry points

Dashboard entry (`app/page.tsx`) uses:
- `AppSidebar`, `TopNav`
- `CommandCenter`
- `SidebarProvider` / `SidebarInset`
- `CommandPaletteProvider`

---

## 8) Configuration & Feature Flags

From `config/site.config.ts`:
- App identity: `name`, `description`, `url`
- Branding primitives: logo, favicon, primary/accent colors
- Contact: email, twitter
- Feature toggles (booleans): aiWriter, rankTracker, keywordMagic, contentDecay, topicClusters, snippetStealer, trendSpotter, competitorGap
- Plan limits (free/pro/agency)

Implication:
- Feature availability can be toggled in config.
- Plans/limits are defined centrally (business logic enforcement depends on usage in code).

---

## 9) Operational Workflows (Inferred)

### Auth/User Context
- Root providers suggest a pattern:
  1) Auth context identifies current user
  2) User provider loads profile/plan/credits
  3) React Query caches API calls

### Keyword research workflow (typical)
- Seed keyword → fetch DataForSEO metrics → show table + filters → SERP insights + trend sparkline → save/export to other modules.

### Credit-gated actions
- `User.credits` suggests credit decrement for costly operations (e.g., live SERP refresh).

---

## 10) Risks / Watchpoints (No changes, just audit notes)

- **Dual routing** for features (top-level vs `dashboard/*`) can lead to:
  - duplicated UI logic
  - inconsistent protection/auth gating
  - inconsistent analytics/events
- Prisma schema uses JSON fields (`serpData`, `trendData`, `analysis`) which are flexible but:
  - require strong runtime validation
  - can accumulate shape drift over time
- Build depends on Prisma generate; missing DB env vars can break local build if Prisma client generation or schema validation requires env.

---

## 11) What’s Next (Optional Additions)

If you want, I can extend this report (still no code/UI changes) with:
- Complete API routes inventory under `app/api/*` (endpoints + payload contracts)
- Detailed dashboard navigation map (sidebar items → route mapping)
- Services layer review (`services/*`) including DataForSEO integration summary
- Security posture checklist (Arcjet, rate limiting, auth protection verification)
- DX checklist (lint/type-check scripts, conventions, folder-by-feature)

---

## Appendix A — Evidence / Sources Consulted

- `README.md`
- `BLOGSPY_FEATURES_ANALYSIS.md`
- `BLOGSPY_COMPLETE_TREE_WITH_PURPOSE.md`
- `app/layout.tsx`
- `app/page.tsx`
- `package.json`
- `prisma/schema.prisma`
- `config/site.config.ts`
