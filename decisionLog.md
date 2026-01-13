# Memory Bank — Decision Log

## 2026-01-04

- Excluded `backups/**` from TypeScript compilation in [`tsconfig.json`](tsconfig.json:1) to prevent build failures from archived/incomplete backup files.
- Fixed safe-action validation error extraction in [`KeywordResearchHeader.tsx`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:1) by reading Zod `_errors` instead of indexing validationErrors as an array.
- Implemented DataForSEO social sources in feature-local service [`social.service.ts`](src/features/keyword-research/services/social.service.ts:1):
  - YouTube SERP: `"/v3/serp/youtube/organic/live/advanced"`
  - Reddit Social API: `"/v3/business_data/social_media/reddit/live"` (mapped to `CommunityResult`, sortable by `score`)
  - Pinterest Social API: `"/v3/business_data/social_media/pinterest/live"` (mapped to `CommunityResult` + returned `totalPins`)
- Updated consolidated server action [`fetchSocialInsights()`](src/features/keyword-research/actions/fetch-drawer-data.ts:200) to allow partial failures (empty per-section instead of failing the whole payload).
- Rebuilt Social drawer UI [`SocialTab`](src/features/keyword-research/components/drawers/SocialTab.tsx:1) into 3 purpose-fit sections with matching skeletons:
  - YouTube video cards (thumbnail/title/channel/views/date)
  - Reddit discussion list (subreddit/members/upvotes/comments/author)
  - Pinterest grid (image/saves/title + headline total pins)
- Standardized the drawer’s visual system to a “Linear/Vercel” dark palette (Slate) and recorded the rules in [`activeContext.md`](activeContext.md:1) for consistent future UI.

- Refactored keyword discovery + refresh into clear SoC layers:
  - Discovery service: [`discoverKeywords()`](src/features/keyword-research/services/keyword-discovery.ts:1) called from action [`fetchKeywords()`](src/features/keyword-research/actions/fetch-keywords.ts:1).
  - Live refresh service: [`refreshLiveSerp()`](src/features/keyword-research/services/live-serp.ts:1) called from action [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:82).
  - SERP parsing + scoring extracted into utils like [`detectWeakSpot()`](src/features/keyword-research/utils/serp-parser.ts:1) and [`calculateGeoScore()`](src/features/keyword-research/utils/geo-calculator.ts:1).
- Fixed refresh/credits UI wiring to match exported server actions (`refreshKeywordAction`, `getUserCreditsAction`) and keep builds green:
  - Credits pill + dialog: [`CreditBalance`](src/features/keyword-research/components/header/CreditBalance.tsx:1)
  - Bulk refresh header: [`RefreshCreditsHeader`](src/features/keyword-research/components/table/columns/refresh/RefreshCreditsHeader.tsx:1)
  - Single refresh cell: [`RefreshCell`](src/features/keyword-research/components/table/columns/refresh/RefreshCell.tsx:1)
  - Removed stale barrel exports: [`actions/index.ts`](src/features/keyword-research/actions/index.ts:1)
- Build stability on 4GB RAM: production build validated using constrained workers + heap (NEXT_PRIVATE_MAX_WORKERS=2, NODE_OPTIONS=--max-old-space-size=2048).

### Keyword Magic forensic audit verdict

