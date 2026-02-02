# 🔬 Keyword Explorer Forensic Audit Report

> **Date:** 2026-01-21  
> **Auditor:** Senior QA Automation Engineer & Algorithm Auditor  
> **Target:** `src/features/keyword-research` (All components, utils, services)

---

## 📋 Executive Summary

| Zone | Status | Summary |
|------|--------|---------|
| **ZONE 1: Math & Algorithms** | ✅ PASS | RTV, GEO, WeakSpot logic is sound |
| **ZONE 2: Filter Engine** | ✅ PASS | Client-side filtering with proper OR/AND logic |
| **ZONE 3: Table & Display** | ✅ PASS | Numeric sorting, sparkline handles edge cases |
| **ZONE 4: Execution & Security** | ✅ PASS | Credit deduction BEFORE fetch, button disabled |

---

## 🔍 ZONE 1: PROPRIETARY MATH & ALGORITHMS

### 1.1 RTV (Realizable Traffic Value) Formula

**File:** `utils/rtv-calculator.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Sound mathematical implementation |

#### Extracted Formula:

```typescript
// Line 227: CORE RTV CALCULATION
const rtv = Math.floor(volume * (1 - cappedLoss / 100))
```

#### Loss Rules Applied:

| SERP Feature | Loss % | Condition |
|--------------|--------|-----------|
| `ai_overview` | **50%** | Always applied |
| `local_pack` | **30%** | Always applied |
| `featured_snippet` | **20%** | **ONLY if no AI Overview** ❗ |
| `ads_top` / `shopping_ads` / `CPC > $1` | **15%** | Any of these triggers |
| `video_pack` | **10%** | Always applied |
| **MAX CAP** | **85%** | Losses are clamped |

#### Verification:
- ✅ `-50%` penalty for AI Overview correctly applied
- ✅ Math is `Volume × (1 - TotalLoss%)` confirmed
- ✅ Featured Snippet skipped when AI Overview present (prevents double-counting)
- ✅ Breakdown is **scaled proportionally** if total exceeds 85% cap (line 218-223)

```typescript
// Line 177-178: CRITICAL CONDITIONAL LOGIC
if (hasSnippet && !hasAi) {  // Featured Snippet ONLY if no AI
  totalLoss += LOSS_RULES.featured_snippet.loss
}
```

---

### 1.2 GEO Score Formula

**File:** `utils/geo-calculator.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Score correctly checks for AIO and Snippets |

#### Extracted Formula:

```typescript
// Lines 18-36: GEO SCORE CALCULATION
let score = 0
if (hasAIO) score += 40        // AI Overview presence
if (hasSnippet) score += 30    // Featured Snippet presence
if (intent === "informational") score += 20
if (intent === "commercial") score += 10
if (wordCount >= 5) score += 10  // Long-tail bonus
return clamp(score, 0, 100)
```

#### Component Weights:

| Component | Points | Source |
|-----------|--------|--------|
| AI Overview | +40 | `hasAIO` boolean |
| Featured Snippet | +30 | `hasSnippet` boolean |
| Informational Intent | +20 | Intent string/array |
| Commercial Intent | +10 | Intent string/array |
| Long-tail (≥5 words) | +10 | Word count |

#### Verification:
- ✅ Specifically checks for Featured Snippets (+30)
- ✅ Specifically checks for AI Overviews (+40)
- ✅ Score clamped to 0-100 range
- ✅ Supports both string intents and array of codes (`I`, `C`, `T`, `N`)

---

### 1.3 Weak Spot Detection

**File:** `utils/weak-spot-detector.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Domain matching is correct and strict |

#### Exact Weak Spot Domains:

```typescript
// Line 12-18: DOMAIN WHITELIST
const WEAK_SPOT_DOMAINS: ReadonlyArray<string> = [
  "reddit.com",
  "quora.com",
  "pinterest.com",
  "linkedin.com",
  "medium.com",
]
```

#### Detection Logic:

```typescript
// Line 53: HOSTNAME MATCHING
const matched = WEAK_SPOT_DOMAINS.find((domain) => 
  hostname === domain || hostname.endsWith(`.${domain}`)
)
```

#### Verification:
- ✅ Inspects **Top 10** SERP results (line 45: `slice(0, 10)`)
- ✅ Matches exact domain OR subdomain (e.g., `www.reddit.com` matches)
- ✅ Extracts hostname from URL correctly (removes `www.` prefix)
- ✅ Returns earliest rank position where weak spot appears
- ✅ Includes LinkedIn and Medium (beyond Reddit/Quora)

---

### 1.4 YouTube Intelligence Engine

**File:** `utils/youtube-intelligence.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Comprehensive analysis with clear thresholds |

