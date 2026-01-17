# Competitor Gap Feature Report (A-Z)

This report documents the complete Competitor Gap feature: file connections, purpose, UI sections, table columns, and data flow.

## Purpose

The Competitor Gap feature demonstrates how BlogSpy compares your site against competitors to surface:
- Missing keywords you do not rank for.
- Weak keywords where competitors outrank you.
- Strong keywords where you lead.
- Community/forum opportunities ("Forum Intel").

This page is implemented as a demo using mock data (no live API calls).

## Entry Point And Feature Wiring

- `app/competitor-gap/page.tsx`
  - Demo route page.
  - Wraps the feature in `DemoWrapper`, `AppSidebar`, and `TopNav`.
  - Renders `CompetitorGapContent`.
- `components/features/index.ts`
  - Barrel export for feature components.
  - Re-exports `CompetitorGapContent` from `src/features/competitor-gap`.
- `src/features/competitor-gap/index.ts`
  - Public API for the feature: exports main component, types, constants, utils, and sub-components.
- `src/features/competitor-gap/competitor-gap-content.tsx`
  - Main page logic: view switching, analysis state, filtering, sorting, selection, export, and navigation actions.

## Feature Tree (Imports/Exports and Connections)

```
app/competitor-gap/page.tsx
  -> components/features (barrel)
    -> src/features/competitor-gap/index.ts
      -> src/features/competitor-gap/competitor-gap-content.tsx
        -> src/features/competitor-gap/__mocks__/index.ts
          -> src/features/competitor-gap/__mocks__/gap-data.ts
        -> src/features/competitor-gap/components/index.ts
          -> analysis-form.tsx
          -> gap-analysis-table.tsx
          -> forum-intel-table.tsx
          -> state-displays.tsx
        -> src/features/competitor-gap/competitor-gap-content/index.ts
          -> components/Header.tsx
          -> components/StatsBar.tsx
          -> components/FilterBar.tsx
          -> components/ForumSearchBar.tsx
          -> hooks/useCompetitorGap.ts
          -> utils/gap-utils.ts
```

### Main Component Dependencies

- `CompetitorGapContent` uses:
  - `useCompetitorGap` for state and computed data.
  - `AnalysisForm`, `GapAnalysisTable`, `ForumIntelTable`, `EmptyState`, `LoadingState`.
  - `Header`, `GapStatsBar`, `ForumStatsBar`, `FilterBar`, `ForumSearchBar`.
  - `MOCK_GAP_DATA`, `MOCK_FORUM_INTEL_DATA`.

## UI Sections (Gap Analysis + Forum Intel)

### Global Layout

- **Header** (`src/features/competitor-gap/competitor-gap-content/components/Header.tsx`)
  - Title + description.
  - View toggle: "Competitor Gap" vs "Forum Intel (PRO)".

### Gap Analysis View

- **Analysis Form** (`src/features/competitor-gap/components/analysis-form.tsx`)
  - Inputs: Your domain, Competitor 1 (required), Competitor 2 (optional).
  - Analyze button triggers loading + demo analysis.
- **Stats Bar** (`GapStatsBar`)
  - Filters by gap type: All, Missing, Weak, Strong.
- **Filter Bar** (`src/features/competitor-gap/competitor-gap-content/components/FilterBar.tsx`)
  - Search query.
  - Quick filters (High Volume, Low KD, Trending).
  - Export CSV.
- **Table** (`GapAnalysisTable`)
  - Keyword rows with ranks, volume, difficulty, trend, and actions.
- **Empty/Loading States** (`state-displays.tsx`)
  - Shown before analysis or while loading.

### Forum Intel View

- **Forum Search Bar** (`ForumSearchBar`)
  - Input + "Find Opportunities" button (UI only).
- **Forum Stats Bar** (`ForumStatsBar`)
  - Total posts, high opportunities, engagement.
- **Filter Bar** (same component as Gap Analysis)
  - Search + quick filters + export.
- **Table** (`ForumIntelTable`)
  - Topic rows with source, engagement, competition, opportunity score, and actions.

