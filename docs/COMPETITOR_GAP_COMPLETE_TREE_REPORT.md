# 🎯 Competitor Gap Feature - Complete A-Z Report

> **Last Updated:** January 17, 2026  
> **Feature Location:** `src/features/competitor-gap/`  
> **Purpose:** Competitor keywords aur community topics se content opportunities discover karna

---

## 📁 Complete File Tree Structure

```
src/features/competitor-gap/
├── index.ts                          # Public API (barrel export)
├── competitor-gap-content.tsx        # Main orchestrator component
│
├── competitor-gap-content/           # Internal feature logic
│   ├── index.ts                      # Sub-barrel export
│   ├── components/
│   │   ├── Header.tsx                # Page header + view toggle
│   │   ├── StatsBar.tsx              # Gap/Forum stats display
│   │   ├── FilterBar.tsx             # Search + filters + export
│   │   └── ForumSearchBar.tsx        # Forum niche search
│   ├── hooks/
│   │   └── useCompetitorGap.ts       # Main state management hook
│   └── utils/
│       └── gap-utils.ts              # Filter, sort, stats utilities
│
├── components/                       # UI Components
│   ├── index.ts                      # Components barrel
│   ├── analysis-form.tsx             # Domain input form
│   ├── gap-analysis-table.tsx        # Gap keywords table
│   ├── forum-intel-table.tsx         # Forum topics table
│   ├── state-displays.tsx            # Empty/Loading states
│   ├── venn-diagram.tsx              # Overlap visualization
│   ├── gap-stats-cards.tsx           # Stats cards
│   ├── filter-bar.tsx                # Alternative filter bar
│   ├── keywords-table.tsx            # Legacy keywords table
│   ├── WeakSpotDetector.tsx          # Weak spot analysis
│   │
│   ├── gap-analysis-table/           # Gap table sub-components
│   │   ├── index.ts
│   │   ├── badges/
│   │   │   ├── IntentBadge.tsx       # Intent type badge
│   │   │   ├── GapBadge.tsx          # Gap status badge
│   │   │   └── TrendIndicator.tsx    # Trend arrow indicator
│   │   ├── displays/
│   │   │   ├── RanksDisplay.tsx      # You/C1/C2 ranks
│   │   │   ├── KDBar.tsx             # Difficulty progress bar
│   │   │   └── SortHeader.tsx        # Sortable column header
│   │   ├── actions/
│   │   │   ├── AITipButton.tsx       # AI suggestion tooltip
│   │   │   ├── ActionsDropdown.tsx   # Row actions menu
│   │   │   └── BulkActionsBar.tsx    # Multi-select actions
│   │   └── constants/
│   │       ├── intent-config.ts      # Intent styling config
│   │       ├── gap-config.ts         # Gap type styling
│   │       └── trend-config.ts       # Trend styling config
│   │
│   └── forum-intel-table/            # Forum table sub-components
│       ├── index.ts
│       ├── badges/
│       │   ├── SourceBadge.tsx       # Reddit/Quora/etc badge
│       │   ├── CompetitionBadge.tsx  # Competition level
│       │   └── OpportunityScore.tsx  # Star rating display
│       ├── displays/
│       │   ├── EngagementDisplay.tsx # Upvotes + comments
│       │   └── SortHeader.tsx        # Sortable header
│       ├── actions/
│       │   ├── RelatedKeywordsButton.tsx # Keywords tooltip
│       │   ├── ActionsDropdown.tsx   # Row actions
│       │   └── BulkActionsBar.tsx    # Multi-select bar
│       └── constants/
│           ├── source-config.ts      # Source platform styling
│           └── competition-config.ts # Competition level styling
│
├── types/                            # TypeScript definitions
│   ├── index.ts                      # Main types export
│   └── weak-spot.types.ts            # Weak spot types
│
├── constants/                        # Feature constants
│   └── index.ts                      # Presets, colors, configs
│
├── utils/                            # Utility functions
│   └── index.ts                      # Export utilities
│
└── __mocks__/                        # Mock/Demo data
    ├── index.ts
    ├── gap-data.ts                   # Gap + Forum mock data
    └── weak-spot.mock.ts             # Weak spot mock data
```