#### Win Probability Formula:

```typescript
// Line 248: WIN PROBABILITY CALCULATION
const rawScore = 20 + (15 * weakCount) + (10 * outdatedCount) + (5 * viralCount)
const score = Math.max(0, Math.min(100, rawScore)) // Clamped 0-100
```

#### Thresholds Verified:

| Metric | Threshold | Purpose |
|--------|-----------|---------|
| `WEAK_COMPETITOR_SUBS` | 1,000 | Channels under this = weak |
| `OUTDATED_DAYS` | 730 (2 years) | Videos older = outdated |
| `VIRAL_THRESHOLD` | 5 | Views/Subs ratio > 5 = viral |
| `AUTHORITY_THRESHOLD` | 100,000 | Channels over = authority wall |

---

## 🔍 ZONE 2: FILTER LOGIC

### 2.1 Server vs Client Filtering

**Files:** `actions/fetch-keywords.ts`, `utils/filter-utils.ts`

| Verdict | ⚠️ WARNING |
|---------|-----------|
| **Finding:** | Filters applied **CLIENT-SIDE** after data fetch |

#### Analysis:

```typescript
// fetch-keywords.ts Line 44-92: SERVER ACTION
// Only fetches data, NO filtering on server
export const fetchKeywords = publicAction
  .schema(FetchKeywordsSchema)
  .action(async ({ parsedInput }) => {
    // Returns MOCK_KEYWORDS directly, no filtering
    return { success: true, data: MOCK_KEYWORDS }
  })
```

```typescript
// filter-utils.ts Line 522-604: CLIENT-SIDE FILTERING
export function applyFilters(keywords: Keyword[], filters: Partial<FilterState>): Keyword[]
```

**Impact:**
- ⚠️ For large datasets (10k+ keywords), this could cause performance issues
- ✅ For demo/mock data (~50 keywords), this is acceptable
- **Recommendation:** Add server-side pagination/filtering for production API

---

### 2.2 Intent Filter Logic

**File:** `utils/filter-utils.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Uses **OR** logic correctly |

```typescript
// Line 268-277: INTENT FILTER - OR LOGIC
return keywords.filter(k => {
  // Keyword can have multiple intents, check if ANY matches
  if (!k.intent || k.intent.length === 0) return false
  
  return k.intent.some(intent => {  // ANY match = true (OR logic)
    const normalizedIntent = normalize(intent)
    return normalizedIntents.includes(normalizedIntent)
  })
})
```

#### Verification:
- ✅ Multiple selected intents use **OR** logic (any match passes)
- ✅ Empty selection = show all (no filtering)
- ✅ Case-insensitive comparison

---

### 2.3 Range Filters (Volume, KD, CPC)

**File:** `utils/filter-utils.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Inclusive ranges with proper edge case handling |

```typescript
// Line 105-113: RANGE CHECK HELPER
function isInRange(
  value: number | null | undefined,
  min: number,
  max: number,
  fallback: number = 0
): boolean {
  const safeValue = safeNumber(value, fallback)
  return safeValue >= min && safeValue <= max  // INCLUSIVE
}
```

```typescript
// Line 177-187: VOLUME FILTER
export function filterByVolume(keywords: Keyword[], volumeRange: [number, number]): Keyword[] {
  const [min, max] = volumeRange
  if (min <= 0 && max >= 10000000) return keywords  // Skip if full range
  return keywords.filter(k => isInRange(k.volume, min, max, 0))
}
```

