# 🔍 "AM I CITED?" FEATURE - DEEP-DIVE FORENSIC AUDIT

> **Feature Path:** `/dashboard/research/citation-checker`  
> **Feature Folder:** `src/features/citation-checker/`  
> **Audit Date:** 2026-01-15  
> **Status:** 🟡 UI-COMPLETE, BACKEND NOT IMPLEMENTED

---

## 📋 EXECUTIVE SUMMARY

The **"Am I Cited?"** feature is a bulk citation checker that helps users determine if their domain is being cited in Google's AI Overviews for their target keywords. The feature has a **beautifully designed UI** with comprehensive components for displaying citation analysis, trends, competitor comparisons, and recommendations.

### 🚨 CRITICAL FINDING

**100% MOCK DATA** - The entire feature runs on hardcoded mock data generators. There are:
- ❌ **NO API routes** for citation checking
- ❌ **NO server actions** for this feature
- ❌ **NO database tables** for storing citation data
- ❌ **NO real DataForSEO SERP API integration**
- ❌ **NO credit/auth system integration**

This is a **presentation-only prototype** - all data is randomly generated client-side.

---

## 📁 COMPLETE FILE TREE

```
src/features/citation-checker/
├── index.ts                          # Barrel export (CitationCheckerContent + types)
├── citation-checker-content.tsx      # Main page component (105 lines)
├── types/
│   └── index.ts                      # Local type definitions (65 lines)
├── components/
│   ├── index.ts                      # Components barrel export
│   ├── citation-card.tsx             # Individual citation display (196 lines)
│   ├── citation-filters.tsx          # Search & filter controls (122 lines)
│   ├── citation-list.tsx             # Citations list container (35 lines)
│   ├── citation-score-ring.tsx       # SVG score ring visualization (48 lines)
│   ├── page-header.tsx               # Page title + domain input (44 lines)
│   ├── sidebar-panels.tsx            # 4 sidebar panels (145 lines)
│   ├── status-badge.tsx              # Citation status badge (27 lines)
│   └── summary-cards.tsx             # Summary statistics grid (72 lines)
├── constants/
│   └── index.ts                      # Mock keywords, competitors, snippets (94 lines)
├── utils/
│   └── citation-utils.ts             # Sorting, filtering, helpers (203 lines)
└── __mocks__/
    └── citation-data.ts              # Mock data generators (210 lines)

Related Global Files:
├── src/app/dashboard/research/citation-checker/page.tsx  # Route page
├── lib/citation-analyzer.ts                               # Duplicate mock generator (350 lines)
├── types/citation.types.ts                                # Global types + helpers (250 lines)
└── components/features/citation-checker/index.ts          # Re-export barrel
```

**Total Feature Files:** 17 files  
**Total Lines of Code:** ~1,500 lines (UI + mocks + types)

---

## 🎨 UI & INTERACTION INVENTORY

