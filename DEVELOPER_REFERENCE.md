# 🔧 BlogSpy Developer Reference Guide

> Quick reference for developers working on BlogSpy codebase

---

## 📁 Project Structure

```
blogspy-saas/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (marketing)/              # Public pages
│   ├── api/                      # API Routes
│   │   ├── keywords/route.ts     # Keyword analysis endpoint
│   │   ├── rankings/route.ts     # Rank tracking endpoint
│   │   ├── content/route.ts      # Content analysis endpoint
│   │   ├── trends/route.ts       # Trend analysis endpoint
│   │   ├── auth/route.ts         # Authentication endpoint
│   │   └── webhooks/route.ts     # Stripe webhooks
│   │
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── page.tsx              # Main dashboard (CommandCenter)
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │
│   │   ├── research/             # Research tools
│   │   │   ├── keyword-magic/
│   │   │   ├── overview/[keyword]/
│   │   │   ├── gap-analysis/
│   │   │   ├── trends/
│   │   │   ├── affiliate-finder/      ⭐ NEW
│   │   │   ├── video-hijack/          ⭐ UNIQUE
│   │   │   └── citation-checker/      ⭐ REVOLUTIONARY
│   │   │
│   │   ├── creation/             # Creation tools
│   │   │   ├── ai-writer/
│   │   │   ├── snippet-stealer/
│   │   │   ├── on-page/
│   │   │   └── schema-generator/      ⭐ NEW
│   │   │
│   │   ├── strategy/             # Strategy tools
│   │   │   ├── topic-clusters/
│   │   │   └── roadmap/
│   │   │
│   │   ├── tracking/             # Tracking tools
│   │   │   ├── rank-tracker/
│   │   │   ├── decay/
│   │   │   ├── cannibalization/       ⭐ UNIQUE
│   │   │   ├── news-tracker/          ⭐ NEW
│   │   │   ├── community-tracker/     ⭐ REVOLUTIONARY
│   │   │   ├── social-tracker/        ⭐ NEW
│   │   │   ├── commerce-tracker/      ⭐ UNIQUE
│   │   │   └── ai-visibility/         ⭐ FIRST-MOVER
│   │   │
│   │   ├── monetization/         # Monetization tools
│   │   │   ├── earnings-calculator/   ⭐ UNIQUE
│   │   │   └── content-roi/           ⭐ UNIQUE
│   │   │
│   │   ├── ai-visibility/        # AI insights
│   │   │   └── page.tsx               ⭐ FIRST-MOVER
│   │   │
│   │   ├── settings/             # Settings
│   │   └── billing/              # Billing
│   │
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── charts/                   # Chart components
│   │   ├── credit-ring.tsx
│   │   ├── kd-ring.tsx
│   │   ├── sparkline.tsx
│   │   ├── trending-sparkline.tsx
│   │   └── velocity-chart.tsx
│   │
│   ├── common/                   # Shared components
│   │   ├── data-table/           # Reusable table
│   │   └── navigation-examples.tsx
│   │
│   ├── features/                 # Feature-specific components
│   │   ├── ai-writer/
│   │   ├── cannibalization/      ⭐
│   │   ├── citation-checker/     ⭐
│   │   ├── content-decay/
│   │   ├── content-roadmap/
│   │   ├── keyword-overview/
│   │   ├── on-page-checker/
│   │   ├── rank-tracker/
│   │   ├── settings/
│   │   ├── snippet-stealer/
│   │   ├── trend-spotter/
│   │   └── video-hijack/         ⭐
│   │
│   ├── forms/                    # Form components
│   │   ├── settings-form.tsx
│   │   ├── settings-form-cards.tsx
│   │   └── settings-form-types.ts
│   │
│   ├── icons/                    # Custom icons
│   │
│   ├── layout/                   # Layout components
│   │   ├── app-sidebar.tsx       # Main navigation sidebar
│   │   └── top-nav.tsx           # Top navigation bar
│   │
│   ├── shared/                   # Shared UI modules
│   │   ├── ai-overview/          # AI Overview shared components
│   │   ├── community-decay/      # Community Decay shared components
│   │   ├── geo-score/            # GEO Score shared components
│   │   ├── pricing/              # Pricing shared components
│   │   └── rtv/                  # RTV shared components
│   │
│   └── ui/                       # Base UI components (shadcn)
│       ├── ai-overview-card.tsx         ⭐
│       ├── community-decay-badge.tsx    ⭐
│       ├── geo-score-ring.tsx           ⭐
│       ├── pixel-rank-badge/            ⭐
│       ├── platform-opportunity-badges.tsx ⭐
│       ├── rtv-badge.tsx                ⭐
│       ├── serp-visualizer/             ⭐
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── lib/                          # Core libraries & utilities
│   ├── ai-overview-analyzer.ts          ⭐ AI Overview analysis
│   ├── cannibalization-analyzer.ts      ⭐ Cannibalization detection
│   ├── citation-analyzer.ts             ⭐ Citation tracking
│   ├── commerce-opportunity-calculator.ts ⭐ Commerce scoring
│   ├── community-decay-calculator.ts    ⭐ Community decay
│   ├── geo-calculator.ts                ⭐ GEO score calculation
│   ├── pixel-calculator.ts              ⭐ Pixel rank calculation
│   ├── rtv-calculator.ts                ⭐ RTV calculation
│   ├── social-opportunity-calculator.ts ⭐ Social scoring
│   ├── video-hijack-analyzer.ts         ⭐ Video hijack analysis
│   ├── video-opportunity-calculator.ts  ⭐ Video opportunity
│   ├── api-client.ts             # API client wrapper
│   ├── api-response.ts           # API response types
│   ├── clerk.ts                  # Clerk auth config
│   ├── constants.ts              # App constants
│   ├── formatters.ts             # Data formatters
│   ├── logger.ts                 # Logging utility
│   ├── rate-limiter.ts           # Rate limiting
│   ├── seo.ts                    # SEO utilities
│   ├── stripe.ts                 # Stripe integration
│   ├── utils.ts                  # General utilities
│   ├── validators.ts             # Zod validators
│   └── supabase/                 # Supabase client
│       ├── client.ts             # Browser client
│       ├── server.ts             # Server client
│       └── index.ts
│
├── types/                        # TypeScript types
│   ├── ai-overview.types.ts             ⭐
│   ├── cannibalization.types.ts         ⭐
│   ├── citation.types.ts                ⭐
│   ├── community-decay.types.ts         ⭐
│   ├── geo.types.ts                     ⭐
│   ├── pixel.types.ts                   ⭐
│   ├── platform-opportunity.types.ts    ⭐
│   ├── rtv.types.ts                     ⭐
│   ├── video-hijack.types.ts            ⭐
│   ├── api.ts                    # API types
│   ├── cluster.types.ts          # Topic cluster types
│   ├── competitor.types.ts       # Competitor types
│   ├── content.types.ts          # Content types
│   ├── dashboard.ts              # Dashboard types
│   ├── index.ts                  # Barrel export
│   ├── keyword.ts                # Legacy keyword types
│   ├── keyword.types.ts          # Keyword types
│   ├── project.ts                # Project types
│   ├── ranking.types.ts          # Ranking types
│   ├── snippet.types.ts          # Snippet types
│   ├── trend.types.ts            # Trend types
│   ├── user.ts                   # Legacy user types
│   └── user.types.ts             # User types
│
├── hooks/                        # React hooks
│   ├── use-api.ts                # API hook
│   ├── use-auth.ts               # Auth hook
│   ├── use-debounce.ts           # Debounce hook
│   ├── use-keywords.ts           # Keywords hook
│   ├── use-local-storage.ts      # Local storage hook
│   ├── use-mobile.ts             # Mobile detection hook
│   └── use-user.ts               # User hook
│
├── store/                        # Zustand stores
│   ├── keyword-store.ts          # Keyword state
│   ├── ui-store.ts               # UI state
│   └── user-store.ts             # User state
│
├── contexts/                     # React contexts
│   ├── auth-context.tsx          # Auth context
│   └── user-context.tsx          # User context
│
├── config/                       # Configuration
│   ├── constants.ts              # App constants
│   ├── env.ts                    # Environment variables
│   ├── routes.ts                 # Route definitions
│   └── site.config.ts            # Site configuration
│
├── constants/                    # Constants
│   ├── api-endpoints.ts          # DataForSEO endpoints
│   ├── routes.ts                 # App routes
│   └── ui.ts                     # UI constants
│
├── prisma/                       # Database
│   └── schema.prisma             # Prisma schema
│
├── services/                     # Services
│   └── video-hijack.service.ts   ⭐
│
├── data/                         # Mock data
│   ├── dashboard-mock.ts
│   └── mock/
│       ├── content.ts
│       ├── keywords.ts
│       ├── rankings.ts
│       ├── trends.ts
│       └── users.ts
│
├── public/                       # Static assets
│   ├── favicon.svg
│   ├── logo.svg
│   └── og-image.svg
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── tailwind.config.js            # Tailwind config
└── components.json               # shadcn config
```