#### Verification:
- ✅ Handles `null`/`undefined` values with fallback (0 for volume/KD/CPC)
- ✅ Uses **inclusive** ranges (`>=` and `<=`)
- ✅ Optimization: Skips filtering when full range selected
- ✅ GEO Score uses fallback of 50 (neutral)

---

### 2.4 Include/Exclude Terms Logic

| Verdict | ✅ PASS |
|---------|---------|

```typescript
// Line 447-451: INCLUDE = AND LOGIC
return normalizedTerms.every(term => keywordText.includes(term))

// Line 479-481: EXCLUDE = OR LOGIC  
return !normalizedTerms.some(term => keywordText.includes(term))
```

---

## 🔍 ZONE 3: TABLE & COLUMN LOGIC

### 3.1 Trend Visualization

**File:** `components/table/columns/trend/trend-column.tsx`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Handles missing data correctly |

```typescript
// Line 25-27: MISSING DATA HANDLING
if (!data || data.length === 0) {
  return <span className="text-muted-foreground">—</span>
}
```

```typescript
// Line 29-32: TREND CALCULATION
const first = data[0]
const last = data[data.length - 1]
const change = first > 0 ? ((last - first) / first) * 100 : 0  // Division-by-zero safe!
const trend = change > 5 ? "up" : change < -5 ? "down" : "stable"
```

#### Sparkline Rendering:

```typescript
// Line 43-49: SPARKLINE SVG POINTS
const points = data
  .map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  })
  .join(" ")
```

#### Verification:
- ✅ Handles empty array → shows dash
- ✅ Division-by-zero protected (`first > 0` check)
- ✅ Accepts any array length (not just 12)
- ✅ SVG polyline correctly maps data points

---

### 3.2 Sorting (RTV & Numeric Fields)

**File:** `utils/sort-utils.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | NUMERIC sorting, not string |

```typescript
// Line 20-32: SORT BY NUMERIC FIELDS
switch (field) {
  case "volume":
    comparison = a.volume - b.volume    // NUMERIC!
    break
  case "kd":
    comparison = a.kd - b.kd            // NUMERIC!
    break
  case "cpc":
    comparison = a.cpc - b.cpc          // NUMERIC!
    break
  case "trend":
    // Calculates growth percentage for sorting
    const aTrendGrowth = a.trend?.length > 1 && a.trend[0] > 0
      ? ((a.trend[a.trend.length - 1] - a.trend[0]) / a.trend[0])
      : 0
    const bTrendGrowth = b.trend?.length > 1 && b.trend[0] > 0
      ? ((b.trend[b.trend.length - 1] - b.trend[0]) / b.trend[0])
      : 0
    comparison = aTrendGrowth - bTrendGrowth  // NUMERIC!
    break
}
```

#### Verification:
- ✅ Volume, KD, CPC use **numeric subtraction** (not string comparison)
- ✅ Trend sorting uses calculated growth percentage
- ✅ Direction reversal applied correctly (`direction === "asc" ? comparison : -comparison`)

**⚠️ Note:** RTV and GEO Score are NOT in the SortField type - sorting by these columns may not be implemented yet. This is a **functional gap**, not a bug.

---

## 🔍 ZONE 4: EXECUTION TIMING & SECURITY

### 4.1 Double-Click Prevention

**File:** `components/search/keyword-search-form.tsx`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Button disabled during loading |

```typescript
// Line 220-236: ANALYZE BUTTON
<Button
  type="submit"
  disabled={isLoading || !keyword.trim()}  // ✅ DISABLED DURING LOADING
  className="..."
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Analyzing...
    </>
  ) : (
    <>
      <Sparkles className="mr-2 h-4 w-4" />
      Analyze
    </>
  )}
</Button>
```

```typescript
// Line 127: INPUT ALSO DISABLED
disabled={isLoading}
```

#### Verification:
- ✅ Button disabled when `isLoading=true`
- ✅ Input field also disabled during loading
- ✅ Visual feedback with spinner icon

---

### 4.2 Credit Deduction Timing

**File:** `actions/fetch-keywords.ts`

| Verdict | ✅ PASS |
|---------|---------|
| **Logic:** | Credits deducted **BEFORE** data fetch |

```typescript
// Line 176-191: BULK SEARCH WITH CREDITS
export const bulkSearchKeywords = authenticatedAction
  .schema(BulkSearchSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { keyword, country } = parsedInput

    // STEP 1: DEDUCT CREDITS FIRST (ATOMIC)
    const balance = await deductCreditsAtomic(ctx.userId, ctx.idempotencyKey)
    
    // STEP 2: FETCH DATA AFTER DEDUCTION
    const keywords = await MockKeywordProvider.getKeywords(keyword, country)

    return { success: true, data: keywords, balance }
  })
