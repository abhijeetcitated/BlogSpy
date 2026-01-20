# 🎬 VIDEO HIJACK FEATURE - COMPLETE A-Z REPORT

> **Last Updated:** January 17, 2026  
> **Feature Status:** Production Ready (Mock Data Mode)  
> **Total Files:** 63+ files

---

## 📋 TABLE OF CONTENTS

1. [Feature Purpose & Overview](#1-feature-purpose--overview)
2. [Complete File Tree Structure](#2-complete-file-tree-structure)
3. [Import/Export Connection Map](#3-importexport-connection-map)
4. [Entry Points & Routing](#4-entry-points--routing)
5. [UI Sections Breakdown](#5-ui-sections-breakdown)
6. [YouTube Table/Results - Columns & Data](#6-youtube-tableresults---columns--data)
7. [TikTok Table/Results - Columns & Data](#7-tiktok-tableresults---columns--data)
8. [Stats Dashboard - All Metrics](#8-stats-dashboard---all-metrics)
9. [Sidebar Components](#9-sidebar-components)
10. [Video Suggestions Panel](#10-video-suggestions-panel)
11. [Types Reference](#11-types-reference)
12. [Hooks Architecture](#12-hooks-architecture)
13. [Services & API](#13-services--api)
14. [Utils & Helpers](#14-utils--helpers)
15. [Constants & Configuration](#15-constants--configuration)
16. [Data Flow & State Management](#16-data-flow--state-management)
17. [Current Limitations](#17-current-limitations)

---

## 1. FEATURE PURPOSE & OVERVIEW

### 🎯 What is Video Hijack?

**Video Hijack** is a video keyword research tool that helps content creators and SEO professionals:

1. **Find Video Opportunities** - Search for any keyword to discover video content on YouTube & TikTok
2. **Analyze Competition** - See who's ranking, their views, engagement, and hijack score
3. **Hijack Score** - Calculate how easy it is to outrank existing videos (higher = easier to beat)
4. **Content Suggestions** - Get AI-powered title formats, tags, hashtags, and content gaps
5. **Export Data** - Download results as CSV for further analysis

### 🔑 Key Concept: "Hijack Score"

The **Hijack Score (0-100)** measures how easy it is to outrank an existing video:
- **80-100** (🟢 Easy): Old videos with low engagement from small channels
- **60-79** (🟡 Medium): Moderately competitive
- **0-59** (🔴 Hard): New videos with high engagement from large channels

**Calculation Factors:**
- Engagement rate (lower = easier)
- Content age (older = easier)
- Channel size (smaller = easier)
- View velocity (slower = easier)

---

## 2. COMPLETE FILE TREE STRUCTURE

```
📦 src/features/video-hijack/
├── 📄 index.ts                              # Main barrel export (169 lines)
├── 📄 video-hijack-content.tsx              # Original main component (1736 lines)
├── 📄 video-hijack-content-refactored.tsx   # Refactored component (396 lines)
│
├── 📂 api/                                  # API Routes
│   ├── 📄 index.ts                          # API barrel export
│   ├── 📂 youtube/
│   │   └── 📄 route.ts                      # YouTube API route (314 lines)
│   └── 📂 tiktok/
│       └── 📄 route.ts                      # TikTok API route (270 lines)
│
├── 📂 components/                           # UI Components
│   ├── 📄 index.ts                          # Components barrel export
│   ├── 📄 HijackScoreRing.tsx               # Circular score indicator
│   ├── 📄 StatusBadges.tsx                  # Opportunity & Presence badges
│   ├── 📄 KeywordCard.tsx                   # Keyword display card
│   ├── 📄 KeywordList.tsx                   # Keywords list
│   ├── 📄 PageHeader.tsx                    # Page header component
│   ├── 📄 SummaryCards.tsx                  # Summary statistics cards
│   ├── 📄 VideoFilters.tsx                  # Filter controls
│   ├── 📄 SidebarPanels.tsx                 # Sidebar panels
│   ├── 📄 VideoPlatformTabs.tsx             # YouTube/TikTok tabs
│   ├── 📄 TikTokTab.tsx                     # TikTok-specific tab
│   ├── 📄 YouTubeResultCard.tsx             # YouTube video card
│   ├── 📄 TikTokResultCard.tsx              # TikTok video card
│   ├── 📄 VideoStatsPanel.tsx               # Statistics dashboard
│   ├── 📄 VideoSearchBox.tsx                # Search input
│   ├── 📄 VideoResultsSidebar.tsx           # Results sidebar
│   ├── 📄 VideoSuggestionPanel.tsx          # Content suggestions
│   │
│   ├── 📂 shared/                           # Shared components
│   │   ├── 📄 index.ts
│   │   ├── 📄 VideoSearchBox.tsx
│   │   ├── 📄 VideoStatsPanel.tsx
│   │   ├── 📄 VideoResultsSidebar.tsx
│   │   └── 📄 VideoSuggestionPanel.tsx
│   │
│   ├── 📂 youtube/                          # YouTube-specific
│   │   ├── 📄 index.ts
│   │   ├── 📄 YouTubeResultCard.tsx
│   │   └── 📄 YouTubeResultsList.tsx
│   │
│   └── 📂 tiktok/                           # TikTok-specific
│       ├── 📄 index.ts
│       ├── 📄 TikTokResultCard.tsx
│       └── 📄 TikTokResultsList.tsx
│
├── 📂 hooks/                                # React Hooks
│   ├── 📄 index.ts                          # Hooks barrel export
│   ├── 📄 useVideoSearch.ts                 # Legacy combined hook
│   ├── 📄 use-video-hijack.ts               # Main combined hook (369 lines)
│   ├── 📄 use-youtube-search.ts             # YouTube-specific hook (243 lines)
│   └── 📄 use-tiktok-search.ts              # TikTok-specific hook (257 lines)
│
├── 📂 services/                             # API Services
│   ├── 📄 index.ts                          # Services barrel export
│   ├── 📄 youtube.service.ts                # YouTube API service (441 lines)
│   └── 📄 tiktok.service.ts                 # TikTok API service (451 lines)
│
├── 📂 types/                                # TypeScript Types
│   ├── 📄 index.ts                          # Types barrel export
│   ├── 📄 common.types.ts                   # Shared types (183 lines)
│   ├── 📄 platforms.ts                      # Platform types
│   ├── 📄 youtube.types.ts                  # YouTube types (157 lines)
│   ├── 📄 tiktok.types.ts                   # TikTok types (180 lines)
│   ├── 📄 video-hijack.types.ts             # Legacy types
│   └── 📄 video-search.types.ts             # Search types
│
├── 📂 utils/                                # Utility Functions
│   ├── 📄 index.ts                          # Utils barrel export
│   ├── 📄 common.utils.ts                   # Common utilities (380 lines)
│   ├── 📄 video-utils.ts                    # Video utilities (282 lines)
│   ├── 📄 youtube.utils.ts                  # YouTube utilities
│   ├── 📄 tiktok.utils.ts                   # TikTok utilities
│   ├── 📄 helpers.tsx                       # Helper components
│   ├── 📄 mock-data.ts                      # Mock data utilities
│   └── 📄 mock-generators.ts                # Mock data generators
│
├── 📂 constants/                            # Constants
│   ├── 📄 index.ts                          # Constants barrel export
│   └── 📄 platforms.ts                      # Platform configurations
│
└── 📂 __mocks__/                            # Mock Data
    ├── 📄 video-data.ts                     # Video mock generator
    └── 📄 tiktok-data.ts                    # TikTok mock data
```

### Related Files (Outside Feature Folder)

```
📦 app/dashboard/research/video-hijack/
└── 📄 page.tsx                              # Dashboard route entry

📦 components/features/video-hijack/
└── 📄 index.ts                              # Backward compatibility export

📦 types/
└── 📄 video-hijack.types.ts                 # Legacy types

📦 services/
└── 📄 video-hijack.service.ts               # Legacy service

📦 lib/
└── 📄 video-hijack-analyzer.ts              # Legacy analyzer
```

---

## 3. IMPORT/EXPORT CONNECTION MAP

### Main Entry Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ENTRY POINTS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  app/dashboard/research/video-hijack/page.tsx                       │
│       │                                                              │
│       └──imports──> @/components/features/video-hijack               │
│                              │                                       │
│                              └──re-exports──> VideoHijackContent     │
│                                                    │                 │
│                                                    │                 │
└────────────────────────────────────────────────────│─────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│              src/features/video-hijack/index.ts                     │
│              (MAIN BARREL EXPORT)                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  EXPORTS:                                                            │
│  ├── VideoHijackContent (video-hijack-content.tsx)                  │
│  ├── VideoHijackContentRefactored (video-hijack-content-refactored) │
│  ├── Hooks: useVideoSearch, useYouTubeSearch, useTikTokSearch       │
│  ├── Services: youtubeService, tiktokService                        │
│  ├── Components: HijackScoreRing, StatusBadges, Cards, etc.         │
│  ├── Utils: formatViews, getPresenceColor, etc.                     │
│  ├── Types: VideoResult, TikTokResult, KeywordStats, etc.           │
│  └── Constants: HIJACK_SCORE_THRESHOLDS, MOCK_CHANNELS, etc.        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│             VideoHijackContentRefactored (Main)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  IMPORTS FROM:                                                       │
│                                                                      │
│  ├── ./hooks                                                         │
│  │   └── useVideoSearch (state + handlers)                          │
│  │                                                                   │
│  ├── ./components                                                    │
│  │   ├── VideoSearchBox                                             │
│  │   ├── YouTubeResultCard                                          │
│  │   ├── TikTokResultCard                                           │
│  │   ├── VideoStatsPanel                                            │
│  │   ├── VideoResultsSidebar (dynamic)                              │
│  │   └── VideoSuggestionPanel (dynamic)                             │
│  │                                                                   │
│  ├── ./utils/helpers                                                 │
│  │   └── ITEMS_PER_PAGE                                             │
│  │                                                                   │
│  ├── ./types/video-search.types                                      │
│  │   └── VideoResult, TikTokResult, SortOption                      │
│  │                                                                   │
│  ├── @/components/ui/*                                               │
│  │   └── Button, Badge, Select, Tooltip                             │
│  │                                                                   │
│  └── @/components/icons/platform-icons                               │
│      └── YouTubeIcon, TikTokIcon, VideoIcon, etc.                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Hook Dependencies

```
┌───────────────────────────────────────┐
│         useVideoSearch                │
│    (./hooks/useVideoSearch.ts)        │
├───────────────────────────────────────┤
│                                       │
│  IMPORTS:                             │
│  ├── React hooks                      │
│  ├── sonner (toast)                   │
│  ├── ../types/common.types            │
│  │   └── SearchMode, Platform,        │
│  │       SortOption, KeywordStats     │
│  ├── ../types/youtube.types           │
│  │   └── YouTubeVideoResult           │
│  ├── ../types/tiktok.types            │
│  │   └── TikTokVideoResult            │
│  └── ../utils/mock-generators         │
│      └── generateMockYouTubeResults   │
│      └── generateMockTikTokResults    │
│      └── generateKeywordStats         │
│      └── generateVideoSuggestion      │
│                                       │
│  EXPORTS:                             │
│  └── useVideoSearch (hook function)   │
│  └── UseVideoSearchResult (type)      │
│                                       │
└───────────────────────────────────────┘
```

---

## 4. ENTRY POINTS & ROUTING

### Dashboard Entry Point

**File:** `app/dashboard/research/video-hijack/page.tsx`

```tsx
import { VideoHijackContent } from "@/components/features/video-hijack"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function VideoHijackPage() {
  return (
    <ErrorBoundary>
      <VideoHijackContent />
    </ErrorBoundary>
  )
}
```

**Route:** `/dashboard/research/video-hijack`

### Backward Compatibility Layer

**File:** `components/features/video-hijack/index.ts`

```tsx
export { VideoHijackContentRefactored as VideoHijackContent } from "@/src/features/video-hijack"
```

This exports the refactored component (396 lines) instead of the original (1736 lines).

---

## 5. UI SECTIONS BREAKDOWN

The Video Hijack page has **8 main sections**:

### Section 1: Page Header
- **Component:** Built into main component
- **Elements:**
  - Page title with VideoIcon (red)
  - Subtitle: "Find trending video opportunities"
  - Export CSV button (appears after search)

### Section 2: Search Box
- **Component:** `VideoSearchBox`
- **Elements:**
  - Search mode toggle (Keyword / Domain)
  - Search input field
  - Search button with loading state
  - Helper text

### Section 3: Loading State
- **Component:** Built-in
- **Elements:**
  - Spinning circle animation
  - Video icon
  - "Searching videos..." text

### Section 4: Empty State (Before Search)
- **Component:** Built-in
- **Elements:**
  - YouTube & TikTok icons
  - Feature description
  - API capabilities list (YouTube Data, TikTok Data)

### Section 5: Platform Tabs & Sort
- **Component:** Built into main
- **Elements:**
  - YouTube tab with count badge
  - TikTok tab with count badge
  - Sort dropdown (Hijack Score, Views, Engagement, Recent)

### Section 6: Stats Dashboard
- **Component:** `VideoStatsPanel`
- **See Section 8 for full details**

### Section 7: Results Grid
- **Components:** `YouTubeResultCard` / `TikTokResultCard`
- **Layout:** 3-column grid (results + sidebar)
- **See Section 6 & 7 for column details**

### Section 8: Video Suggestions Panel
- **Component:** `VideoSuggestionPanel`
- **See Section 10 for full details**

---

## 6. YOUTUBE TABLE/RESULTS - COLUMNS & DATA

### YouTubeResultCard Structure

Each YouTube result card displays:

| # | Column/Element | Data Type | Description |
|---|---------------|-----------|-------------|
| 1 | **Rank** | number | Position in results (1-10) |
| 2 | **Hijack Score** | 0-100 | Circular indicator showing ease of outranking |
| 3 | **Title** | string | Video title (truncated) |
| 4 | **Viral Potential** | Badge | "low" / "medium" / "high" |
| 5 | **Content Age** | Badge | "fresh" / "aging" / "outdated" |
| 6 | **Channel** | string | Channel name with subscriber count |
| 7 | **Duration** | string | Video length (e.g., "12:30") |
| 8 | **Published** | string | Relative time (e.g., "3 months ago") |
| 9 | **Views** | number | Formatted (e.g., "150K") |
| 10 | **Likes** | number | Formatted |
| 11 | **Comments** | number | Formatted |
| 12 | **Engagement** | percentage | Likes/Views ratio |
| 13 | **Tags** | string[] | First 3-5 tags (clickable to copy) |
| 14 | **Actions** | buttons | Copy title, Open video |

### YouTube Result Interface

```typescript
interface VideoResult {
  id: string
  title: string
  channel: string
  channelUrl: string
  subscribers: string
  views: number
  likes: number
  comments: number
  publishedAt: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  engagement: number
  tags: string[]
  hijackScore: number           // 0-100
  viralPotential: "low" | "medium" | "high"
  contentAge: "fresh" | "aging" | "outdated"
}
```

### Color Coding (YouTube)

| Element | High/Good | Medium | Low/Bad |
|---------|-----------|--------|---------|
| Hijack Score | 🟢 emerald (80+) | 🟡 amber (60-79) | 🔴 red (<60) |
| Viral Potential | 🟢 emerald | 🟡 amber | ⚫ slate |
| Content Age | 🟢 fresh (emerald) | 🟡 aging (amber) | 🔴 outdated (red) |
| Tags | 🔴 Red background | - | - |

---

## 7. TIKTOK TABLE/RESULTS - COLUMNS & DATA

### TikTokResultCard Structure

Each TikTok result card displays:

| # | Column/Element | Data Type | Description |
|---|---------------|-----------|-------------|
| 1 | **Rank** | number | Position in results (cyan theme) |
| 2 | **Hijack Score** | 0-100 | Circular indicator |
| 3 | **Description** | string | Video description/caption |
| 4 | **Viral Potential** | Badge | "low" / "medium" / "high" |
| 5 | **Sound Trending** | Badge | Pink badge if sound is trending |
| 6 | **Creator** | string | @username with follower count |
| 7 | **Duration** | string | Short format (e.g., "0:45") |
| 8 | **Published** | string | Relative time (e.g., "5d ago") |
| 9 | **Views** | number | Formatted (e.g., "1.2M") |
| 10 | **Likes** | number | Formatted |
| 11 | **Shares** | number | Formatted (TikTok-specific) |
| 12 | **Engagement** | percentage | (Likes+Shares+Comments)/Views |
| 13 | **Hashtags** | string[] | First 4 hashtags (clickable) |
| 14 | **Actions** | buttons | Copy description, Open video |

### TikTok Result Interface

```typescript
interface TikTokResult {
  id: string
  description: string
  creator: string
  creatorUrl: string
  followers: string
  views: number
  likes: number
  shares: number             // TikTok-specific
  comments: number
  publishedAt: string
  duration: string
  videoUrl: string
  engagement: number
  hashtags: string[]
  hijackScore: number
  viralPotential: "low" | "medium" | "high"
  soundTrending: boolean     // TikTok-specific
}
```

### Color Coding (TikTok)

| Element | Color |
|---------|-------|
| Rank badge | 🔵 cyan |
| Hashtags | 🔵 cyan background |
| Trending sound | 🩷 pink |
| Hover state | cyan border |

---

## 8. STATS DASHBOARD - ALL METRICS

### VideoStatsPanel Component

Located in `components/shared/VideoStatsPanel.tsx`

### Row 1: Main Metrics (8 columns)

| Metric | Icon | Description | Value Range |
|--------|------|-------------|-------------|
| **Hijack Opportunity** | ⚡ Zap | Main score - how easy to hijack | 0-100 (emerald) |
| **CPM Potential** | 💰 Dollar | Monetization score | 0-100 (amber) |
| **Search Vol** | 🔍 Search | Monthly search volume | Number with trend arrow |
| **Total Videos** | 🎬 Video | Videos indexed for keyword | Number |
| **Total Views** | 👁️ Views | Combined views | Number |
| **Engagement** | ❤️ Like | Average engagement % | Percentage |
| **Competition** | 🎯 Target | Competition level badge | low/medium/high |

### Row 2: Insights (6 columns)

| Metric | Icon | Description |
|--------|------|-------------|
| **Seasonality** | 🌲/❄️/⚡ | evergreen / seasonal / trending |
| **Best Day** | 📅 Calendar | Best upload day |
| **Best Time** | 🕐 Clock | Best upload time (EST) |
| **Avg Length** | ⏱️ Timer | Average video length |
| **Trend Score** | 🔥 Flame | Trending score (0-100) |
| **Avg Views** | ▶️ Play | Average views per video |

### Row 3: Distribution Charts (2 columns)

| Chart | Description |
|-------|-------------|
| **Content Type Distribution** | Tutorial, Review, Comparison, How-to, Other |
| **Audience Age Distribution** | 18-24, 25-34, 35-44, 45-54, 55+ |

### KeywordStats Interface

```typescript
interface KeywordStats {
  keyword: string
  platform: "youtube" | "tiktok"
  totalVideos: number
  totalViews: number
  avgViews: number
  avgEngagement: number
  topChannels: { name: string; videos: number }[]
  trendScore: number
  competition: "low" | "medium" | "high"
  hijackOpportunity: number       // 0-100
  monetizationScore: number       // 0-100
  seasonality: "evergreen" | "seasonal" | "trending"
  avgVideoLength: string
  bestUploadDay: string
  bestUploadTime: string
  searchVolume: number
  volumeTrend: "up" | "stable" | "down"
  contentTypes: { type: string; percentage: number }[]
  audienceAge: { range: string; percentage: number }[]
}
```

---

## 9. SIDEBAR COMPONENTS

### VideoResultsSidebar Component

Located in `components/shared/VideoResultsSidebar.tsx`

### Sidebar Sections

#### 1. Top Channels/Creators
- Lists top 3 channels (YouTube) or creators (TikTok)
- Shows name and video count

#### 2. Video SEO Tips
Static tips:
- Focus on keywords with high views but low engagement
- Longer videos (10-15 min) rank better on YouTube
- Add timestamps and chapters for better CTR
- Create video for queries with "how to" intent
- First 24-48 hours engagement is crucial

#### 3. Related Topics
Dynamic keyword suggestions:
- `{keyword} tutorial`
- `{keyword} for beginners`
- `best {keyword}`
- `{keyword} tips`
- `{keyword} 2024`
- `how to {keyword}`

#### 4. Quick Stats
- Avg Views
- Best Performer (highest views in results)
- Avg Engagement
- Videos Analyzed

---

## 10. VIDEO SUGGESTIONS PANEL

### VideoSuggestionPanel Component

Located in `components/shared/VideoSuggestionPanel.tsx`

### Collapsible Section with:

#### 1. Title Suggestions
5 recommended title formats:
```
- {keyword} - Complete Beginner's Guide [2024]
- How to {keyword} in 10 Minutes (Step by Step)
- {keyword} Tutorial: Everything You Need to Know
- I Tried {keyword} for 30 Days - Here's What Happened
- {keyword} Explained Simply | No BS Guide
```

#### 2. YouTube Tags
10 recommended tags with "Copy All Tags" button

#### 3. TikTok Hashtags
8 recommended hashtags with "Copy All Hashtags" button

#### 4. Quick Info Cards
- YouTube optimal length (8-15 minutes)
- TikTok optimal length (30-60 seconds)
- Best time to post
- Difficulty level (easy/medium/hard)

#### 5. Content Gaps & Opportunities
4 content gap suggestions:
```
- No recent videos on "{keyword} for beginners"
- Missing: Step-by-step walkthrough content
- Opportunity: "{keyword}" case studies
- Low competition: "{keyword}" common mistakes
```

### VideoSuggestion Interface

```typescript
interface VideoSuggestion {
  titleFormats: string[]
  recommendedTags: string[]
  recommendedHashtags: string[]
  optimalLength: { youtube: string; tiktok: string }
  contentGaps: string[]
  bestTimeToPost: string
  difficulty: "easy" | "medium" | "hard"
}
```

---

## 11. TYPES REFERENCE

### All Type Files

| File | Key Types |
|------|-----------|
| `common.types.ts` | Platform, SearchMode, SortOption, ViralPotential, ContentAge, KeywordStats, VideoSuggestion |
| `youtube.types.ts` | YouTubeVideoResult, YouTubeVideo, YouTubeChannel, YouTubeSearchOptions |
| `tiktok.types.ts` | TikTokVideoResult, TikTokVideo, TikTokCreator, TikTokSearchOptions |
| `video-hijack.types.ts` | VideoHijackKeyword, VideoHijackSummary, VideoHijackAnalysis, VideoROI |
| `platforms.ts` | VideoPlatformType, VideoPlatformConfig |

### Platform Types

```typescript
export type Platform = "youtube" | "tiktok"
export type VideoPlatformType = "youtube" | "tiktok"
export type SearchMode = "domain" | "keyword"
export type SortOption = "views" | "engagement" | "recent" | "hijackScore"
```

### Score Types

```typescript
export type ViralPotential = "low" | "medium" | "high"
export type ContentAge = "fresh" | "aging" | "outdated"
export type Seasonality = "evergreen" | "seasonal" | "trending"
export type VolumeTrend = "up" | "stable" | "down"
export type Competition = "low" | "medium" | "high"
export type Difficulty = "easy" | "medium" | "hard"
```

---

## 12. HOOKS ARCHITECTURE

### Available Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useVideoSearch` | Legacy combined hook | `useVideoSearch.ts` |
| `useVideoHijack` | Main combined hook | `use-video-hijack.ts` |
| `useYouTubeSearch` | YouTube-specific | `use-youtube-search.ts` |
| `useTikTokSearch` | TikTok-specific | `use-tiktok-search.ts` |

### useVideoSearch Return Type

```typescript
interface UseVideoSearchResult {
  // Search state
  searchMode: SearchMode
  setSearchMode: (mode: SearchMode) => void
  searchInput: string
  setSearchInput: (input: string) => void
  searchedQuery: string
  platform: Platform
  setPlatform: (platform: Platform) => void
  
  // Loading state
  isLoading: boolean
  hasSearched: boolean
  
  // Results
  youtubeResults: YouTubeVideoResult[]
  tiktokResults: TikTokVideoResult[]
  keywordStats: KeywordStats | null
  videoSuggestion: VideoSuggestion | null
  
  // Sorting & Pagination
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedResults: YouTubeVideoResult[] | TikTokVideoResult[]
  currentResults: YouTubeVideoResult[] | TikTokVideoResult[]
  
  // Actions
  handleSearch: () => void
  handleExport: () => void
  handleCopy: (text: string) => void
  reset: () => void
}
```

---

## 13. SERVICES & API

### YouTube Service

**File:** `services/youtube.service.ts` (441 lines)

**Functions:**
| Function | Purpose |
|----------|---------|
| `calculateYouTubeHijackScore()` | Calculate hijack score for YouTube video |
| `calculateYouTubeViralPotential()` | Determine viral potential |
| `getYouTubeContentAge()` | Determine content age category |
| `formatNumber()` | Format large numbers (K, M) |
| `parseYouTubeDuration()` | Parse ISO 8601 duration |
| `YouTubeService.searchVideos()` | Search YouTube videos |
| `YouTubeService.getVideoDetails()` | Get video statistics |

### TikTok Service

**File:** `services/tiktok.service.ts` (451 lines)

**Functions:**
| Function | Purpose |
|----------|---------|
| `calculateTikTokHijackScore()` | Calculate hijack score for TikTok |
| `calculateTikTokViralPotential()` | Determine viral potential |
| `formatTikTokNumber()` | Format numbers |
| `formatTikTokDuration()` | Format duration |
| `TikTokService.searchVideos()` | Search TikTok videos |
| `TikTokService.getHashtagAnalytics()` | Get hashtag stats |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/video-hijack/youtube/search` | GET | YouTube video search |
| `/api/video-hijack/tiktok/search` | GET | TikTok video search |
| `/api/video-hijack/tiktok/hashtag` | GET | TikTok hashtag analytics |

### External APIs Used

| Platform | API | Notes |
|----------|-----|-------|
| YouTube | YouTube Data API v3 | Requires `YOUTUBE_API_KEY` |
| TikTok | RapidAPI TikTok Scraper | Requires `RAPIDAPI_KEY` |

---

## 14. UTILS & HELPERS

### Common Utilities (`common.utils.ts`)

| Function | Purpose |
|----------|---------|
| `formatViews()` | Format numbers to K/M format |
| `getPublishTimestamp()` | Parse relative dates |
| `escapeCsvValue()` | Escape CSV values |
| `formatDate()` | Format to relative time |
| `formatDateShort()` | Format to short date |
| `getEngagementColor()` | Get color based on engagement |
| `getPresenceColor()` | Get color for video presence |
| `getPresenceBgColor()` | Get background color for presence |

### Video Utilities (`video-utils.ts`)

| Function | Purpose |
|----------|---------|
| `getPresenceLabel()` | Get label for presence |
| `getOpportunityColor()` | Get color for opportunity |
| `getOpportunityBgColor()` | Get background for opportunity |
| `getOpportunityLevelFromScore()` | Convert score to level |
| `getPlatformColor()` | Get platform brand color |
| `getHijackScoreColor()` | Get color for hijack score |
| `getHijackScoreRingColor()` | Get ring color for score |
| `calculateHijackScore()` | Calculate hijack score |
| `sortKeywords()` | Sort keywords by criteria |
| `filterKeywords()` | Filter keywords |
| `calculateVideoROI()` | Calculate ROI potential |

---

## 15. CONSTANTS & CONFIGURATION

### Constants (`constants/index.ts`)

```typescript
export const ALL_PRESENCES = ["dominant", "significant", "moderate", "minimal", "none"]
export const ALL_OPPORTUNITY_LEVELS = ["high", "medium", "low"]

export const HIJACK_SCORE_THRESHOLDS = {
  high: 70,
  medium: 50,
  low: 30,
}

export const HIJACK_SCORE_COLORS = {
  high: "#ef4444",    // Red
  medium: "#f97316",  // Orange
  low: "#eab308",     // Yellow
  safe: "#22c55e",    // Green
}

export const VIDEO_SEO_TIPS = [
  "Focus on keywords with high hijack + low competition",
  "Longer videos (10-15 min) rank better for tutorials",
  "Add timestamps and chapters for better CTR",
  "Create video for queries with \"how to\" intent",
]

export const ITEMS_PER_PAGE = 10
```

### Platform Configuration (`constants/platforms.ts`)

```typescript
export const VIDEO_PLATFORM_CONFIG = {
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    color: "#FF0000",
    bgColor: "bg-red-500/10",
    creditCost: 1,
    apiSource: "YouTube Data API",
    maxDuration: "Unlimited",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "#00F2EA",
    bgColor: "bg-cyan-500/10",
    creditCost: 3,
    apiSource: "Apify Scraper",
    maxDuration: "10 minutes",
  },
}
```

---

## 16. DATA FLOW & STATE MANAGEMENT

### Search Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User enters keyword in VideoSearchBox                           │
│                      │                                               │
│                      ▼                                               │
│  2. User clicks Search button                                        │
│                      │                                               │
│                      ▼                                               │
│  3. handleSearch() triggered in useVideoSearch hook                  │
│                      │                                               │
│                      ├───────────────────────────────────────┐       │
│                      ▼                                       ▼       │
│  4a. setIsLoading(true)                      4b. Show loading state  │
│                      │                                               │
│                      ▼                                               │
│  5. setTimeout (simulating API call)                                 │
│                      │                                               │
│                      ├────────────────┬─────────────────────┐        │
│                      ▼                ▼                     ▼        │
│  6a. generateMockYouTubeResults()  6b. generateMockTikTokResults()   │
│                      │                │                              │
│                      └────────────────┼─────────────────────┘        │
│                                       ▼                              │
│  7. setYoutubeResults(), setTiktokResults()                         │
│  8. setKeywordStats(), setVideoSuggestion()                         │
│  9. setIsLoading(false), setHasSearched(true)                       │
│                      │                                               │
│                      ▼                                               │
│  10. UI re-renders with results                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### State Structure

```typescript
// Search State
searchMode: "keyword" | "domain"
searchInput: string
searchedQuery: string
platform: "youtube" | "tiktok"

// Loading State
isLoading: boolean
hasSearched: boolean

// Results State
youtubeResults: VideoResult[]
tiktokResults: TikTokResult[]
keywordStats: KeywordStats | null
videoSuggestion: VideoSuggestion | null

// Pagination State
sortBy: SortOption
currentPage: number
totalPages: number (computed)
paginatedResults: VideoResult[] | TikTokResult[] (computed)
```

---

## 17. CURRENT LIMITATIONS

### 1. Mock Data Mode
- Currently using mock data generators
- No live API calls to YouTube/TikTok
- Requires API keys for production:
  - `YOUTUBE_API_KEY` - YouTube Data API v3
  - `RAPIDAPI_KEY` - TikTok Scraper

### 2. Missing Features
- No video thumbnails displayed
- No real-time trend data
- No historical data tracking
- No saved searches/keywords

### 3. API Limitations
- YouTube API has daily quota limits
- TikTok API requires RapidAPI subscription
- No official TikTok API (scraper-based)

### 4. Data Accuracy
- Hijack score is an estimate
- Search volume is approximated
- Competition levels are calculated locally

### 5. UI/UX
- No video preview on hover
- No channel avatar images
- Limited mobile optimization in some areas

---

## 📊 SUMMARY STATISTICS

| Metric | Value |
|--------|-------|
| Total Files | 63+ |
| Main Component Lines | 1736 (original) / 396 (refactored) |
| Types Files | 7 |
| Hooks | 4 |
| Services | 2 |
| Utils Files | 8 |
| Components | 20+ |
| API Routes | 2 |
| Platforms Supported | 2 (YouTube, TikTok) |

---

## 🔗 RELATED DOCUMENTATION

- [BlogSpy Complete System Architecture](./blogspy-complete-system-architecture.md)
- [Competitor Gap Report](./COMPETITOR_GAP_COMPLETE_TREE_REPORT.md)
- [Feature Fix TODO](./FEATURES-FIX-TODO.md)

---

*Report generated for BlogSpy SaaS - Video Hijack Feature*