⭐ = Unique/Revolutionary feature

---

## 🗺️ Feature → File Mapping

### 1. AI Overview Citation Tracking

**Pages:**
- `/dashboard/research/citation-checker` → `app/dashboard/research/citation-checker/page.tsx`
- `/dashboard/tracking/ai-visibility` → `app/dashboard/tracking/ai-visibility/page.tsx`
- `/dashboard/ai-visibility` → `app/dashboard/ai-visibility/page.tsx`

**Core Logic:**
- `lib/ai-overview-analyzer.ts` - Main analysis engine
- `lib/citation-analyzer.ts` - Citation tracking

**Types:**
- `types/ai-overview.types.ts`
- `types/citation.types.ts`

**Components:**
- `components/features/citation-checker/`
- `components/ui/ai-overview-card.tsx`
- `components/shared/ai-overview/`

**Key Functions:**
```typescript
// lib/ai-overview-analyzer.ts
analyzeAIOverview(keyword, citations, entities)
generateRecommendations(citations, entities)
detectAIOverview(serpData)

// lib/citation-analyzer.ts
generateCitationAnalysis(domain)
filterCitations(citations, filters)
calculateCitationValue(citation)
```

---

### 2. Community Decay Detection

**Pages:**
- `/dashboard/tracking/community-tracker` → `app/dashboard/tracking/community-tracker/page.tsx`