```

```typescript
// Line 118-157: ATOMIC CREDIT DEDUCTION
async function deductCreditsAtomic(userId: string, idempotencyKey: string | null): Promise<number> {
  const { data, error } = await supabase.rpc("deduct_credits_atomic", {
    p_user_id: userId,
    p_amount: 1,
    p_idempotency_key: idempotencyKey,  // ✅ IDEMPOTENCY PROTECTED
  })
  
  if (error?.message?.includes("INSUFFICIENT_CREDITS")) {
    throw new Error("INSUFFICIENT_CREDITS")
  }
}
```

#### Security Flow:

```
1. User clicks "Analyze"
   ↓
2. authenticatedAction validates session
   ↓
3. Check for bot_trap (honeypot)
   ↓
4. deductCreditsAtomic() CALLED FIRST
   ↓
5. If insufficient → throws error (no data returned)
   ↓
6. ONLY THEN → fetch keywords
```

#### Verification:
- ✅ Credit check happens **BEFORE** API call
- ✅ Atomic RPC ensures no race conditions
- ✅ Idempotency key prevents duplicate charges
- ✅ Bot trap (honeypot field) for bot detection

---

### 4.3 Additional Security Measures

**File:** `lib/safe-action.ts`

| Feature | Status |
|---------|--------|
| Honeypot field (`bot_trap`) | ✅ Implemented |
| Idempotency key | ✅ From header or input |
| Auth middleware | ✅ Validates session |
| Rate limiting | ✅ 10 req/min per user |

```typescript
// Line 35-46: BOT DETECTION
function hasHoneytokenValue(parsedInput: unknown): boolean {
  const value = (parsedInput as Record<string, unknown>).bot_trap
  return String(value).trim().length > 0  // If filled = BOT
}
```

---

## 📊 Summary Table

| Check | File | Status | Notes |
|-------|------|--------|-------|
| RTV Formula | `rtv-calculator.ts` | ✅ PASS | `Volume × (1 - Loss%)` with 85% cap |
| AI Overview Penalty | `rtv-calculator.ts` | ✅ PASS | -50% correctly applied |
| Featured Snippet Logic | `rtv-calculator.ts` | ✅ PASS | Skipped when AIO present |
| GEO Score Formula | `geo-calculator.ts` | ✅ PASS | Checks AIO (+40) and Snippet (+30) |
| Weak Spot Detection | `weak-spot-detector.ts` | ✅ PASS | Top 10, domain matching |
| Intent Filter | `filter-utils.ts` | ✅ PASS | OR logic for multiple |
| Volume/KD/CPC Range | `filter-utils.ts` | ✅ PASS | Inclusive, handles null |
| Filter Location | `filter-utils.ts` | ⚠️ WARNING | Client-side only |
| Trend Sparkline | `trend-column.tsx` | ✅ PASS | Handles empty/missing data |
| Numeric Sorting | `sort-utils.ts` | ✅ PASS | Uses subtraction, not string compare |
| Double-Click Prevention | `keyword-search-form.tsx` | ✅ PASS | Button disabled on loading |
| Credit Timing | `fetch-keywords.ts` | ✅ PASS | Deduct → Fetch (correct order) |
| Bot Protection | `safe-action.ts` | ✅ PASS | Honeypot implemented |

---

## 🔧 Recommendations

1. **Add RTV/GEO to SortField type** - Currently not sortable
2. **Move filtering to server** for production (pagination)
3. **Add unit tests** for `calculateRtv()` edge cases
4. **Add error boundary** for sparkline rendering failures

---

> **Audit Complete.** No critical bugs found. Math is mathematically sound. Security timing is correct.
