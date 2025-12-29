# 🤖 BlogSpy AI Visibility - Complete Feature Finalization

> **Date:** December 27, 2025  
> **Status:** Planning & Finalization  
> **Priority:** HIGH (USP Feature)

---

## 📋 CURRENT STATE vs REALISTIC STATE

### What's Currently Planned (DOCUMENT):
```
AI Platforms to Track:
1. Google AI Overviews
2. ChatGPT
3. Gemini
4. Perplexity
5. Claude
6. Microsoft Copilot
```

### What's ACTUALLY Possible (REALITY):

| Platform | API Available | Citation Tracking | Feasibility | Priority |
|----------|--------------|-------------------|-------------|----------|
| **Google AI Overviews** | ✅ DataForSEO includes it | ✅ Full support | ✅ EASY | P0 |
| **Perplexity** | ✅ API available | ✅ Sources shown | ✅ EASY | P0 |
| **ChatGPT** | ❌ No citation API | ⚠️ Manual queries | ⚠️ HARD | P2 |
| **Gemini** | ❌ No citation API | ⚠️ Manual queries | ⚠️ HARD | P2 |
| **Claude** | ❌ No citation API | ❌ No sources shown | ❌ NOT POSSIBLE | SKIP |
| **Microsoft Copilot** | ❌ No public API | ⚠️ Manual only | ❌ NOT POSSIBLE | SKIP |
| **DeepSeek** | ✅ API available | ⚠️ Limited | ⚠️ MEDIUM | P1 |
| **Grok** | ❌ X Premium only | ❌ No API | ❌ NOT POSSIBLE | SKIP |

---

## 🎯 FINAL DECISION: AI Visibility Feature Scope

### Phase 1 (MVP Launch) - 2 Platforms
```
✅ Google AI Overviews (via DataForSEO)
✅ Perplexity (via API)
```

### Phase 2 (Post-Launch) - Add 2 More
```
⏸️ ChatGPT (manual query approach)
⏸️ DeepSeek (API)
```

### SKIP (Not Feasible)
```
❌ Gemini (no reliable API)
❌ Claude (doesn't cite sources)
❌ Microsoft Copilot (no API)
❌ Grok (X Premium only)
```

---

## 📱 AI VISIBILITY PAGE - COMPLETE UI BREAKDOWN

### Page Layout Structure:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI VISIBILITY DASHBOARD                          │
│         "Track how AI Agents recommend & sell you."                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   VISIBILITY    │  │    CITATION     │  │   AI SHARE OF   │         │
│  │     SCORE       │  │     COUNT       │  │      VOICE      │         │
│  │      72/100     │  │       847       │  │      23.5%      │         │
│  │   ▲ +5 vs last  │  │   ▲ +124 this   │  │   vs 3 comps    │         │
│  │      week       │  │      month      │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    PLATFORM BREAKDOWN                             │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                      │  │
│  │  │ Google AI        │  │ Perplexity       │                      │  │
│  │  │ Overviews        │  │                  │                      │  │
│  │  │ ████████░░ 78%   │  │ ██████░░░░ 65%   │                      │  │
│  │  │ 523 citations    │  │ 324 citations    │                      │  │
│  │  └──────────────────┘  └──────────────────┘                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  TABS: [Overview] [Keywords] [Competitors] [Alerts] [Optimize]   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 FEATURE BREAKDOWN - TAB BY TAB

### TAB 1: Overview (Default View)

**Components:**

#### 1.1 Visibility Score Card
```typescript
interface VisibilityScore {
  score: number           // 0-100
  change: number          // vs last period
  trend: "up" | "down" | "stable"
  lastUpdated: Date
}
```

**What it shows:**
- Overall AI visibility score (0-100)
- Week-over-week change
- Trend arrow (↑/↓/→)
- Last scan timestamp

#### 1.2 Citation Count Card
```typescript
interface CitationStats {
  total: number
  thisMonth: number
  lastMonth: number
  change: number          // percentage
  byPlatform: {
    googleAIO: number
    perplexity: number
  }
}
```

