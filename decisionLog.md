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
  - Fix: removed [`middleware.ts`](middleware.ts:1) and kept request-time routing in [`proxy.ts`](proxy.ts:1) (Next.js “Proxy (Middleware)” output).
- Verified production build on constrained resources: `NEXT_PRIVATE_MAX_WORKERS=2` + `NODE_OPTIONS=--max-old-space-size=2048`.
