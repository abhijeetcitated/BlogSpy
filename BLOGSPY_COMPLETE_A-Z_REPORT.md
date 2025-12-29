# 🚀 BlogSpy SaaS - Complete A-Z Analysis Report

> **Generated:** December 27, 2025  
> **Version:** 1.0.0  
> **Status:** Production-Ready Architecture

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Feature Modules (27 Features)](#4-feature-modules)
5. [Services Layer](#5-services-layer)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [State Management](#8-state-management)
9. [Component Architecture](#9-component-architecture)
10. [Integrations](#10-integrations)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Billing & Subscription](#12-billing--subscription)
13. [File Structure](#13-file-structure)
14. [Configuration](#14-configuration)

---

## 1. Project Overview

### 🎯 What is BlogSpy?

**BlogSpy** is an **AI-Powered SEO Intelligence Platform** - ek comprehensive SaaS application jo bloggers, content creators, aur SEO professionals ke liye design ki gayi hai.

### 🎪 Core Value Proposition

| Feature | Description |
|---------|-------------|
| **Keyword Research** | Advanced keyword discovery with DataForSEO integration |
| **Rank Tracking** | Multi-platform ranking (Google, YouTube, Amazon, TikTok, Reddit, LinkedIn, Pinterest) |
| **Content Optimization** | AI-powered content writer with NLP optimization |
| **Competitor Analysis** | Gap analysis aur weak spot detection |
| **Content Health** | Decay detection aur freshness monitoring |
| **AI Visibility** | Track citations in AI Overviews (ChatGPT, Gemini, etc.) |

### 📊 Business Model

```
┌─────────────────────────────────────────────────────────────┐
│                    PRICING TIERS                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│      FREE       │       PRO       │       ENTERPRISE        │
├─────────────────┼─────────────────┼─────────────────────────┤
│ 10 searches     │ 500 searches    │ Unlimited               │
│ 50 rank tracks  │ 1000 tracks     │ Unlimited               │
│ 100 AI credits  │ 1000 AI credits │ 5000 AI credits         │
│ 3 competitors   │ 10 competitors  │ 50 competitors          │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## 2. Tech Stack

### 🔧 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React Framework (App Router) |
| **React** | 19.2.0 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.1.17 | Styling |
| **Radix UI** | Latest | Accessible Components |
| **Recharts** | 2.15.4 | Charts & Graphs |
| **TipTap** | 3.13.0 | Rich Text Editor (AI Writer) |
| **Zustand** | 5.0.9 | State Management |
| **React Hook Form** | 7.60.0 | Form Handling |
| **Zod** | 3.25.76 | Schema Validation |

### 🔧 Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Backend APIs |
| **Prisma** | ORM |
| **PostgreSQL (Supabase)** | Database |
| **Clerk** | Authentication |
| **Stripe** | Payments |
| **DataForSEO API** | SEO Data |
| **Google APIs** | GSC & GA4 |

### 🔧 Fonts

| Font | Usage |
|------|-------|
| **Geist Sans** | UI text, buttons, body copy |
| **Geist Mono** | Numbers, metrics, code |

---

## 3. Architecture Overview

### 📁 Folder Structure Philosophy

```
blogspy-saas/
├── app/                    # Next.js App Router (Pages & API)
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (marketing)/        # Marketing pages
│   ├── api/                # API Routes
│   └── dashboard/          # Dashboard pages
├── components/             # Shared UI Components
│   ├── ui/                 # Base UI (Button, Card, etc.)
│   ├── layout/             # Layout (Sidebar, TopNav)
│   ├── features/           # Feature Components (exports)
│   └── shared/             # Shared Components
├── src/                    # Feature Modules (Domain-driven)
│   ├── features/           # 27 Feature Modules
│   └── shared/             # Shared Utilities
├── services/               # API Services Layer
├── lib/                    # Core Libraries & Utilities
├── hooks/                  # Custom React Hooks
├── store/                  # Zustand Stores
├── types/                  # TypeScript Types
├── contexts/               # React Contexts
├── config/                 # App Configuration
├── constants/              # Constants & Enums
├── data/                   # Mock Data
└── prisma/                 # Database Schema
```

### 🔄 Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  (React Components - src/features/*, components/features/*)     │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                      CUSTOM HOOKS                               │
│           (hooks/*, src/features/*/hooks/)                      │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                               │
│              (services/*.service.ts)                            │
│     - keywords.service.ts                                       │
│     - rank-tracker.service.ts                                   │
│     - content.service.ts                                        │
│     - trends.service.ts                                         │
│     - decay-detection.service.ts                                │
│     - gsc.service.ts / ga4.service.ts                          │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
│                 (app/api/*/route.ts)                            │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   EXTERNAL APIS                                 │
│   DataForSEO │ Google APIs │ YouTube │ TikTok │ Stripe         │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature Modules (27 Features)

### 📊 RESEARCH TOOLS (8 Features)

#### 4.1 🔮 Keyword Magic
**Location:** `src/features/keyword-magic/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Advanced keyword research with filters |
| **API** | DataForSEO Keywords API |
| **Features** | Volume filter, KD filter, Intent filter, CPC filter, Bulk analysis |

**Key Exports:**
```typescript
export { KeywordMagicContent } from "./keyword-magic-content"
export type { Keyword, KeywordFilters, TrendData, IntentData }
export { keywordMagicAPI, KeywordAPIError } from "./services"
```

#### 4.2 📈 Keyword Overview
**Location:** `src/features/keyword-overview/`, `components/features/keyword-overview/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Deep dive into single keyword |
| **Features** | SERP analysis, Related keywords, Questions, Trends |

#### 4.3 🎯 Competitor Gap Analysis
**Location:** `src/features/competitor-gap/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Find competitor keyword gaps |
| **Features** | Venn diagram visualization, Gap type detection, Weak spot detector |

**Gap Types:**
- 🟢 **Unique** - Only you rank
- 🔵 **Shared** - Both rank
- 🔴 **Missing** - Only competitor ranks
- 🟡 **Weak** - You rank lower

#### 4.4 📊 Trend Spotter
**Location:** `src/features/trend-spotter/`, `components/features/trend-spotter/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Discover trending topics |
| **Features** | Viral detection, Trend prediction, Seasonal patterns |

#### 4.5 🎬 Video Hijack Indicator
**Location:** `src/features/video-hijack/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Find video carousel opportunities |
| **Platforms** | YouTube, TikTok |
| **Features** | Hijack score, Opportunity detection, Competitor videos |

**Key Types:**
```typescript
export type VideoPresence = "dominant" | "significant" | "moderate" | "minimal" | "none"
export type ViralPotential = "low" | "medium" | "high"
```

#### 4.6 📰 News Tracker
**Location:** `src/features/news-tracker/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Monitor news rankings |
| **Features** | News carousel detection, Top stories tracking |

#### 4.7 🔍 Citation Checker ("Am I Cited?")
**Location:** `src/features/citation-checker/`, `lib/citation-analyzer.ts`

| Aspect | Details |
|--------|---------|
| **Purpose** | Check if domain is cited in AI Overviews |
| **Features** | Bulk keyword check, Citation position, Competitor comparison |

**Citation Statuses:**
- ✅ **Cited** - Your domain is cited
- ⚠️ **Partial** - Partially mentioned
- ❌ **Not Cited** - Not in AI Overview

#### 4.8 🏪 Affiliate Finder
**Location:** `src/features/affiliate-finder/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Find affiliate program opportunities |
| **Features** | Commission rates, Program detection |

---

### 📝 CREATION TOOLS (4 Features)

#### 4.9 ✍️ AI Writer
**Location:** `src/features/ai-writer/`

| Aspect | Details |
|--------|---------|
| **Purpose** | AI-powered content creation |
| **Editor** | TipTap rich text editor |
| **Features** | NLP optimization, SEO scoring, Outline generation |

**Key Components:**
```typescript
export { EditorToolbar, SEOScoreGauge, AIWritingIndicator }
export { OptimizationTab, OutlineTab, CompetitorsTab }
```

**SEO Score Calculation:**
- Title optimization
- Meta description
- Keyword density
- Readability score
- Content length

#### 4.10 🔍 On-Page Checker
**Location:** `src/features/on-page-checker/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Full on-page SEO audit |
| **Features** | Title analysis, Meta tags, Headings, Images, Links, Core Web Vitals |

**Analysis Categories:**
- Title (length, keywords)
- Meta Description (length, CTR)
- Headings (H1-H6 structure)
- Content (word count, readability)
- Images (alt tags, optimization)
- Links (internal/external/broken)
- Technical (load time, mobile, CWV)

#### 4.11 🥇 Snippet Stealer
**Location:** `src/features/snippet-stealer/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Steal featured snippets |
| **Features** | Competitor analysis, Optimal format detection, Content editor |

**Snippet Types:**
- 📝 Paragraph
- 📋 List (ordered/unordered)
- 📊 Table
- 🎬 Video

#### 4.12 📜 Schema Generator
**Location:** `src/features/schema-generator/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Generate structured data |
| **Formats** | JSON-LD, Microdata |

---

### 📊 TRACKING TOOLS (8 Features)

#### 4.13 📍 Rank Tracker (Multi-Platform)
**Location:** `src/features/rank-tracker/`, `services/rank-tracker.service.ts`

| Aspect | Details |
|--------|---------|
| **Purpose** | Track rankings across platforms |
| **Platforms** | Google, YouTube, Amazon, Bing, Reddit, TikTok, LinkedIn, Pinterest |

**Tracked Metrics:**
```typescript
export interface TrackedKeyword {
  id: string
  keyword: string
  platform: Platform
  country: string
  rank: number
  previousRank: number | null
  change: number
  volume: number
  url: string
  serpFeatures: SerpFeature[]
  aiOverview?: AIOverviewData
  pixelRank?: number
  trendHistory: number[]
}
```

**SERP Features Tracked:**
- Featured Snippet
- People Also Ask
- Local Pack
- Shopping
- Video
- Images
- Knowledge Panel
- Site Links
- Top Stories
- Reviews
- Ads

#### 4.14 🤖 AI Visibility Tracker
**Location:** `src/features/ai-visibility/`, `app/dashboard/tracking/ai-visibility/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Track visibility in AI Overviews |
| **AI Engines** | Google AI Overview, ChatGPT, Gemini, Perplexity |

#### 4.15 📉 Content Decay Tracker
**Location:** `src/features/content-decay/`, `services/decay-detection.service.ts`

| Aspect | Details |
|--------|---------|
| **Purpose** | Detect decaying content |
| **Data Sources** | GSC, GA4 |

**Decay Factors:**
```typescript
trafficDecay: number    // Traffic decline %
positionDecay: number   // Ranking decline
ctrDecay: number        // CTR decline
engagementDecay: number // Engagement decline
```

**Decay Levels:**
- 🟢 **NONE** - Healthy
- 🟡 **LOW** - Minor decline
- 🟠 **MEDIUM** - Needs attention
- 🔴 **HIGH** - Priority update needed
- ⚫ **CRITICAL** - Immediate action required

#### 4.16 🔄 Cannibalization Detector
**Location:** `src/features/cannibalization/`, `lib/cannibalization-analyzer.ts`

| Aspect | Details |
|--------|---------|
| **Purpose** | Find keyword cannibalization issues |
| **Features** | Page overlap detection, Primary page identification, Fix recommendations |

**Cannibalization Types:**
- **Exact** - Same keyword targeted
- **Semantic** - Similar meaning
- **Partial** - Overlapping terms

#### 4.17 📱 Social Tracker
**Location:** `src/features/social-tracker/`, `services/social-tracker.service.ts`

| Aspect | Details |
|--------|---------|
| **Purpose** | Track social platform rankings |
| **Platforms** | Pinterest, Twitter/X, Instagram |

#### 4.18 🛒 Commerce Tracker
**Location:** `src/features/commerce-tracker/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Track e-commerce SERPs |
| **Features** | Shopping carousel, Product listings |

#### 4.19 💬 Community Tracker
**Location:** `src/features/community-tracker/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Track Reddit/Forum visibility |
| **Platforms** | Reddit, Quora, Forums |

#### 4.20 🔔 Notifications/Alerts
**Location:** `src/features/notifications/`, `services/alerts.service.ts`

| Aspect | Details |
|--------|---------|
| **Purpose** | Alert system for changes |
| **Channels** | Email, In-app, Slack |

**Alert Categories:**
- Rank changes
- Content decay
- Competitor movements
- New opportunities

---

### 🗺️ STRATEGY TOOLS (3 Features)

#### 4.21 🗂️ Topic Clusters
**Location:** `src/features/topic-clusters/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Organize content into clusters |
| **Views** | Network graph, List view |
| **Features** | Pillar page identification, Internal linking suggestions |

**Project System:**
```typescript
export interface TopicProject {
  id: string
  name: string
  status: ProjectStatus
  keywords: ProjectKeyword[]
  clusters: ClusteringResult
}
```

#### 4.22 📅 Content Calendar
**Location:** `src/features/content-calendar/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Plan content publication |
| **Features** | Drag-drop scheduling, Priority assignment |

#### 4.23 🛤️ Content Roadmap
**Location:** `src/features/content-roadmap/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Strategic content planning |
| **Features** | Priority scoring, Timeline view |

---

### 💰 MONETIZATION TOOLS (2 Features)

#### 4.24 💵 Content ROI Calculator
**Location:** `src/features/content-roi/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Calculate content ROI |
| **Metrics** | Traffic value, Conversion value |

#### 4.25 🧮 Earnings Calculator
**Location:** `app/dashboard/monetization/earnings-calculator/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Estimate potential earnings |
| **Models** | Ad revenue, Affiliate, Product sales |

---

### ⚙️ UTILITY FEATURES (2 Features)

#### 4.26 ⌨️ Command Palette
**Location:** `src/features/command-palette/`

| Aspect | Details |
|--------|---------|
| **Purpose** | Quick navigation (⌘K) |
| **Features** | Keyboard shortcuts, Search, Quick actions |

#### 4.27 ⚙️ Settings
**Location:** `src/features/settings/`, `components/features/settings/`

| Aspect | Details |
|--------|---------|
| **Purpose** | User preferences |
| **Sections** | Profile, Billing, API Keys, Integrations |

---

## 5. Services Layer

### 📦 Core Services

| Service | File | Purpose |
|---------|------|---------|
| **Keywords Service** | `services/keywords.service.ts` | Keyword research & analysis |
| **Rankings Service** | `services/rankings.service.ts` | Basic rank data |
| **Rank Tracker Service** | `services/rank-tracker.service.ts` | Multi-platform rank tracking |
| **Content Service** | `services/content.service.ts` | Content analysis |
| **Trends Service** | `services/trends.service.ts` | Trend detection |
| **Decay Detection Service** | `services/decay-detection.service.ts` | Content decay analysis |
| **GSC Service** | `services/gsc.service.ts` | Google Search Console |
| **GA4 Service** | `services/ga4.service.ts` | Google Analytics 4 |
| **Alerts Service** | `services/alerts.service.ts` | Notification system |
| **Social Tracker Service** | `services/social-tracker.service.ts` | Social platform tracking |
| **Video Hijack Service** | `services/video-hijack.service.ts` | Video SERP analysis |
| **Stripe Service** | `services/stripe.service.ts` | Payments |
| **Auth Service** | `services/auth.service.ts` | Authentication |
| **User Service** | `services/user.service.ts` | User management |

### 🔌 DataForSEO Integration

**Location:** `services/dataforseo/`

```typescript
// Client
export { dataForSEOClient, DataForSEOClient } from "./client"

// Keywords API
export {
  getSearchVolume,
  getKeywordSuggestions,
  getKeywordsForSite,
  getRelatedKeywords,
} from "./keywords"

// SERP API
export {
  getGoogleOrganicResults,
  getBatchSerpResults,
  getRankingPosition,
  checkBulkRankings,
} from "./serp"
```

---

## 6. Database Schema

### 📊 Prisma Models

```prisma
// prisma/schema.prisma

// USER & AUTH
model User {
  id            String    @id
  clerkId       String    @unique
  email         String    @unique
  name          String?
  plan          Plan      @default(FREE)
  credits       Int       @default(50)
  stripeCustomerId String?
  // Relations
  projects      Project[]
  keywords      Keyword[]
  rankings      Ranking[]
  content       Content[]
}

enum Plan { FREE, PRO, ENTERPRISE }

// SUBSCRIPTION
model Subscription {
  id                   String
  userId               String
  stripeSubscriptionId String   @unique
  stripePriceId        String
  status               SubscriptionStatus
  plan                 Plan
}

enum SubscriptionStatus { ACTIVE, CANCELED, PAST_DUE, UNPAID, TRIALING }

// PROJECT
model Project {
  id          String
  userId      String
  name        String
  domain      String
  // Relations
  keywords    Keyword[]
  rankings    Ranking[]
  content     Content[]
  competitors Competitor[]
}

// KEYWORD
model Keyword {
  id          String
  userId      String
  projectId   String?
  keyword     String
  location    String   @default("US")
  volume      Int?
  difficulty  Int?
  cpc         Float?
  intent      String?
  trend       String?
  serpFeatures Json?
}

// RANKING
model Ranking {
  id          String
  userId      String
  keywordId   String
  position    Int
  previousPosition Int?
  change      Int
  url         String?
}

// CONTENT
model Content {
  id          String
  userId      String
  title       String
  url         String
  status      ContentStatus
  score       Int?
  wordCount   Int?
  decayRisk   DecayRisk
}

enum ContentStatus { DRAFT, PUBLISHED, ARCHIVED }
enum DecayRisk { NONE, LOW, MEDIUM, HIGH, CRITICAL }

// COMPETITOR
model Competitor {
  id          String
  projectId   String
  domain      String
  commonKeywords Int?
  visibility  Float?
}

// TOPIC CLUSTER
model TopicCluster {
  id          String
  userId      String
  name        String
  pillarTopic String
  totalKeywords Int
}

// API USAGE
model ApiUsage {
  id          String
  userId      String
  endpoint    String
  creditsUsed Int
}

// SEARCH HISTORY
model SearchHistory {
  id          String
  userId      String
  query       String
  type        SearchType
  creditsUsed Int
}

enum SearchType { KEYWORD, COMPETITOR, CONTENT, TREND }
```

---

## 7. API Endpoints

### 🌐 API Routes Structure

```
app/api/
├── auth/
│   └── route.ts              # Authentication
├── keywords/
│   └── route.ts              # Keyword research
├── rankings/
│   └── route.ts              # Rankings data
├── content/
│   └── route.ts              # Content operations
├── trends/
│   └── route.ts              # Trends data
├── alerts/
│   └── route.ts              # Alerts management
├── integrations/
│   ├── gsc/                  # Google Search Console
│   └── ga4/                  # Google Analytics 4
├── video-hijack/
│   ├── youtube/              # YouTube API
│   └── tiktok/               # TikTok API
├── social-tracker/
│   ├── keywords/             # Social keywords
│   └── refresh/              # Refresh data
├── decay-detection/
│   └── route.ts              # Decay analysis
├── cron/
│   └── route.ts              # Scheduled tasks
└── webhooks/
    └── route.ts              # Stripe webhooks
```

---

## 8. State Management

### 🗄️ Zustand Stores

**Location:** `store/`

```typescript
// UI Store - Global UI state
export { useUIStore } from "./ui-store"
// - sidebar open/closed
// - theme
// - loading states

// User Store - User data
export { useUserStore } from "./user-store"
// - user profile
// - subscription
// - credits

// Keyword Store - Keyword data
export { useKeywordStore } from "./keyword-store"
// - selected keywords
// - search history
```

### 🎣 Custom Hooks

**Location:** `hooks/`

```typescript
export { useDebounce } from "./use-debounce"
export { useLocalStorage } from "./use-local-storage"
export { useApi, useFetch } from "./use-api"
export { useIsMobile } from "./use-mobile"
export { useAuth } from "./use-auth"
export { useKeywords } from "./use-keywords"
export { useUser, useCredits } from "./use-user"
```

---

## 9. Component Architecture

### 🧱 Component Hierarchy

```
components/
├── ui/                       # Base UI (Shadcn/Radix)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── ...40+ components
├── layout/
│   ├── AppSidebar.tsx        # Main navigation
│   ├── TopNav.tsx            # Top navigation bar
│   └── ...
├── shared/
│   ├── error-boundary.tsx
│   └── loading.tsx
├── charts/
│   ├── line-chart.tsx
│   ├── bar-chart.tsx
│   └── ...
└── features/                 # Feature component exports
    ├── ai-writer/
    ├── rank-tracker/
    ├── keyword-overview/
    └── ...
```

### 📦 Feature Component Pattern

Each feature follows this structure:
```
src/features/{feature-name}/
├── index.ts                  # Barrel export
├── {feature}-content.tsx     # Main component
├── components/               # Sub-components
│   ├── ComponentA.tsx
│   └── ComponentB.tsx
├── hooks/                    # Feature hooks
├── services/                 # Feature-specific API
├── types/                    # TypeScript types
├── constants/                # Constants
├── utils/                    # Utility functions
└── __mocks__/               # Mock data (dev)
```

---

## 10. Integrations

### 🔗 Google Integrations

#### Google Search Console (GSC)
**Location:** `services/gsc.service.ts`, `lib/google/`

**Capabilities:**
- OAuth connection
- Property selection
- Search analytics data
- Performance metrics
- Index status

#### Google Analytics 4 (GA4)
**Location:** `services/ga4.service.ts`, `lib/google/`

**Capabilities:**
- Traffic data
- User behavior
- Conversion tracking
- Real-time data

### 🔗 DataForSEO Integration

**Location:** `services/dataforseo/`

**APIs Used:**
- Keywords Data API (search volume, suggestions)
- SERP API (ranking positions)
- On-Page API (page analysis)
- DataForSEO Labs (competitor analysis)

### 🔗 Video Platform APIs

**YouTube Data API v3:**
- Video search
- Channel stats
- Trending videos

**TikTok API:**
- Hashtag research
- Video discovery
- Creator stats

---

## 11. Authentication & Authorization

### 🔐 Auth Flow (Clerk)

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   User Login    │ ───▶ │     Clerk       │ ───▶ │   JWT Token     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  AuthProvider   │ ◀─── │   Sync User     │ ◀─── │    Database     │
│   (Context)     │      │   (Webhook)     │      │   (Prisma)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 🛡️ Route Protection

```typescript
// Public Routes
/               # Landing page
/pricing        # Pricing page
/login          # Login
/register       # Register

// Protected Routes (require auth)
/dashboard/*    # All dashboard routes
/settings/*     # Settings routes
/api/*          # API routes (except webhooks)
```

---

## 12. Billing & Subscription

### 💳 Stripe Integration

**Location:** `services/stripe.service.ts`, `lib/stripe.ts`

**Features:**
- Checkout sessions
- Customer portal
- Subscription management
- Usage-based billing

**Pricing Structure:**
```typescript
{
  pro: {
    monthly: "$49/month",
    yearly: "$490/year" // 2 months free
  },
  enterprise: {
    monthly: "$149/month",
    yearly: "$1490/year"
  }
}
```

### 📊 Credit System

| Plan | Credits | Refresh |
|------|---------|---------|
| FREE | 50 | Never |
| PRO | 1000 | Monthly |
| ENTERPRISE | 5000 | Monthly |

**Credit Usage:**
- Keyword search: 1 credit
- Rank check: 1 credit
- AI generation: 5 credits
- Bulk analysis: 10 credits

---

## 13. File Structure (Complete)

```
blogspy-saas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (marketing)/
│   │   ├── features/
│   │   └── about/
│   ├── api/
│   │   ├── auth/
│   │   ├── keywords/
│   │   ├── rankings/
│   │   ├── content/
│   │   ├── trends/
│   │   ├── alerts/
│   │   ├── integrations/
│   │   ├── video-hijack/
│   │   ├── social-tracker/
│   │   ├── decay-detection/
│   │   ├── cron/
│   │   └── webhooks/
│   ├── dashboard/
│   │   ├── page.tsx                 # Command Center
│   │   ├── research/
│   │   │   ├── overview/            # Keyword Overview
│   │   │   ├── keyword-magic/       # Keyword Magic
│   │   │   ├── gap-analysis/        # Competitor Gap
│   │   │   ├── trends/              # Trend Spotter
│   │   │   ├── video-hijack/        # Video Hijack
│   │   │   ├── citation-checker/    # Am I Cited?
│   │   │   ├── content-calendar/    # Content Calendar
│   │   │   └── affiliate-finder/    # Affiliate Finder
│   │   ├── creation/
│   │   │   ├── ai-writer/           # AI Writer
│   │   │   ├── on-page/             # On-Page Checker
│   │   │   ├── snippet-stealer/     # Snippet Stealer
│   │   │   └── schema-generator/    # Schema Generator
│   │   ├── tracking/
│   │   │   ├── rank-tracker/        # Rank Tracker
│   │   │   ├── ai-visibility/       # AI Visibility
│   │   │   ├── decay/               # Content Decay
│   │   │   ├── cannibalization/     # Cannibalization
│   │   │   ├── social-tracker/      # Social Tracker
│   │   │   ├── commerce-tracker/    # Commerce Tracker
│   │   │   ├── community-tracker/   # Community Tracker
│   │   │   └── news-tracker/        # News Tracker
│   │   ├── strategy/
│   │   │   ├── topic-clusters/      # Topic Clusters
│   │   │   └── roadmap/             # Content Roadmap
│   │   ├── monetization/
│   │   │   ├── content-roi/         # Content ROI
│   │   │   └── earnings-calculator/ # Earnings Calculator
│   │   ├── settings/                # Settings
│   │   └── billing/                 # Billing
│   ├── pricing/
│   ├── settings/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── sitemap.ts
├── components/
│   ├── ui/                          # 40+ Shadcn components
│   ├── layout/
│   ├── charts/
│   ├── common/
│   ├── features/
│   ├── forms/
│   ├── icons/
│   └── shared/
├── src/
│   ├── features/                    # 27 feature modules
│   │   ├── ai-writer/
│   │   ├── keyword-magic/
│   │   ├── rank-tracker/
│   │   ├── competitor-gap/
│   │   ├── content-decay/
│   │   ├── topic-clusters/
│   │   ├── snippet-stealer/
│   │   ├── trend-spotter/
│   │   ├── on-page-checker/
│   │   ├── content-roadmap/
│   │   ├── video-hijack/
│   │   ├── citation-checker/
│   │   ├── cannibalization/
│   │   ├── ai-visibility/
│   │   ├── social-tracker/
│   │   ├── commerce-tracker/
│   │   ├── community-tracker/
│   │   ├── news-tracker/
│   │   ├── content-calendar/
│   │   ├── affiliate-finder/
│   │   ├── schema-generator/
│   │   ├── content-roi/
│   │   ├── monetization/
│   │   ├── notifications/
│   │   ├── command-palette/
│   │   ├── settings/
│   │   └── integrations/
│   └── shared/
│       ├── dashboard/
│       ├── pricing/
│       ├── settings/
│       └── utils/
├── services/
│   ├── dataforseo/
│   ├── keywords.service.ts
│   ├── rankings.service.ts
│   ├── rank-tracker.service.ts
│   ├── content.service.ts
│   ├── trends.service.ts
│   ├── decay-detection.service.ts
│   ├── gsc.service.ts
│   ├── ga4.service.ts
│   ├── alerts.service.ts
│   ├── social-tracker.service.ts
│   ├── video-hijack.service.ts
│   ├── stripe.service.ts
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── supabase.service.ts
├── lib/
│   ├── google/
│   ├── supabase/
│   ├── alerts/
│   ├── decay-detection/
│   ├── cannibalization-analyzer.ts
│   ├── citation-analyzer.ts
│   ├── video-hijack-analyzer.ts
│   ├── clustering-algorithm.ts
│   ├── stripe.ts
│   ├── clerk.ts
│   └── utils.ts
├── hooks/
├── store/
├── types/
├── contexts/
├── config/
├── constants/
├── data/
├── prisma/
│   └── schema.prisma
└── public/
```

---

## 14. Configuration

### ⚙️ Site Configuration

**Location:** `config/site.config.ts`

```typescript
export const siteConfig = {
  name: "BlogSpy",
  description: "AI-Powered SEO Intelligence Platform",
  url: process.env.NEXT_PUBLIC_APP_URL,
  
  features: {
    aiWriter: true,
    rankTracker: true,
    keywordMagic: true,
    contentDecay: true,
    topicClusters: true,
    snippetStealer: true,
    trendSpotter: true,
    competitorGap: true,
  },
  
  limits: {
    free: { keywordSearches: 10, rankTracking: 50, aiCredits: 100, competitors: 3 },
    pro: { keywordSearches: 500, rankTracking: 1000, aiCredits: 1000, competitors: 10 },
    agency: { keywordSearches: -1, rankTracking: -1, aiCredits: 5000, competitors: 50 },
  },
}
```

### 🔑 Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://blogspy.io

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY=price_...

# DataForSEO
DATAFORSEO_LOGIN=...
DATAFORSEO_PASSWORD=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 🎯 Summary

**BlogSpy** is a comprehensive SEO SaaS platform with:

- **27 Feature Modules** covering research, creation, tracking, strategy, and monetization
- **Multi-platform rank tracking** (8 platforms)
- **AI-powered content tools**
- **Real-time integrations** (GSC, GA4, DataForSEO)
- **Clean architecture** with domain-driven design
- **Scalable infrastructure** built on Next.js 16 + Supabase

### 📈 Key Metrics

| Metric | Value |
|--------|-------|
| Total Features | 27 |
| Services | 14 |
| API Endpoints | 15+ |
| UI Components | 100+ |
| Database Tables | 10 |
| Supported Platforms | 8 |

---

*Report generated by analyzing the complete BlogSpy codebase. For questions or updates, contact the development team.*