#### 1.3 AI Share of Voice Card
```typescript
interface ShareOfVoice {
  yourShare: number       // percentage
  competitors: {
    domain: string
    share: number
  }[]
  totalQueries: number
}
```

#### 1.4 Platform Performance Chart
- Bar chart showing citations per platform
- Line chart showing trend over time (30 days)
- Pie chart for share distribution

#### 1.5 Recent Citations Feed
```typescript
interface RecentCitation {
  query: string
  platform: "google_aio" | "perplexity"
  position: number        // 1st, 2nd, 3rd cited
  timestamp: Date
  url: string             // your cited URL
  snippet: string         // how you were mentioned
}
```

---

### TAB 2: Keywords

**Purpose:** Track which keywords trigger AI citations

#### 2.1 Keyword Table
| Column | Description |
|--------|-------------|
| Keyword | The search query |
| Platform | Which AI cited you |
| Position | Citation position (1st, 2nd, etc.) |
| Frequency | How often cited |
| Your URL | Which page was cited |
| Last Seen | When last cited |
| Status | ✅ Cited / ❌ Not Cited / ⚠️ Competitor Cited |

#### 2.2 Add Keywords Section
```typescript
interface TrackedKeyword {
  id: string
  keyword: string
  platforms: ("google_aio" | "perplexity")[]
  frequency: "daily" | "weekly" | "monthly"
  status: "active" | "paused"
  lastChecked: Date
  results: CitationResult[]
}
```

#### 2.3 Bulk Import
- CSV upload
- Paste keywords (one per line)
- Import from Keyword Magic

#### 2.4 Filters
- By platform
- By citation status
- By date range
- By position

---

### TAB 3: Competitors

**Purpose:** Compare your AI visibility vs competitors

#### 3.1 Competitor Cards
```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR DOMAIN: blogspy.io                                        │
│  ████████████████████░░░░ 72/100                               │
├─────────────────────────────────────────────────────────────────┤
│  COMPETITOR 1: ahrefs.com                                       │
│  ████████████████████████████ 95/100  ← You're losing here     │
├─────────────────────────────────────────────────────────────────┤
│  COMPETITOR 2: semrush.com                                      │
│  ████████████████████████░░ 85/100                             │
├─────────────────────────────────────────────────────────────────┤
│  COMPETITOR 3: moz.com                                          │
│  ██████████████████░░░░░░ 68/100  ← You're winning here        │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2 Head-to-Head Comparison
- Select 2 domains
- See which keywords each is cited for
- Gap analysis: keywords where competitor is cited but you're not

#### 3.3 Competitor Add
- Add up to 5 competitors (Pro)
- Add up to 20 competitors (Enterprise)

---

### TAB 4: Alerts

**Purpose:** Get notified of visibility changes

#### 4.1 Alert Types
| Alert | Trigger | Channel |
|-------|---------|---------|
| **New Citation** | You get cited for new keyword | Email, In-app |
| **Lost Citation** | You lose a citation | Email, In-app |
| **Competitor Cited** | Competitor cited, you're not | Email |
| **Position Change** | Citation position changed | In-app |
| **Weekly Digest** | Summary of all changes | Email |

#### 4.2 Alert Settings
```typescript
interface AlertSettings {
  newCitation: boolean
  lostCitation: boolean
  competitorCited: boolean
  positionChange: boolean
  weeklyDigest: boolean
  emailAddress: string
  slackWebhook?: string
}
```

---

### TAB 5: Optimize (GEO Recommendations)

**Purpose:** Actionable tips to improve AI visibility

#### 5.1 Optimization Score
```
Your GEO Score: 65/100