---

## 🔗 Import/Export Connection Map

### Entry Points → Feature

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ENTRY POINTS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  app/competitor-gap/page.tsx (Demo Page)                                │
│       │                                                                  │
│       ├── imports: DemoWrapper           ← components/common/            │
│       ├── imports: SidebarProvider       ← components/ui/sidebar         │
│       ├── imports: AppSidebar, TopNav    ← components/layout/            │
│       └── imports: CompetitorGapContent  ← components/features/          │
│                                                                          │
│  app/dashboard/research/gap-analysis/page.tsx (Dashboard Page)          │
│       │                                                                  │
│       ├── imports: ErrorBoundary         ← components/common/            │
│       └── imports: CompetitorGapContent  ← components/features/          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BARREL EXPORT CHAIN                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  components/features/index.ts                                            │
│       │                                                                  │
│       └── re-exports: CompetitorGapContent, WeakSpotDetector            │
│                       ↑                                                  │
│                       │                                                  │
│  src/features/competitor-gap/index.ts (Public API)                      │
│       │                                                                  │
│       ├── exports: CompetitorGapContent                                  │
│       ├── exports: Types (GapKeyword, ForumIntelPost, Intent, etc.)     │
│       ├── exports: Constants (VOLUME_PRESETS, GAP_TYPE_COLORS, etc.)    │
│       ├── exports: Utils (filterKeywords, sortKeywords, etc.)           │
│       ├── exports: Components (VennDiagram, GapStatsCards, etc.)        │
│       └── exports: Mock Data (MOCK_GAP_DATA, WEAK_SPOT_DATA)            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Main Component Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│              competitor-gap-content.tsx (MAIN COMPONENT)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  IMPORTS FROM competitor-gap-content/index.ts:                          │
│  ├── Header                    # View toggle UI                          │
│  ├── GapStatsBar              # Gap statistics bar                       │
│  ├── ForumStatsBar            # Forum statistics bar                     │
│  ├── FilterBar                # Search & filter controls                 │
│  ├── ForumSearchBar           # Forum niche search                       │
│  └── useCompetitorGap         # State management hook                    │
│                                                                          │
│  IMPORTS FROM components/index.ts:                                       │
│  ├── GapAnalysisTable         # Main gap keywords table                  │
│  ├── ForumIntelTable          # Forum topics table                       │
│  ├── AnalysisForm             # Domain input form                        │
│  ├── EmptyState               # No results UI                            │
│  └── LoadingState             # Loading spinner UI                       │
│                                                                          │
│  IMPORTS FROM __mocks__/index.ts:                                        │
│  ├── MOCK_GAP_DATA            # 20 sample gap keywords                   │
│  └── MOCK_FORUM_INTEL_DATA    # 13 sample forum posts                    │
│                                                                          │
│  EXTERNAL IMPORTS:                                                       │
│  ├── useRouter                ← next/navigation                          │
│  ├── toast                    ← sonner                                   │
│  ├── TooltipProvider          ← @/components/ui/tooltip                  │
│  └── STACK_SPACING            ← @/src/styles                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hook Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    useCompetitorGap.ts (MAIN HOOK)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  IMPORTS:                                                                │
│  ├── useState, useMemo, useCallback  ← react                            │
│  ├── GapKeyword, ForumIntelPost      ← ../../types                      │
│  ├── SortField, SortDirection        ← ../../types                      │
│  └── gap-utils functions             ← ../utils/gap-utils               │
│      ├── calculateGapStats                                               │
│      ├── filterGapKeywords                                               │
│      ├── filterForumPosts                                                │
│      ├── sortGapKeywords                                                 │
│      ├── sortForumPosts                                                  │
│      └── formatNumber                                                    │
│                                                                          │
│  STATE MANAGED:                                                          │
│  ├── mainView           # "gap-analysis" | "forum-intel"                │
│  ├── yourDomain         # User's domain input                            │
│  ├── competitor1/2      # Competitor domain inputs                       │
│  ├── isLoading          # Loading state                                  │
│  ├── hasAnalyzed        # Analysis complete flag                         │
│  ├── gapFilter          # "all" | "missing" | "weak" | "strong"         │
│  ├── searchQuery        # Text search                                    │
│  ├── selectedGapRows    # Set<string> selected IDs                       │
│  ├── selectedForumRows  # Set<string> selected IDs                       │
│  ├── addedKeywords      # Set<string> calendar added IDs                 │
│  ├── gapSortField       # Current sort column                            │
│  └── gapSortDirection   # "asc" | "desc"                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Table Component Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   GapAnalysisTable.tsx IMPORTS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FROM gap-analysis-table/index.ts:                                       │
│  ├── IntentBadge         # Shows: informational/commercial/etc           │
│  ├── GapBadge            # Shows: missing/weak/strong/shared             │
│  ├── TrendIndicator      # Shows: rising/growing/stable/declining        │
│  ├── RanksDisplay        # Shows: You/C1/C2 position numbers             │
│  ├── KDBar               # Shows: Difficulty progress bar 0-100          │
│  ├── SortHeader          # Clickable sortable column header              │
│  ├── AITipButton         # AI suggestion tooltip with actions            │
│  ├── ActionsDropdown     # Write/Calendar/SERP/Copy menu                 │
│  └── BulkActionsBar      # Multi-select action bar                       │
│                                                                          │
│  EXTERNAL:                                                               │
│  ├── Checkbox            ← @/components/ui/checkbox                      │
│  ├── Tooltip             ← @/components/ui/tooltip                       │
│  └── cn                  ← @/lib/utils                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   ForumIntelTable.tsx IMPORTS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FROM forum-intel-table/index.ts:                                        │
│  ├── SourceBadge           # Shows: Reddit/Quora/StackOverflow/etc       │
│  ├── CompetitionBadge      # Shows: Low/Medium/High + article count      │
│  ├── OpportunityScore      # Shows: Star rating 0-100                    │
│  ├── EngagementDisplay     # Shows: Upvotes + Comments                   │
│  ├── SortHeader            # Clickable sortable header                   │
│  ├── RelatedKeywordsButton # Shows related keywords tooltip              │
│  ├── ActionsDropdown       # Write/Calendar/ViewSource menu              │
│  └── BulkActionsBar        # Multi-select action bar                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Page Sections (UI Layout)