**Core Logic:**
- `lib/community-decay-calculator.ts` - Decay calculation

**Types:**
- `types/community-decay.types.ts`

**Components:**
- `components/ui/community-decay-badge.tsx`
- `components/shared/community-decay/`

**Key Functions:**
```typescript
// lib/community-decay-calculator.ts
analyzeCommunityDecay(keyword, sources)
calculateDecayScore(sources)
generateRecommendations(keyword, sources)
getDecayStatusSummary(analysis)
```

**Algorithm:**
```typescript
Decay Score = Weighted Average of:
  - Age (0-30 days = 0, 365+ = 100)
  - Quality Score (upvotes, comments)
  - Position Weight (rank #1 = 10x, rank #10 = 1x)
  - Outdated Flags (+10)
  - Controversy (+5)
```

---

### 3. Video Hijack Analysis

**Pages:**
- `/dashboard/research/video-hijack` → `app/dashboard/research/video-hijack/page.tsx`

**Core Logic:**
- `lib/video-hijack-analyzer.ts` - Main analyzer
- `lib/video-opportunity-calculator.ts` - Opportunity scoring

**Types:**
- `types/video-hijack.types.ts`

**Components:**
- `components/features/video-hijack/`

**Services:**
- `services/video-hijack.service.ts`

**Key Functions:**
```typescript
// lib/video-hijack-analyzer.ts
generateVideoHijackAnalysis()
getVideoRecommendations(keyword)
calculateVideoROI(keyword)
filterVideoKeywords(keywords, filters)
```