### Page Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│ PageHeader                                                               │
│ ┌─────────────────────────────────────────────┬───────────────────────┐ │
│ │ 🔮 Am I Cited?                              │ [domain input] [Check] │ │
│ │ Check if Google's AI Overview cites you    │                        │ │
│ └─────────────────────────────────────────────┴───────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ SummaryCards                                                             │
│ ┌──────────────┬────────────────────────────────────────────────────┐   │
│ │ Score Ring   │ Keywords | AI Overview | Cited | Rate | Partial    │   │
│ │   [42]       │   20     |     17      |   6   | 35%  |    2       │   │
│ │  "Fair"      │ Not Cited | Avg Position | Opportunities            │   │
│ │              │     9     |     #2.1     |      7                   │   │
│ └──────────────┴────────────────────────────────────────────────────┘   │
├───────────────────────────────────────────┬─────────────────────────────┤
│ Main Content (2/3 width)                  │ Sidebar (1/3 width)         │
│ ┌───────────────────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ CitationFilters                       │ │ │ ⚡ Recommendations      │ │
│ │ [🔍 Search...] [Filter ▼] [Sort ▼]    │ │ │ • Focus on authoritative│ │
│ └───────────────────────────────────────┘ │ │ • Target missed keywords│ │
│ ┌───────────────────────────────────────┐ │ └─────────────────────────┘ │
│ │ CitationList                          │ │ ┌─────────────────────────┐ │
│ │ ┌─────────────────────────────────┐   │ │ │ 🎯 Missed Opportunities │ │
│ │ │ CitationCard                    │   │ │ │ • "what is seo" 110K    │ │
│ │ │ "what is seo" | 110K vol        │   │ │ │ • "seo tools" 33K       │ │
│ │ │ [AI Overview] [Cited ✓] #1      │   │ │ └─────────────────────────┘ │
│ │ │ Est. Traffic: 16,500            │   │ │ ┌─────────────────────────┐ │
│ │ └─────────────────────────────────┘   │ │ │ 🏆 Top Competitors      │ │
│ │ ┌─────────────────────────────────┐   │ │ │ 1. ahrefs.com 65%       │ │
│ │ │ CitationCard                    │   │ │ │ 2. semrush.com 58%      │ │
│ │ │ "seo tools" | 33K vol           │   │ │ │ 3. moz.com 52%          │ │
│ │ │ [AI Overview] [Not Cited ✗]     │   │ │ └─────────────────────────┘ │
│ │ └─────────────────────────────────┘   │ │ ┌─────────────────────────┐ │
│ │ ... more citation cards               │ │ │ 📊 Citation Trend       │ │
│ └───────────────────────────────────────┘ │ │ [▓▓▓▓▓▓▓░░] 6mo chart   │ │
│                                           │ └─────────────────────────┘ │
└───────────────────────────────────────────┴─────────────────────────────┘
```

### Component Breakdown

#### 1. **PageHeader** (`page-header.tsx`)
- Title with Quote icon (purple accent)
- Domain input field with globe icon
- "Check Citations" button
- **No real action** - just triggers mock data regeneration

#### 2. **SummaryCards** (`summary-cards.tsx`)
- **Citation Score Ring**: SVG circular progress (0-100)
- **8 Stat Cards**: Keywords Checked, With AI Overview, Cited, Citation Rate, Partial, Not Cited, Avg Position, Opportunities
- Uses `calculateCitationScore()` for weighted score (70% rate + 30% position)

#### 3. **CitationFilters** (`citation-filters.tsx`)
- **Search Input**: Filter keywords by text
- **Status Filter Dropdown**: cited/partial/not-cited/unknown
- **"Only With AI Overview"** toggle
- **Sort Dropdown**: Volume/Status/Position/Traffic + Asc/Desc

#### 4. **CitationList** (`citation-list.tsx`)
- Empty state with Quote icon
- Maps `citations` array to `CitationCard` components

#### 5. **CitationCard** (`citation-card.tsx`)
- **Header Row**: Keyword name + trend icon (↑/↓/−/✨)
- **Badges**: Volume, AI Overview presence, Status badge
- **Position Indicator**: #1, #2, #3 with color coding
- **Traffic Value**: Estimated monthly traffic from citation
- **Expandable Details**: Snippet preview, cited domains list, competitor analysis

#### 6. **Sidebar Panels** (`sidebar-panels.tsx`)
- **RecommendationsPanel**: AI-generated tips based on citation rate
- **MissedOpportunitiesPanel**: High-volume keywords where not cited
- **TopCompetitorsPanel**: Domains cited most often for your keywords
- **CitationTrendPanel**: 6-month bar chart of citation rate

---

## 🔢 DATA LOGIC ANALYSIS

### State Management (Client-Side Only)

```typescript
// citation-checker-content.tsx
const [domain, setDomain] = useState("myblog.com")
const [inputDomain, setInputDomain] = useState("myblog.com")
const [analysis, setAnalysis] = useState(() => generateCitationAnalysis("myblog.com"))