### Section 1: Header
**File:** `competitor-gap-content/components/Header.tsx`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🗡️ Gap Analysis                                                        │
│  Discover competitor keywords & community opportunities                  │
│                                                                          │
│  ┌──────────────────┐  ┌────────────────────┐                           │
│  │ ⚔️ Competitor Gap │  │ 💬 Forum [PRO]     │  ← View Toggle            │
│  └──────────────────┘  └────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Kaam:**
- Page title aur description show karta hai
- 2 views ke beech toggle: Gap Analysis vs Forum Intel
- Forum view pe "PRO" badge dikhata hai

---

### Section 2: Analysis Form (Gap Mode Only)
**File:** `components/analysis-form.tsx`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  YOUR DOMAIN          COMPETITOR 1        COMPETITOR 2        ACTION    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────┐ │
│  │ 🎯 myblog.com  │  │ ⚠️ techcrunch  │  │ ⚠️ theverge    │  │Analyze│ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └───────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Kaam:**
- User apna domain enter karta hai
- 1-2 competitor domains enter karta hai
- "Find Missing Keywords" button click pe analysis start hota hai

---

### Section 3: Forum Search Bar (Forum Mode Only)
**File:** `competitor-gap-content/components/ForumSearchBar.tsx`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  ┌─────────────────────┐        │
│  │ 🔍 Enter your niche or topic...   │  │ 📈 Find Opportunities│        │
│  └────────────────────────────────────┘  └─────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Kaam:**
- Niche/topic search karne ke liye input
- Currently UI only (handler not wired)