**Algorithm:**
```typescript
Hijack Score = Position Weight × Carousel Size × Above Fold Bonus

Position Weights:
  1-2: 40 points
  3-4: 30 points
  5-7: 20 points
  8-10: 10 points

Carousel Multiplier:
  1-3 videos: 1.0x
  4-6 videos: 1.3x
  7-10 videos: 1.5x

Above Fold: +20 bonus
```

---

### 4. Cannibalization Detection

**Pages:**
- `/dashboard/tracking/cannibalization` → `app/dashboard/tracking/cannibalization/page.tsx`

**Core Logic:**
- `lib/cannibalization-analyzer.ts` - Detection & fixing

**Types:**
- `types/cannibalization.types.ts`

**Components:**
- `components/features/cannibalization/`

**Key Functions:**
```typescript
// lib/cannibalization-analyzer.ts
analyzeCannibalization(domain, pages)
detectCannibalization(pages)
calculateOverlapScore(pages)
recommendAction(pages, severity)
generateFixSuggestion(issue)
```

**Algorithm:**
```typescript
Overlap Score = 
  (Keyword Match × 0.5) +
  (Title Overlap × 0.3) +
  (Rank Proximity × 0.2)

Severity:
  90-100: Critical (immediate action)
  70-89: High (address soon)
  50-69: Medium (monitor)
  30-49: Low (optional)

Recommended Actions:
  - MERGE: Both pages have traffic
  - REDIRECT: Secondary has <20% traffic
  - DIFFERENTIATE: Different intent possible
  - CANONICAL: Technical duplicate
  - NOINDEX: Remove from index
  - REOPTIMIZE: Target different keyword
```

---

### 5. Commerce Opportunity Calculator

**Pages:**
- `/dashboard/tracking/commerce-tracker` → `app/dashboard/tracking/commerce-tracker/page.tsx`

**Core Logic:**
- `lib/commerce-opportunity-calculator.ts`

**Types:**
- `types/platform-opportunity.types.ts`

**Key Functions:**
```typescript
// lib/commerce-opportunity-calculator.ts
calculateCommerceOpportunity(keywordId, keyword, intent)
isCommerceFriendlyKeyword(keyword, intent)
```

**Algorithm:**
```typescript
Commerce Score:
  Base = Random(35-90) for commerce keywords
  
  Bonuses:
  - "best" pattern: +10
  - "cheap/budget" pattern: +15
  - "review" pattern: +5
  
  Opportunity Levels:
  - 80-100: Very High
  - 60-79: High
  - 40-59: Medium
  - 20-39: Low
  - 0-19: None
```

---

### 6. Pixel Rank, RTV, GEO Score

**Core Logic:**
- `lib/pixel-calculator.ts` - Pixel position calculation
- `lib/rtv-calculator.ts` - Realizable Traffic Volume
- `lib/geo-calculator.ts` - Geographic score

**Types:**
- `types/pixel.types.ts`
- `types/rtv.types.ts`
- `types/geo.types.ts`

**Components:**
- `components/ui/pixel-rank-badge/`
- `components/ui/geo-score-ring.tsx`
- `components/ui/rtv-badge.tsx`

**Key Functions:**
```typescript
// lib/pixel-calculator.ts
calculatePixelPosition(rank, serpFeatures)

// lib/rtv-calculator.ts
calculateRTV(volume, rank, serpFeatures)

// lib/geo-calculator.ts
calculateGeoScore(rankings)
```