## Gap Analysis Table Columns (Meaning + Behavior)

File: `src/features/competitor-gap/components/gap-analysis-table.tsx`

1. **Select**
   - Checkbox; supports bulk actions.
2. **Keyword**
   - Primary keyword text + Intent badge.
3. **Gap Status**
   - `GapBadge` for missing/weak/strong/shared.
4. **Rankings**
   - `RanksDisplay`: Your rank / Competitor 1 / Competitor 2.
5. **Volume**
   - Search volume (formatted K/M).
6. **Difficulty (KD)**
   - `KDBar` with difficulty level + tooltip.
7. **Trend**
   - `TrendIndicator` (rising/growing/stable/declining/falling).
8. **Actions**
   - `AITipButton` (AI suggestion).
   - `ActionsDropdown` (write article, add calendar, view SERP, copy keyword).

### Sorting

- Sortable columns: Keyword, Volume, Difficulty, Trend.
- Sorting handled by `useCompetitorGap` + `gap-utils`.

## Forum Intel Table Columns (Meaning + Behavior)

File: `src/features/competitor-gap/components/forum-intel-table.tsx`

1. **Select**
   - Checkbox; supports bulk actions.
2. **Topic/Question**
   - Discussion title.
   - “High opportunity” label when `opportunityLevel` is high.
3. **Source**
   - `SourceBadge` (platform + subSource).
4. **Engagement**
   - `EngagementDisplay` (upvotes + comments).
5. **Competition**
   - `CompetitionBadge` (low/medium/high + article count).
6. **Opportunity**
   - `OpportunityScore` (0–100 score + stars).
7. **Actions**
   - `RelatedKeywordsButton` (tooltip list + copy all).
   - `ActionsDropdown` (write, add calendar, view source).

### Sorting

- Sortable columns: Engagement, Opportunity.

## Data And State Flow

### Mock Data

- `src/features/competitor-gap/__mocks__/gap-data.ts`
  - `MOCK_GAP_DATA`: sample gap keywords.
  - `MOCK_FORUM_INTEL_DATA`: sample forum posts.

### State And Filtering

- `useCompetitorGap` manages:
  - View state (gap-analysis vs forum-intel).
  - Form inputs and loading state.
  - Search query, filter toggles, sort state.
  - Selected rows and added items.
  - Computed stats and filtered lists.

### Filtering Logic

File: `src/features/competitor-gap/competitor-gap-content/utils/gap-utils.ts`

- `filterGapKeywords`: gap type + search query.
- `sortGapKeywords`: keyword/volume/kd/rank/trend sorting.
- `filterForumPosts`: topic or subSource search.
- `sortForumPosts`: engagement or opportunity sorting.

## Actions And Navigation

File: `src/features/competitor-gap/competitor-gap-content.tsx`

- **Write Article**
  - Navigates to `/dashboard/creation/ai-writer` with URL params.
- **Add to Calendar**
  - Navigates to `/dashboard/research/content-calendar`.
- **Export**
  - Generates CSV and triggers download.

## Related Subsystems (Not Wired Into This Page)

These exist in the feature package but are not directly used on the demo page:

- `src/features/competitor-gap/components/filter-bar.tsx`
- `src/features/competitor-gap/components/keywords-table.tsx`
- `src/features/competitor-gap/components/gap-stats-cards.tsx`
- `src/features/competitor-gap/components/venn-diagram.tsx`
- `src/features/competitor-gap/components/WeakSpotDetector.tsx`

## Key Files Index

- Entry: `app/competitor-gap/page.tsx`
- Main UI: `src/features/competitor-gap/competitor-gap-content.tsx`
- State: `src/features/competitor-gap/competitor-gap-content/hooks/useCompetitorGap.ts`
- Tables: `src/features/competitor-gap/components/gap-analysis-table.tsx`, `src/features/competitor-gap/components/forum-intel-table.tsx`
- Mock Data: `src/features/competitor-gap/__mocks__/gap-data.ts`