Areas to Improve:
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Content Structure     [45/100]  → Add more FAQ sections      │
│ ⚠️ Entity Coverage       [55/100]  → Mention more entities      │
│ ✅ Freshness             [85/100]  → Good! Keep updating        │
│ ⚠️ Citation Worthiness   [60/100]  → Add more statistics        │
│ ✅ E-E-A-T Signals        [80/100]  → Strong author presence     │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.2 Page-Level Recommendations
For each tracked URL:
- What's working (why it's cited)
- What to improve (why it's not cited for some keywords)
- Suggested content additions

#### 5.3 GEO Optimization Checklist
```
□ Add FAQ schema to all blog posts
□ Include statistics with sources
□ Use clear, concise answer paragraphs
□ Add author bio with credentials
□ Update content within last 6 months
□ Include comparison tables
□ Add "What is X" definitions
□ Use numbered lists for how-to content
```

---

## 🔌 DATA SOURCES & API INTEGRATION

### Platform 1: Google AI Overviews

**API:** DataForSEO SERP API
**Endpoint:** Already includes AI Overview data

```typescript
// DataForSEO SERP API Response includes:
interface SerpResult {
  ai_overview?: {
    items: {
      type: string
      text: string
      references: {
        source: string        // Domain name
        url: string           // Full URL
        title: string         // Page title
      }[]
    }[]
  }
}
```

**Cost:** Included in SERP API ($0.002/query)
**Frequency:** Check each keyword weekly

**Implementation:**
```typescript
// services/ai-visibility/google-aio.service.ts
export async function checkGoogleAIOCitation(
  keyword: string,
  domain: string
): Promise<CitationResult> {
  const serpData = await dataForSEO.serp.google.organic({
    keyword,
    location: "United States",
    language: "en"
  })
  
  const aiOverview = serpData.ai_overview
  if (!aiOverview) return { cited: false, hasAIO: false }
  
  const citation = aiOverview.items
    .flatMap(item => item.references)
    .find(ref => ref.source.includes(domain))
  
  return {
    cited: !!citation,
    hasAIO: true,
    position: citation ? getPosition(aiOverview, domain) : null,
    url: citation?.url,
    snippet: citation?.title
  }
}
```

---

### Platform 2: Perplexity

**API:** Perplexity API (pplx-api)
**Endpoint:** https://api.perplexity.ai/chat/completions

```typescript
// Perplexity API Response includes sources
interface PerplexityResponse {
  id: string
  choices: {
    message: {
      content: string
      role: string
    }
  }[]
  citations: string[]    // Array of source URLs
}
```

**Cost:** $0.20 per 1M tokens (~$0.0002 per query)
**Frequency:** Check each keyword weekly

**Implementation:**
```typescript
// services/ai-visibility/perplexity.service.ts
export async function checkPerplexityCitation(
  keyword: string,
  domain: string
): Promise<CitationResult> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: keyword }],
      return_citations: true
    })
  })
  
  const data = await response.json()
  const citation = data.citations?.find(url => url.includes(domain))
  
  return {
    cited: !!citation,
    position: citation ? data.citations.indexOf(citation) + 1 : null,
    url: citation,
    snippet: extractSnippet(data.choices[0].message.content, domain)
  }
}
```

---

## 💾 DATABASE SCHEMA

```prisma
// prisma/schema.prisma - AI Visibility Models

model AIVisibilityKeyword {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  keyword     String
  platforms   String[] // ["google_aio", "perplexity"]
  frequency   String   @default("weekly") // daily, weekly, monthly
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  project     Project? @relation(fields: [projectId], references: [id])
  results     AIVisibilityResult[]
}

model AIVisibilityResult {
  id          String   @id @default(cuid())
  keywordId   String
  platform    String   // google_aio, perplexity
  cited       Boolean
  hasAIResult Boolean  @default(true) // Does the query have AI response
  position    Int?     // 1st, 2nd, 3rd citation
  citedUrl    String?
  snippet     String?
  checkedAt   DateTime @default(now())
  
  keyword     AIVisibilityKeyword @relation(fields: [keywordId], references: [id])
  
  @@index([keywordId, platform, checkedAt])
}

model AIVisibilityCompetitor {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  domain      String
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}

model AIVisibilityAlert {
  id          String   @id @default(cuid())
  userId      String
  type        String   // new_citation, lost_citation, competitor_cited
  keywordId   String
  platform    String
  message     String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 📊 METRICS & CALCULATIONS

### Visibility Score Calculation (0-100)

```typescript
function calculateVisibilityScore(results: AIVisibilityResult[]): number {
  const totalKeywords = results.length
  const citedKeywords = results.filter(r => r.cited).length
  
  // Base score: citation rate
  const citationRate = (citedKeywords / totalKeywords) * 100
  
  // Position bonus: higher positions = better score
  const positionBonus = results
    .filter(r => r.cited && r.position)
    .reduce((sum, r) => {
      if (r.position === 1) return sum + 10
      if (r.position === 2) return sum + 5
      if (r.position === 3) return sum + 2
      return sum
    }, 0)
  
  // Cap at 100
  return Math.min(100, Math.round(citationRate + positionBonus / totalKeywords))
}
```

### AI Share of Voice Calculation

```typescript
function calculateShareOfVoice(
  yourCitations: number,
  competitorCitations: { domain: string; count: number }[]
): number {
  const totalCitations = yourCitations + 
    competitorCitations.reduce((sum, c) => sum + c.count, 0)
  
  return totalCitations > 0 
    ? Math.round((yourCitations / totalCitations) * 100 * 10) / 10
    : 0
}
```

---

## 💰 CREDIT SYSTEM FOR AI VISIBILITY

| Action | Credits | Explanation |
|--------|---------|-------------|
| Add keyword to tracking | 0 | Free |
| Check 1 keyword on Google AIO | 1 | SERP API call |
| Check 1 keyword on Perplexity | 1 | Perplexity API call |
| Bulk check (10 keywords) | 8 | Discounted |
| Competitor analysis (1 competitor) | 5 | Multiple API calls |
| Weekly auto-check (per keyword) | 1 | Scheduled job |

### Plan Limits

| Plan | Keywords Tracked | Competitors | Check Frequency |
|------|------------------|-------------|-----------------|
| FREE | 10 | 1 | Weekly |
| PRO | 100 | 5 | Daily |
| ENTERPRISE | Unlimited | 20 | Hourly |

---

## 🎨 UI COMPONENTS NEEDED

### New Components to Create:

```
src/features/ai-visibility/
├── components/
│   ├── AIVisibilityDashboard.tsx      # Main page
│   ├── VisibilityScoreCard.tsx        # Score display
│   ├── CitationCountCard.tsx          # Citation stats
│   ├── ShareOfVoiceCard.tsx           # SoV comparison
│   ├── PlatformBreakdown.tsx          # Platform cards
│   ├── CitationTable.tsx              # Keywords table
│   ├── CompetitorComparison.tsx       # Competitor view
│   ├── AlertSettings.tsx              # Alert config
│   ├── OptimizationPanel.tsx          # GEO tips
│   ├── AddKeywordModal.tsx            # Add keywords
│   ├── BulkImportModal.tsx            # CSV import
│   └── CitationTrendChart.tsx         # Trend visualization
├── hooks/
│   ├── useAIVisibility.ts             # Main data hook
│   ├── useCitationCheck.ts            # Check citations
│   └── useCompetitorAnalysis.ts       # Competitor data
├── services/
│   ├── google-aio.service.ts          # Google AIO API
│   ├── perplexity.service.ts          # Perplexity API
│   └── ai-visibility.service.ts       # Combined service
├── types/
│   └── index.ts                       # TypeScript types
└── constants/
    └── index.ts                       # Constants
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Week 1: Core Setup
- [ ] Database schema migration
- [ ] Basic API routes
- [ ] Google AIO integration (via DataForSEO)
- [ ] Dashboard layout

### Week 2: Features
- [ ] Perplexity integration
- [ ] Keyword tracking table
- [ ] Citation checking logic
- [ ] Score calculation

### Week 3: Polish
- [ ] Competitor comparison
- [ ] Alert system
- [ ] Optimization tips
- [ ] Charts & visualizations

### Week 4: Testing
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Credit system integration
- [ ] Documentation

---

## ❓ OPEN QUESTIONS

1. **Check Frequency:** Daily vs Weekly for free tier?
2. **Historical Data:** How long to store? (30 days, 90 days, 1 year?)
3. **Export:** Allow CSV/PDF export of citation data?
4. **White Label:** Should competitors see their own brand?

---

*This document will be updated as we finalize features.*