**Algorithms:**
```typescript
// Pixel Position
Pixel = Base Position + SERP Feature Offsets
  - Ads: +100px each
  - Featured Snippet: +300px
  - PAA: +200px
  - Video Carousel: +250px
  - Local Pack: +400px
  - AI Overview: +600px

// RTV (Realizable Traffic Volume)
RTV = Volume × CTR × (1 - SERP Feature Penalty)

CTR by Position:
  #1: 28.5%
  #2: 15.7%
  #3: 11.0%
  #4-10: declining

SERP Feature Penalties:
  - AI Overview: -25%
  - Featured Snippet: -15%
  - Video Carousel: -12%
  - PAA: -8%

// GEO Score
GEO = (100 - Ranking Variance) × Location Coverage

Best Rank: 3
Worst Rank: 15
Variance: 12
Score = 100 - 12 = 88/100
```

---

## 🔌 API Endpoints

### Internal API Routes

```typescript
// GET /api/keywords?q=search&page=1&limit=10
// Get keywords list with pagination
Response: {
  success: true,
  data: Keyword[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}

// POST /api/keywords
// Analyze a keyword
Body: {
  keyword: string,
  location?: string,
  language?: string
}
Response: {
  success: true,
  data: {
    keyword: string,
    metrics: { volume, difficulty, cpc, competition },
    trends: { monthly: number[], change: number },
    relatedKeywords: Keyword[],
    questions: string[],
    serpFeatures: string[],
    intent: string
  }
}

// GET /api/rankings?projectId=xxx
// Get ranking history
Response: {
  success: true,
  data: Ranking[]
}

// POST /api/content
// Analyze content
Body: {
  url: string,
  keywords?: string[]
}

// GET /api/trends
// Get trending keywords

// POST /api/webhooks
// Stripe webhook handler
```

### DataForSEO API Endpoints

```typescript
// Base URL: https://api.dataforseo.com/v3

// SERP Data
POST /serp/google/organic/live/advanced
Body: {
  keyword: string,
  location_code: number,
  language_code: string,
  depth: number
}

// Keywords Data
POST /keywords_data/google/search_volume/live
Body: {
  keywords: string[],
  location_code: number,
  language_code: string
}

// Keyword Suggestions
POST /keywords_data/google/keyword_suggestions/live
Body: {
  keyword: string,
  location_code: number
}

// Backlinks
POST /backlinks/backlinks/live
Body: {
  target: string,
  limit: number
}

// On-Page Analysis
POST /on_page/task_post
Body: {
  target: string,
  max_crawl_pages: number
}

// Content Analysis
POST /content_analysis/search/live
Body: {
  keyword: string,
  search_mode: "as_is" | "as_word_combinations"
}
```

---

## 📦 Database Schema Quick Reference

### User
```prisma
model User {
  id         String   @id @default(cuid())
  clerkId    String   @unique
  email      String   @unique
  name       String?
  plan       Plan     @default(FREE)
  credits    Int      @default(50)
}

enum Plan { FREE, PRO, ENTERPRISE }
```

### Keyword
```prisma
model Keyword {
  id           String   @id
  keyword      String
  volume       Int?
  difficulty   Int?
  cpc          Float?
  intent       String?
  serpFeatures Json?
  monthlyData  Json?
}
```

### Ranking
```prisma
model Ranking {
  id               String   @id
  keywordId        String
  position         Int
  previousPosition Int?
  change           Int
  traffic          Int?
  checkedAt        DateTime
}
```

### Content
```prisma
model Content {
  id              String        @id
  url             String
  traffic         Int?
  previousTraffic Int?
  decayRisk       DecayRisk
  analysis        Json?
}

enum DecayRisk { NONE, LOW, MEDIUM, HIGH, CRITICAL }
```

---

## 🎨 UI Components Guide

### Custom Badge Components