// Filter state
const [searchQuery, setSearchQuery] = useState("")
const [sortBy, setSortBy] = useState<SortByOption>("volume")
const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
const [statusFilter, setStatusFilter] = useState<CitationStatus[]>([])
const [showOnlyWithAI, setShowOnlyWithAI] = useState(false)
```

### Mock Data Generation Flow

```
User enters domain → handleCheckDomain() → generateCitationAnalysis(domain)
                                                    │
                                                    ▼
                                    generateMockCitations(domain)
                                    ┌─────────────────────────────────┐
                                    │ For each MOCK_KEYWORD (20):     │
                                    │ 1. Random AI Overview presence  │
                                    │    (based on aiChance: 65-95%)  │
                                    │ 2. Random citation status:      │
                                    │    - 35% cited                  │
                                    │    - 10% partial                │
                                    │    - 55% not-cited              │
                                    │ 3. Random position (top/mid/bot)│
                                    │ 4. Random competitor domains    │
                                    │ 5. Random trend direction       │
                                    └─────────────────────────────────┘
                                                    │
                                                    ▼
                                    calculateSummary(citations)
                                    ┌─────────────────────────────────┐
                                    │ Aggregates all citation stats:  │
                                    │ - Total keywords, AI presence   │
                                    │ - Cited/partial/not-cited counts│
                                    │ - Citation rate percentage      │
                                    │ - Average position              │
                                    │ - Top competitors frequency     │
                                    └─────────────────────────────────┘
```

### Mock Constants (`constants/index.ts`)

```typescript
export const MOCK_KEYWORDS = [
  { keyword: "what is seo", volume: 110000, aiChance: 0.95 },
  { keyword: "how to do keyword research", volume: 22000, aiChance: 0.88 },
  { keyword: "best seo tools", volume: 33000, aiChance: 0.75 },
  // ... 17 more SEO-related keywords
]

export const COMPETITOR_DOMAINS = [
  "ahrefs.com", "semrush.com", "moz.com", "backlinko.com", 
  "neilpatel.com", "searchenginejournal.com", "searchengineland.com",
  "wordstream.com", "hubspot.com", "contentmarketinginstitute.com"
]

export const AI_OVERVIEW_SNIPPETS = [
  "SEO (Search Engine Optimization) is the practice of...",
  "Keyword research involves finding and analyzing...",
  // ... 3 more generic snippets
]
```

### Citation Score Calculation

```typescript
// utils/citation-utils.ts
export function calculateCitationScore(summary: CitationSummary): number {
  const rateScore = summary.citationRate * 0.7  // 70% weight
  const positionScore = Math.max(0, (5 - summary.avgPosition) / 5) * 30  // 30% weight
  return Math.round(rateScore + positionScore)
}

// Score Thresholds
SCORE_THRESHOLDS = {
  excellent: 50,  // Green
  good: 30,       // Yellow
  fair: 15,       // Orange
  poor: 0         // Red
}
```

### Traffic Value Estimation

```typescript
// CTR multipliers by citation position
export const CTR_MULTIPLIERS = {
  top: 0.15,      // 15% CTR for top citation
  middle: 0.08,   // 8% for middle
  bottom: 0.04,   // 4% for bottom
  inline: 0.06,   // 6% for inline
  default: 0.05
}

export function calculateCitationValue(citation: Citation): number {
  if (!citation.aiOverviewPresent || citation.citationStatus === "not-cited") {
    return 0
  }
  const ctrMultiplier = citation.position 
    ? CTR_MULTIPLIERS[citation.position] 
    : CTR_MULTIPLIERS.default
  return Math.floor(citation.searchVolume * ctrMultiplier)
}
```

---

## 🗃️ DATABASE SCHEMA ANALYSIS

### Current State: **NO DATABASE TABLES EXIST**

The Prisma schema (`prisma/schema.prisma`) contains **no citation-related models**:

```prisma
// ❌ MISSING - These tables would be needed:

model CitationCheck {
  id            String   @id @default(cuid())
  userId        String
  domain        String
  keyword       String
  aiOverview    Boolean
  citationStatus String  // cited/not-cited/partial
  position      String?  // top/middle/bottom/inline
  citedDomains  Json     // Array of domains
  snippetText   String?
  checkedAt     DateTime
  
  @@index([userId, domain])
  @@index([keyword])
}