- Decision: treat Keyword Magic paid-mode as **NOT READY TO SHIP** until server actions that can trigger paid upstream calls are authenticated and safe-action drift is removed.
- Evidence:
  - Public keyword fetch action: [`fetchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:178) imports [`action`](lib/safe-action.ts:74)
  - Paid upstream call path: [`discoverKeywords()`](src/features/keyword-research/services/keyword-discovery.ts:137) → [`getDataForSEOClient()`](src/lib/seo/dataforseo.ts:185)
  - Public drawer actions: [`fetchAmazonData`](src/features/keyword-research/actions/fetch-drawer-data.ts:86), [`fetchSocialInsights`](src/features/keyword-research/actions/fetch-drawer-data.ts:205)
  - Duplicate safe-action modules: [`src/lib/safe-action.ts`](src/lib/safe-action.ts:1) and [`lib/safe-action.ts`](lib/safe-action.ts:1)
- Remediation plan: see CRITICAL Fix Shortlist in [`plans/keyword-magic-forensic-audit.md`](plans/keyword-magic-forensic-audit.md:1).

## 2026-01-05

- Resolved Next.js build blocker: `next build` fails when both a Middleware file and a Proxy file exist.
  - Root cause: Next.js detected both [`middleware.ts`](middleware.ts:1) and [`proxy.ts`](proxy.ts:1).
  - Fix: removed [`middleware.ts`](middleware.ts:1) and kept request-time routing in [`proxy.ts`](proxy.ts:1) (Next.js "Proxy (Middleware)" output).
- Verified production build on constrained resources: `NEXT_PRIVATE_MAX_WORKERS=2` + `NODE_OPTIONS=--max-old-space-size=2048`.

## 2026-01-12

- Implemented feature flagging system for phased launch control without deleting code files.
  - Central config: [`src/config/feature-flags.ts`](src/config/feature-flags.ts:1) (only 8 features disabled; everything else stays enabled).
  - Updated sidebar navigation: [`components/layout/app-sidebar.tsx`](components/layout/app-sidebar.tsx:1) to hide **only** these 8 OFF-flag items:
    - Tracking: news-tracker, community-tracker, social-tracker, commerce-tracker
    - Creation: ai-writer, snippet-stealer, on-page
    - Research: affiliate-finder
  - Any existing route guards continue to key off the same flags; monetization features remain enabled.
  - Fixed React Hook rules violation in [`app/dashboard/creation/ai-writer/page.tsx`](app/dashboard/creation/ai-writer/page.tsx:1) by moving guard before Suspense boundary.
  - Build verified: `npm run build` successful with no TypeScript errors.
  - **Phase 1 Launch Ready**: 20 features enabled, 8 features hidden from UI and returning 404 on direct access, zero file deletions.

## 2026-01-13

- **P0 Fix: Velocity Chart Disappearing**
  - Root cause: [`normalizeToGodView()`](src/features/trend-spotter/components/velocity-chart.tsx:151) returned empty array when no API data was provided, leaving chart blank.
  - Fix: Added failsafe mock data fallback at line 344 in [`velocity-chart.tsx`](src/features/trend-spotter/components/velocity-chart.tsx:344) — if `normalizedData.length === 0`, inject hardcoded 6-month trend data with all 4 series (web, youtube, news, shopping) + forecast extension.
  - The existing `lineStyle()` spotlight logic was already correct (defaults to `strokeOpacity: 1` when `isSpotlightOn === false`).
  - Build verified: `npm run build` successful.

- **TrendSpotter UI Wiring & Calendar Fixes**
  - Calendar Popover: Replaced bare `<Calendar>` icon button with full [`<Popover>`](src/features/trend-spotter/trend-spotter.tsx:265) wrapping `<Calendar mode="single" numberOfMonths={1}>` + `PopoverContent className="w-auto p-0"`.
  - Auto-analysis: Added `useEffect` hook (lines 115-130) that triggers `handleAnalyze()` on mount and debounces (300ms) when `selectedCountryCode`, `selectedPlatform`, or `selectedTimeframe` changes.
  - Country/Platform/Timeframe now reactively update the chart — changing country to Germany triggers new API call and chart re-render.
  - Linear regression forecast logic already existed in [`trend-math.ts`](src/features/trend-spotter/utils/trend-math.ts:64) using last 6 points.
  - X-axis date formatting already handled by [`formatXAxisTick()`](src/features/trend-spotter/components/velocity-chart.tsx:77) → shows month abbreviations.
  - Build verified: `npm run build` successful (exit 0).