---

### Section 4: Stats Bar
**File:** `competitor-gap-content/components/StatsBar.tsx`

**Gap Mode Stats:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐                     │
│  │📊 All  │  │⚠️ Missing│  │🎯 Weak │  │🏆 Strong│  ← Clickable Filters │
│  │  20    │  │    8     │  │   5    │  │    4    │                     │
│  └────────┘  └──────────┘  └────────┘  └─────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Forum Mode Stats:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────┐  ┌──────────────┐                   │
│  │👥 Total  │  │⚡ High Opportunity│  │🔥 Engagement │                   │
│  │   13     │  │        5         │  │    12.4K     │                   │
│  └──────────┘  └─────────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Kaam:**
- Real-time statistics dikhata hai
- Gap mode me filter buttons ki tarah kaam karta hai
- Click karke specific category filter kar sakte ho

---

### Section 5: Filter Bar
**File:** `competitor-gap-content/components/FilterBar.tsx`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────┐     ┌──────────────┐  ┌────────────┐       │
│  │ 🔍 Search keywords...  │     │⚙️ Filters (0)│  │📥 Export   │       │
│  └────────────────────────┘     └──────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Filter Options:**
- High Volume (>1K)
- Low Difficulty (<30)
- Trending Keywords

**Kaam:**
- Text search across keywords/topics
- Quick filter toggles
- CSV export functionality

---

### Section 6: Data Tables
**See detailed table sections below**

---

### Section 7: Empty/Loading States
**File:** `components/state-displays.tsx`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                          🎯                                              │
│                                                                          │
│                   Enter domains above                                    │
│               to discover keyword gaps                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Kaam:**
- Jab analysis nahi hua: Empty state dikhe
- Jab loading ho raha: Spinner dikhe

---

## 📊 Gap Analysis Table - Columns Detail

**File:** `components/gap-analysis-table.tsx`

| # | Column | Component | Data Type | Kaam |
|---|--------|-----------|-----------|------|
| 1 | **Select** | `Checkbox` | boolean | Row selection for bulk actions |
| 2 | **Keyword** | `IntentBadge` | string + Intent | Keyword text + intent type badge |
| 3 | **Gap Status** | `GapBadge` | GapType | Missing/Weak/Strong/Shared indicator |
| 4 | **Rankings** | `RanksDisplay` | numbers | You/C1/C2 positions side by side |
| 5 | **Volume** | `SortHeader` | number | Monthly search volume (K/M format) |
| 6 | **Difficulty** | `KDBar` | 0-100 | Visual progress bar + number |
| 7 | **Trend** | `TrendIndicator` | TrendDirection | Arrow icon for trend direction |
| 8 | **Actions** | Multiple | - | AI tip + dropdown menu |

### Column Details:

#### 1. Select Checkbox
```tsx
<Checkbox 
  checked={selectedRows.has(keyword.id)}
  onCheckedChange={(checked) => onSelectRow(keyword.id, !!checked)}
/>
```
- Multiple rows select kar sakte ho
- Bulk add to calendar ke liye

#### 2. Keyword + Intent Badge
```
┌────────────────────────────────────────┐
│ best ai writing tools 2024            │
│ 💰 Commercial                         │
└────────────────────────────────────────┘
```
**Intent Types:**
- 💰 Commercial (buying intent)
- 📚 Informational (learning intent)
- 🛒 Transactional (action intent)
- 🧭 Navigational (brand search)

#### 3. Gap Status Badge
```
┌──────────┐  ┌────────┐  ┌─────────┐  ┌────────┐
│⚠️ Missing│  │🎯 Weak │  │🏆 Strong│  │⚡ Shared│
└──────────┘  └────────┘  └─────────┘  └────────┘
  (Red)        (Yellow)    (Green)      (Blue)
```
**Meanings:**
- **Missing:** Aap rank nahi karte, competitor karta hai
- **Weak:** Aap rank karte ho but competitor se neeche
- **Strong:** Aap competitor se upar rank karte ho
- **Shared:** Similar rankings

