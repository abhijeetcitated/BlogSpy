# Video Hijack Feature - Comprehensive Report

Date: 2026-01-14

## Scope and Sources
This report is based on a code review of the current Video Hijack feature implementation in the project. Primary references:
- `app/dashboard/research/video-hijack/page.tsx`
- `components/features/video-hijack/index.ts`
- `src/features/video-hijack/video-hijack-content-refactored.tsx`
- `src/features/video-hijack/hooks/useVideoSearch.ts`
- `src/features/video-hijack/components/VideoSearchBox.tsx`
- `src/features/video-hijack/components/YouTubeResultCard.tsx`
- `src/features/video-hijack/components/TikTokResultCard.tsx`
- `src/features/video-hijack/components/VideoStatsPanel.tsx`
- `src/features/video-hijack/components/VideoResultsSidebar.tsx`
- `src/features/video-hijack/components/VideoSuggestionPanel.tsx`
- `src/features/video-hijack/utils/mock-generators.ts`
- `src/features/video-hijack/utils/common.utils.ts`
- `src/features/video-hijack/utils/helpers.tsx`
- `src/features/video-hijack/utils/video-utils.ts`
- `src/features/video-hijack/types/common.types.ts`
- `src/features/video-hijack/types/video-search.types.ts`

### File Structure (Current)
```
src/features/video-hijack/
├── index.ts
├── video-hijack-content.tsx
├── video-hijack-content-refactored.tsx
├── __mocks__/
│   ├── video-data.ts
│   └── tiktok-data.ts
├── components/
│   ├── HijackScoreRing.tsx
│   ├── KeywordCard.tsx
│   ├── KeywordList.tsx
│   ├── PageHeader.tsx
│   ├── SidebarPanels.tsx
│   ├── SummaryCards.tsx
│   ├── TikTokResultCard.tsx
│   ├── TikTokTab.tsx
│   ├── VideoPlatformTabs.tsx
│   ├── VideoResultsSidebar.tsx
│   ├── VideoSearchBox.tsx
│   ├── VideoStatsPanel.tsx
│   ├── VideoSuggestionPanel.tsx
│   ├── YouTubeResultCard.tsx
│   └── index.ts
├── constants/
│   └── index.ts
├── hooks/
│   ├── index.ts
│   ├── use-video-hijack.ts
│   ├── use-tiktok-search.ts
│   ├── use-youtube-search.ts
│   └── useVideoSearch.ts
├── services/
│   ├── index.ts
│   ├── tiktok.service.ts
│   └── youtube.service.ts
├── types/
│   ├── common.types.ts
│   ├── index.ts
│   ├── platforms.ts
│   ├── video-hijack.types.ts
│   └── video-search.types.ts
└── utils/
    ├── common.utils.ts
    ├── helpers.tsx
    ├── index.ts
    ├── mock-generators.ts
    ├── tiktok.utils.ts
    ├── video-utils.ts
    └── youtube.utils.ts
```

## Executive Summary (Developer View)
- Feature is UI-complete and functional in the browser using mock data.
- Search, sort, pagination, export, and copy actions are wired and working.
- Real API integration is not implemented yet; data is generated locally with mock generators.
- One behavior gap: stats are computed at search time and not recalculated when switching platform.
- One text anomaly exists in a helper function string.

## Feature Overview
Video Hijack is a research page to discover and analyze YouTube and TikTok video opportunities.
It provides:
- Keyword or domain input
- Dual-platform results (YouTube/TikTok)
- Sorting and pagination
- KPI dashboard
- Sidebar insights and related topics
- Video creation suggestions (titles, tags, hashtags, content gaps)

## Page Entry and Rendering
- Entry route: `app/dashboard/research/video-hijack/page.tsx`
- The page renders `VideoHijackContent` which is a re-export of the refactored component.
- Error boundary wraps the feature.

## UI Flow and States
1) Header and Search
   - Title "Video Research"
   - Search mode toggle: Keyword or Domain
   - Input + Search button

2) Empty State (before search)
   - Intro copy for YouTube and TikTok data
   - Guidance for what the feature provides

3) Loading State
   - Spinner and "Searching videos..." text

4) Results State
   - Platform tabs (YouTube / TikTok)
   - Sort dropdown
   - KPI stats panel
   - Results list (cards)
   - Pagination controls
   - Sidebar insights
   - Suggestion panel (collapsible)

## Components and Responsibilities
### Main Container
- `src/features/video-hijack/video-hijack-content-refactored.tsx`
- Orchestrates UI and uses `useVideoSearch` hook.
- Controls loading, empty, and result states.
- Handles platform tabs, sorting, pagination, and export.