model CitationHistory {
  id            String   @id @default(cuid())
  userId        String
  domain        String
  citationRate  Float
  keywordsCited Int
  totalKeywords Int
  recordedAt    DateTime
  
  @@index([userId, domain, recordedAt])
}
```

---

## 🔌 API & SERVICES ANALYSIS

### Current State: **NO API ROUTES EXIST**

| Expected Route | Status | Purpose |
|----------------|--------|---------|
| `POST /api/citation-checker/check` | ❌ MISSING | Bulk check keywords for citations |
| `GET /api/citation-checker/history` | ❌ MISSING | Get historical citation data |
| `POST /api/citation-checker/analyze` | ❌ MISSING | Full citation analysis |

### What Would Be Needed

To make this feature functional, you'd need:

1. **DataForSEO SERP API Integration**
   - Endpoint: `POST https://api.dataforseo.com/v3/serp/google/organic/live/advanced`
   - Query each keyword and extract AI Overview data
   - Parse AI Overview text for domain citations

2. **Service Layer** (`services/citation.service.ts`)
   ```typescript
   // DOES NOT EXIST - Would need:
   export async function checkKeywordCitations(keywords: string[], domain: string) {
     // 1. Batch SERP queries to DataForSEO
     // 2. Extract AI Overview from results
     // 3. Parse citations from AI Overview text
     // 4. Return structured citation data
   }
   ```

3. **Server Action** (`actions/check-citations.ts`)
   ```typescript
   // DOES NOT EXIST - Would need:
   export const checkCitations = authAction
     .schema(citationCheckSchema)
     .action(async ({ parsedInput, ctx }) => {
       // 1. Auth check
       // 2. Credit deduction
       // 3. Call service
       // 4. Store results
       // 5. Return analysis
     })
   ```

---

## ⚠️ ISSUES & MISSING LINKS

### 🔴 CRITICAL ISSUES

| Issue | Severity | Description |
|-------|----------|-------------|
| No Real API | 🔴 Critical | Feature is 100% mock data - completely non-functional |
| No Database | 🔴 Critical | No tables to store citation checks or history |
| No Auth Integration | 🔴 Critical | No credit deduction, no user-specific data |
| No DataForSEO Integration | 🔴 Critical | The SERP API that provides AI Overview data is not connected |

### 🟡 MODERATE ISSUES

| Issue | Severity | Description |
|-------|----------|-------------|
| Duplicate Mock Code | 🟡 Moderate | `lib/citation-analyzer.ts` duplicates `__mocks__/citation-data.ts` |
| Duplicate Types | 🟡 Moderate | `types/citation.types.ts` duplicates `src/features/citation-checker/types/index.ts` |
| Hardcoded Keywords | 🟡 Moderate | Only 20 mock keywords - no dynamic keyword input |
| No Keyword Upload | 🟡 Moderate | No CSV import or bulk keyword entry |

### 🟢 MINOR ISSUES

| Issue | Severity | Description |
|-------|----------|-------------|
| No Loading States | 🟢 Minor | No skeleton loaders while "checking" |
| No Error Handling | 🟢 Minor | No error boundaries for API failures |
| No Refresh Action | 🟢 Minor | No way to re-check specific keywords |

---

## 🆚 COMPARISON: AI VISIBILITY vs AM I CITED?

| Aspect | AI Visibility | Am I Cited? |
|--------|---------------|-------------|
| **Folder** | `src/features/ai-visibility/` | `src/features/citation-checker/` |
| **API Routes** | ✅ Yes (3 routes) | ❌ None |
| **Server Actions** | ✅ Yes (5 actions) | ❌ None |
| **Services** | ✅ 7 service files | ❌ None |
| **Database** | ✅ Uses `trackerResults` JSON | ❌ No persistence |
| **Credit System** | ✅ Deducts credits | ❌ No credit integration |
| **Real Data** | ✅ OpenRouter APIs | ❌ 100% mock |
| **Demo Mode** | ✅ Has demo toggle | ❌ Always "demo" |