```tsx
// AI Overview Card
import { AIOverviewCard } from "@/components/ui/ai-overview-card"

<AIOverviewCard
  keyword="seo tools"
  citationStatus="cited"
  citationPosition={2}
  opportunityScore={75}
/>

// Community Decay Badge
import { CommunityDecayBadge } from "@/components/ui/community-decay-badge"

<CommunityDecayBadge
  platform="reddit"
  decayScore={87}
  ageInDays={400}
/>

// Pixel Rank Badge
import { PixelRankBadge } from "@/components/ui/pixel-rank-badge"

<PixelRankBadge
  rank={3}
  pixelPosition={1400}
  aboveFold={false}
/>

// GEO Score Ring
import { GEOScoreRing } from "@/components/ui/geo-score-ring"

<GEOScoreRing
  score={72}
  size="md"
/>

// RTV Badge
import { RTVBadge } from "@/components/ui/rtv-badge"

<RTVBadge
  volume={10000}
  rtv={980}
  position={3}
/>
```

### SERP Visualizer

```tsx
import { SERPVisualizer } from "@/components/ui/serp-visualizer"

<SERPVisualizer
  keyword="seo tools"
  serpFeatures={[
    { type: "ads", position: 1 },
    { type: "ai_overview", position: 2 },
    { type: "organic", position: 3, yourRank: true }
  ]}
/>
```

---

## 🧪 Testing Quick Start

### Run Development Server
```bash
npm run dev
# Opens http://localhost:3000
```

### Test Specific Feature

```bash
# Keyword Magic
http://localhost:3000/dashboard/research/keyword-magic

# Video Hijack
http://localhost:3000/dashboard/research/video-hijack

# Cannibalization
http://localhost:3000/dashboard/tracking/cannibalization

# AI Visibility
http://localhost:3000/dashboard/ai-visibility
```

### Mock Data
All analyzers have mock data generators:

```typescript
// lib/video-hijack-analyzer.ts
generateVideoHijackAnalysis()

// lib/community-decay-calculator.ts
generateMockCommunityDecay()

// lib/cannibalization-analyzer.ts
generateMockCannibalizationAnalysis()

// lib/ai-overview-analyzer.ts
generateMockAIOverviewAnalysis()
```

---

## 🔑 Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# DataForSEO API
DATAFORSEO_LOGIN="your_login"
DATAFORSEO_PASSWORD="your_password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📝 Code Style Guidelines

### TypeScript Types
```typescript
// Always define proper types
type KeywordAnalysis = {
  keyword: string
  metrics: KeywordMetrics
  trends: TrendData
}

// Use enums for fixed values
enum DecayLevel {
  FRESH = "fresh",
  AGING = "aging",
  STALE = "stale",
  DECAYED = "decayed",
  ANCIENT = "ancient"
}
```

### Component Naming
```typescript
// Page components: PascalCase
export default function KeywordMagicPage() {}

// UI components: PascalCase
export function DataTable() {}

// Hooks: camelCase with 'use' prefix
export function useKeywords() {}

// Utils: camelCase
export function calculateDecayScore() {}
```

### File Organization
```typescript
// Each feature should have:
├── page.tsx              // Main page
├── components/           // Feature-specific components
├── lib/                  // Feature logic
├── types/                // Feature types
└── hooks/                // Feature hooks
```

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Database
```bash
# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio
```

### Vercel Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

---

## 📚 Additional Resources

### Official Docs
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### APIs
- [DataForSEO API Docs](https://docs.dataforseo.com)
- [Stripe API](https://stripe.com/docs/api)
- [Clerk Auth](https://clerk.com/docs)

### Internal Docs
- `BLOGSPY_COMPLETE_ANALYSIS.md` - Full business analysis
- `ANALYSIS_SUMMARY_HINDI.md` - Hindi summary
- `README.md` - Project overview

---

**Last Updated:** December 14, 2025  
**Version:** 1.0  
**Maintainer:** BlogSpy Dev Team