### Search Box
- `src/features/video-hijack/components/VideoSearchBox.tsx`
- Keyword/Domain toggle, input field, and Search button.
- Enter key triggers search.

### Result Cards
- YouTube: `src/features/video-hijack/components/YouTubeResultCard.tsx`
- TikTok: `src/features/video-hijack/components/TikTokResultCard.tsx`
- Cards show rank, title/description, stats, hijack score, badges, and tags/hashtags.

### Stats Panel
- `src/features/video-hijack/components/VideoStatsPanel.tsx`
- KPI dashboard for hijack score, CPM, volume, engagement, competition, etc.
- Content type and audience distribution visualization.

### Sidebar
- `src/features/video-hijack/components/VideoResultsSidebar.tsx`
- Top channels/creators
- Video SEO tips (desktop only)
- Related topics (click to copy and set input)
- Quick stats

### Suggestions Panel
- `src/features/video-hijack/components/VideoSuggestionPanel.tsx`
- Title formats, tags/hashtags
- Optimal length, best time, difficulty
- Content gaps

## Data Model
Key types:
- `VideoResult`, `TikTokResult` in `src/features/video-hijack/types/video-search.types.ts`
- Shared types and enums in `src/features/video-hijack/types/common.types.ts`

## Search and Data Flow (Current Behavior)
- `useVideoSearch` hook simulates search using mock generators.
- When Search is triggered:
  - Empty input shows error toast.
  - Loading state is set.
  - After ~2s, mock YouTube and TikTok results are generated.
  - Keyword stats and suggestions are generated.

Note: Real API calls are commented as TODO.

## Sorting and Pagination Logic
Sorting:
- `hijackScore`, `views`, `engagement`, or `recent`
- `recent` uses `getPublishTimestamp` to parse relative dates.

Pagination:
- Uses `ITEMS_PER_PAGE = 10`
- Displays 5-page window with prev/next controls

## Formulas and Business Logic
### Hijack Score (SERP-based)
Defined in `src/features/video-hijack/utils/common.utils.ts` and `src/features/video-hijack/utils/video-utils.ts`:
- Position <= 3: +40
- Position <= 6: +25
- Else: +10
- Above-the-fold: +20
- Carousel size >= 5: +20
- Carousel size >= 3: +10
- Presence: dominant +20, significant +15, moderate +10, minimal +5
- Capped at 100

### Engagement Rate
Generated in mock data:
- engagement = (likes / views) * 100

### ROI Estimation (Defined but not used in UI)
- potentialViews = searchVolume * 0.35 * 12
- estimatedValue = potentialViews * 0.02
- timeToRank by difficulty bucket

## Columns/Fields Shown (UI + Export)
YouTube Card:
- Title, Channel, Duration
- Views, Likes, Comments, Engagement %
- Hijack Score, Viral Potential, Content Age
- Tags

TikTok Card:
- Description, Creator, Duration
- Views, Likes, Shares, Engagement %
- Hijack Score, Viral Potential, Sound Trending
- Hashtags

CSV Export:
- YouTube: Title, Channel, Views, Likes, Comments, Engagement %, Duration, URL
- TikTok: Description, Creator, Views, Likes, Shares, Engagement %, URL

## Buttons and Filters Status (Working/Behavior)
- Search: works, disabled when empty or loading.
- Keyword/Domain toggle: UI changes only; logic same.
- Export: downloads CSV based on current platform.
- Platform tabs: switch data set and reset page.
- Sort: fully working for the defined options.
- Pagination: fully working.
- Copy: copies title/description/tags/hashtags and shows toast.
- Related topics: set input and copy, but does not auto-search.

## Gaps and Risks
1) Mock data only, no real API integration yet.
2) KeywordStats computed only at search time; switching platform may show mismatched stats.
3) A corrupted string exists in `getVideoRecommendations` in `src/features/video-hijack/utils/video-utils.ts`.
4) Domain search mode is only a UI toggle; actual behavior is identical to keyword search.

## Modernity Assessment
Positive:
- Modern React/Next.js structure with hooks and dynamic imports.
- Responsive design and clean UI composition.
- Clear separation of components, hooks, and utilities.

Needs work for production:
- Replace mock generators with real API services.
- Add validation and real platform stats per tab.
- Address text anomaly and ensure localization readiness.

## Conclusion
The Video Hijack page is a modern, well-structured UI feature with complete front-end behavior. It is currently a prototype or beta experience, powered by mock data. For production readiness, API integration and data correctness per platform are the main priorities.