#### 4. Rankings Display
```
┌────────────────────────────┐
│  You  /  C1  /  C2        │
│  [—]  /  [3] /  [8]       │
│ (gray)  (red)  (orange)   │
└────────────────────────────┘
```
- Color-coded boxes
- "—" if not ranking
- Green if top 10

#### 5. Volume (Sortable)
```
┌──────────┐
│  8.1K    │  ← Formatted number
└──────────┘
```
- Click to sort asc/desc
- K = thousands, M = millions

#### 6. Difficulty Bar (KD)
```
┌────────────────────────────┐
│ [████████░░░░░░░░░░░░] 24  │
│        Easy (Green)        │
└────────────────────────────┘
```
**Difficulty Levels:**
- 0-29: Easy (Green)
- 30-49: Medium (Yellow)
- 50-69: Hard (Orange)
- 70-100: Very Hard (Red)

#### 7. Trend Indicator
```
┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
│ 🚀 │  │ ↗️ │  │ ➡️ │  │ ↘️ │  │ 📉 │
│Rise│  │Grow│  │Stbl│  │Decl│  │Fall│
└────┘  └────┘  └────┘  └────┘  └────┘
```

#### 8. Actions
```
┌──────────────────────────────────────┐
│  [✨ AI Tip]  [⋯ More]               │
└──────────────────────────────────────┘
```

**AI Tip Button (✨):**
- Hover pe AI suggestion tooltip
- "Write Article" button
- "Copy" tip text

**Actions Dropdown (⋯):**
- ✏️ Write Article → Opens AI Writer
- 📅 Add to Calendar → Content calendar
- 🔗 View in Google → Opens SERP
- 📋 Copy Keyword → Clipboard

---

## 💬 Forum Intel Table - Columns Detail

**File:** `components/forum-intel-table.tsx`

| # | Column | Component | Data Type | Kaam |
|---|--------|-----------|-----------|------|
| 1 | **Select** | `Checkbox` | boolean | Row selection |
| 2 | **Topic/Question** | text | string | Discussion topic |
| 3 | **Source** | `SourceBadge` | ForumSource | Platform + subreddit |
| 4 | **Engagement** | `EngagementDisplay` | numbers | Upvotes + Comments |
| 5 | **Competition** | `CompetitionBadge` | level + count | Low/Med/High + articles |
| 6 | **Opportunity** | `OpportunityScore` | 0-100 | Star rating |
| 7 | **Actions** | Multiple | - | Keywords + dropdown |

### Column Details:

#### 2. Topic/Question
```
┌────────────────────────────────────────────────┐
│ What's the best AI writing tool for SEO        │
│ content in 2024?                               │
│ ✨ High opportunity                            │
└────────────────────────────────────────────────┘
```

#### 3. Source Badge
```
┌─────────────────┐
│ 🌐 Reddit       │
│ r/SEO           │
└─────────────────┘
```
**Sources:**
- 🌐 Reddit (orange)
- ❓ Quora (red)
- 💻 Stack Overflow (amber)
- 📰 Hacker News (orange)
- ▶️ YouTube (red)

#### 4. Engagement Display
```
┌─────────────────────────────┐
│  [⬆️ 342]  [💬 89]          │
│  🔥 Hot topic               │
└─────────────────────────────┘
```
- "Hot topic" badge if >1000 total

#### 5. Competition Badge
```
┌─────────────────┐
│ ✅ Low          │
│ 📄 2 articles   │
└─────────────────┘
```
**Levels:**
- ✅ Low (Green) - Great opportunity
- ⚠️ Medium (Yellow)
- ❌ High (Red)