---

## 🛠️ IMPLEMENTATION ROADMAP

### Phase 1: Backend Foundation (Priority: HIGH)

```
[ ] 1. Create Prisma models for CitationCheck, CitationHistory
[ ] 2. Run prisma db push
[ ] 3. Create service: src/features/citation-checker/services/citation.service.ts
[ ] 4. Integrate DataForSEO SERP API for AI Overview detection
[ ] 5. Create server action: src/features/citation-checker/actions/check-citations.ts
```

### Phase 2: API Integration (Priority: HIGH)

```
[ ] 6. Create POST /api/citation-checker/check route
[ ] 7. Create GET /api/citation-checker/history route
[ ] 8. Add credit deduction logic
[ ] 9. Add rate limiting
```

### Phase 3: UI Enhancements (Priority: MEDIUM)

```
[ ] 10. Add loading skeletons
[ ] 11. Add keyword upload (CSV)
[ ] 12. Add "Re-check" button per keyword
[ ] 13. Add date range filter for trends
[ ] 14. Add export functionality
```

### Phase 4: Cleanup (Priority: LOW)

```
[ ] 15. Remove duplicate lib/citation-analyzer.ts
[ ] 16. Remove duplicate types/citation.types.ts
[ ] 17. Add real historical trend tracking
[ ] 18. Add email alerts for citation changes
```

---

## 🔗 TYPE DEFINITIONS REFERENCE

### Core Types (`types/index.ts`)

```typescript
type CitationStatus = "cited" | "not-cited" | "partial" | "unknown"
type CitationPosition = "top" | "middle" | "bottom" | "inline"
type CitationTrend = "improving" | "declining" | "stable" | "new"
type SortByOption = "volume" | "status" | "position" | "traffic"
type SortOrder = "asc" | "desc"

interface Citation {
  id: string
  keyword: string
  searchVolume: number
  aiOverviewPresent: boolean
  citationStatus: CitationStatus
  citedDomains: string[]
  position?: CitationPosition
  snippetPreview?: string
  yourPosition?: number
  totalCitations: number
  competitorsCited: string[]
  lastChecked: string
  trend: CitationTrend
}

interface CitationSummary {
  totalKeywordsChecked: number
  keywordsWithAIOverview: number
  keywordsCited: number
  keywordsPartialCited: number
  keywordsNotCited: number
  citationRate: number
  avgPosition: number
  topCompetitors: { domain: string; count: number }[]
  opportunityKeywords: number
}

interface CitationAnalysis {
  domain: string
  summary: CitationSummary
  citations: Citation[]
  topCitedKeywords: Citation[]
  missedOpportunities: Citation[]
  competitorComparison: CompetitorComparison[]
  lastAnalyzed: string
}
```

---

## 📊 METRICS & STATS

| Metric | Value |
|--------|-------|
| Total Files | 17 |
| Total Lines of Code | ~1,500 |
| Components | 9 |
| Utility Functions | 15+ |
| Mock Keywords | 20 |
| Mock Competitors | 10 |
| API Routes | 0 |
| Server Actions | 0 |
| Database Tables | 0 |
| Backend Completeness | 0% |
| UI Completeness | 95% |
| Overall Readiness | 15% |

---

## 📝 CONCLUSION

The **"Am I Cited?"** feature has an **excellent, production-ready UI** with thoughtful design, comprehensive filtering, sorting, and visualization components. However, it is fundamentally a **frontend prototype** with:

- **Zero backend implementation**
- **Zero real data integration**
- **Zero database persistence**

To ship this feature, the team must:
1. Integrate DataForSEO SERP API to detect AI Overviews
2. Build citation parsing logic to extract domain mentions
3. Create database schema for storing checks and history
4. Wire up the UI to real server actions with credit deduction

**Estimated effort to production-ready:** 2-3 weeks for a single developer.

---

*Report generated by BlogSpy Code Auditor*  
*Last updated: 2026-01-15*