#### 6. Opportunity Score
```
┌─────────────────┐
│ ⭐⭐⭐⭐⭐       │
│    95/100       │
└─────────────────┘
```
**Score Ranges:**
- 80-100: Excellent (Green)
- 60-79: Good (Green)
- 40-59: Fair (Yellow)
- 0-39: Low (Red)

#### 7. Actions
```
┌──────────────────────────────────────┐
│  [🔑 Keywords]  [⋯ More]             │
└──────────────────────────────────────┘
```

**Related Keywords Button (🔑):**
- Hover pe related keywords list
- Volume shown for each
- "Copy All" button

**Actions Dropdown (⋯):**
- ✏️ Write Article
- 📅 Add to Content Calendar
- 🔗 View Original Discussion

---

## ⚙️ Data Flow & Behavior

### Analysis Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User enters domains                                                  │
│     ↓                                                                    │
│  2. Clicks "Find Missing Keywords"                                       │
│     ↓                                                                    │
│  3. handleAnalyze() in useCompetitorGap                                 │
│     ↓                                                                    │
│  4. setIsLoading(true) → 1.5s delay (simulated)                         │
│     ↓                                                                    │
│  5. setHasAnalyzed(true)                                                │
│     ↓                                                                    │
│  6. MOCK_GAP_DATA displayed in table                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Filter Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FILTER CHAIN                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MOCK_GAP_DATA (20 keywords)                                            │
│     ↓                                                                    │
│  filterGapKeywords(data, gapFilter, searchQuery)                        │
│     ↓ (filter by type: all/missing/weak/strong)                         │
│     ↓ (filter by search query match)                                    │
│  sortGapKeywords(filtered, sortField, sortDirection)                    │
│     ↓                                                                    │
│  filteredGapKeywords → displayed in table                               │
│                                                                          │
│  ⚠️ NOTE: showHighVolume, showLowKD, showTrending toggles               │
│     are stored in state but NOT applied to filtering!                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Action Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ACTION HANDLERS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Write Article:                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ handleWriteArticle(keyword) {                                    │   │
│  │   router.push('/dashboard/creation/ai-writer?' + params)         │   │
│  │   // params: keyword, volume, difficulty, intent, cpc            │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Add to Calendar:                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ handleAddToRoadmap(keyword) {                                    │   │
│  │   setAddedKeywords(prev => new Set([...prev, keyword.id]))       │   │
│  │   toast.success("Added to Content Calendar")                     │   │
│  │   // Action button: "View Calendar" link                         │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Export CSV:                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ handleExport() {                                                 │   │
│  │   // Creates CSV with columns:                                   │   │
│  │   // Keyword, Gap Type, Your Rank, Comp1 Rank, Volume, KD, etc   │   │
│  │   blob = new Blob([csv], { type: 'text/csv' })                   │   │
│  │   // Auto-download triggered                                     │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Types Reference

### GapKeyword
```typescript
interface GapKeyword {
  id: string                    // Unique identifier
  keyword: string               // The keyword text
  intent: Intent                // commercial/informational/transactional/navigational
  gapType: GapType              // missing/weak/strong/shared
  yourRank: number | null       // Your ranking position (null = not ranking)
  comp1Rank: number | null      // Competitor 1 rank
  comp2Rank: number | null      // Competitor 2 rank
  volume: number                // Monthly search volume
  kd: number                    // Keyword difficulty 0-100
  cpc?: number                  // Cost per click (optional)
  trend: TrendDirection         // rising/growing/stable/declining/falling
  aiTip?: string                // AI-generated content suggestion
  yourUrl?: string              // Your ranking URL
  comp1Url?: string             // Competitor 1 URL
  comp2Url?: string             // Competitor 2 URL
  source: CompetitorSource      // comp1/comp2/both
}
```

### ForumIntelPost
```typescript
interface ForumIntelPost {
  id: string                    // Unique identifier
  topic: string                 // Discussion topic/question
  source: ForumSource           // reddit/quora/stackoverflow/hackernews/youtube
  subSource: string             // Specific community (r/SEO, etc)
  upvotes: number               // Upvote count
  comments: number              // Comment count
  existingArticles: number      // Competing articles count
  competitionLevel: CompetitionLevel  // low/medium/high
  opportunityScore: number      // 0-100 score
  opportunityLevel: OpportunityLevel  // high/medium/low
  relatedKeywords: RelatedKeyword[]   // Related keywords with volumes
  lastActive: Date              // Last activity date
  url: string                   // Original discussion URL
}
```

---

## 🎯 Feature Purpose (Why This Was Built)

### Problem Statement
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Content creators ko ye problems hote hain:                             │
│                                                                          │
│  1. ❓ Pata nahi kaunse keywords pe competitors rank kar rahe hain      │
│  2. ❓ Pata nahi kahan content gap hai market me                        │
│  3. ❓ Community me kya trending topics hain                            │
│  4. ❓ Kaunse topics pe competition kam hai                             │
│  5. ❓ Quick way to create content from discovered opportunities        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Solution Provided
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Competitor Gap feature ye solve karta hai:                             │
│                                                                          │
│  ✅ Gap Analysis:                                                        │
│     - Competitor domains compare karke                                   │
│     - Missing keywords identify karna                                    │
│     - Weak positions find karna                                          │
│     - Strong positions maintain karna                                    │
│                                                                          │
│  ✅ Forum Intelligence:                                                  │
│     - Reddit, Quora, StackOverflow, HackerNews, YouTube se topics        │
│     - Engagement metrics (upvotes, comments)                             │
│     - Competition level assessment                                       │
│     - Opportunity scoring                                                │
│                                                                          │
│  ✅ Actionable Workflow:                                                 │
│     - AI-generated content tips                                          │
│     - One-click AI Writer integration                                    │
│     - Content calendar scheduling                                        │
│     - CSV export for external tools                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Target Users
- **Bloggers:** Content ideas ke liye
- **SEO Professionals:** Keyword gap analysis ke liye
- **Content Marketers:** Content planning ke liye
- **Digital Agencies:** Client competitor research ke liye

### Key Value Propositions
1. **Time Saving:** Manual research hours → minutes me data
2. **Data-Driven:** Guesswork instead of data pe decisions
3. **Actionable:** See → Plan → Create workflow
4. **Comprehensive:** Keywords + Community, dono covered

---

## ⚠️ Current Limitations & Notes

| Issue | Description | Status |
|-------|-------------|--------|
| Mock Data | Real API integration nahi hai, demo data use ho raha | 🟡 Planned |
| Forum Search | Input hai but handler wired nahi | 🔴 Not Working |
| Quick Filters | High Volume/Low KD/Trending state me store but filter nahi apply | 🔴 Not Working |
| Bulk Actions | Forum table me bulk calendar add ka handler missing | 🟡 Partial |

---

## 🔧 Files Summary Table

| File | Purpose | Exports |
|------|---------|---------|
| `index.ts` | Public API barrel | All public exports |
| `competitor-gap-content.tsx` | Main component | `CompetitorGapContent` |
| `useCompetitorGap.ts` | State hook | `useCompetitorGap` |
| `gap-utils.ts` | Utilities | filter, sort, stats functions |
| `types/index.ts` | Type definitions | All interfaces |
| `gap-data.ts` | Mock data | `MOCK_GAP_DATA`, `MOCK_FORUM_INTEL_DATA` |
| `gap-analysis-table.tsx` | Gap table | `GapAnalysisTable` |
| `forum-intel-table.tsx` | Forum table | `ForumIntelTable` |
| `analysis-form.tsx` | Domain form | `AnalysisForm` |
| `Header.tsx` | Page header | `Header` |
| `StatsBar.tsx` | Statistics | `GapStatsBar`, `ForumStatsBar` |
| `FilterBar.tsx` | Filters | `FilterBar` |

---

**Report Complete ✅**

*Ye report Competitor Gap feature ka A-Z documentation hai. Isme file structure, import/export connections, UI sections, table columns, data flow, aur feature purpose sab kuchh covered hai.*
