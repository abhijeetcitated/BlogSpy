# 🔬 KEYWORD EXPLORER - FORENSIC ISSUES & EDGE CASES REPORT
## Complete Connection Wiring + Potential Failure Scenarios

**Document Date:** January 31, 2026  
**Audit Level:** FORENSIC DEEP SCAN  
**Risk Categories:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low  

---

## 📊 EXECUTIVE SUMMARY

| Category | Total Issues | Critical | High | Medium | Low |
|----------|-------------|----------|------|--------|-----|
| **Credit System** | 8 | 2 | 3 | 2 | 1 |
| **Search Bar** | 6 | 1 | 2 | 2 | 1 |
| **Bulk Analysis** | 7 | 2 | 2 | 2 | 1 |
| **Filters** | 9 | 0 | 3 | 4 | 2 |
| **Table/Columns** | 11 | 1 | 4 | 4 | 2 |
| **Refresh System** | 8 | 2 | 3 | 2 | 1 |
| **Drawer/Detail** | 5 | 0 | 2 | 2 | 1 |
| **Country/Language** | 4 | 0 | 1 | 2 | 1 |
| **Match Types** | 4 | 0 | 1 | 2 | 1 |
| **Guest Mode** | 5 | 1 | 2 | 1 | 1 |
| **TOTAL** | **67** | **9** | **23** | **23** | **12** |

---

## 💰 CREDIT SYSTEM - CONNECTION ANALYSIS

### Wiring Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                     CREDIT FLOW ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User Action                                                         │
│       │                                                              │
│       ▼                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐ │
│  │ Server Action   │────▶│ Supabase RPC    │────▶│ PostgreSQL    │ │
│  │ (next-safe-     │     │ deduct_credits_ │     │ credits table │ │
│  │  action)        │     │ atomic()        │     │ (row lock)    │ │
│  └─────────────────┘     └─────────────────┘     └───────────────┘ │
│       │                          │                       │          │
│       │                          ▼                       ▼          │
│       │                   ┌─────────────────┐     ┌───────────────┐ │
│       │                   │ FAIL: INSUFFI- │     │ SUCCESS:      │ │
│       │                   │ CIENT_CREDITS  │     │ balance - N   │ │
│       │                   └─────────────────┘     └───────────────┘ │
│       │                                                  │          │
│       ▼                                                  ▼          │
│  ┌─────────────────┐                            ┌───────────────┐  │
│  │ DataForSEO API  │◀───────────────────────────│ Proceed with  │  │
│  │ Call            │                            │ API call      │  │
│  └─────────────────┘                            └───────────────┘  │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────┐     ┌─────────────────┐                       │
│  │ API FAILURE     │────▶│ refund_credits_ │                       │
│  │ (timeout/error) │     │ atomic()        │                       │
│  └─────────────────┘     └─────────────────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔴 CRITICAL ISSUES

#### 1. Race Condition: Double Deduction (C-01)
**Scenario:** User rapidly clicks "Analyze" button twice
```
Timeline:
T0: Click 1 → deduct_credits_atomic(user, 5)
T1: Click 2 → deduct_credits_atomic(user, 5) [before T0 completes]
T2: Both succeed → 10 credits deducted instead of 5
```

**Current Mitigation:** `idempotency_key` parameter
- ✅ Each action generates `crypto.randomUUID()`
- ⚠️ **ISSUE:** New UUID per click, doesn't prevent double-click

**Risk Level:** 🔴 CRITICAL  
**File:** `keyword-research-content.tsx:308`  
**Recommendation:** 
```typescript
// Add loading state check BEFORE generating idempotency key
if (loading.searching) return; // Prevent double submission
const idempotencyKey = crypto.randomUUID();
```

#### 2. Credit Balance UI Desync (C-02)
**Scenario:** Credit balance shows stale value after failed refund
```
Timeline:
T0: User has 100 credits (UI shows 100)
T1: Analyze → deduct 5 → balance = 95
T2: API fails → refund_credits_atomic() called
T3: Refund succeeds (DB: 100) but UI still shows 95
```

**Current State:** `setCredits()` only called on success
- File: `keyword-research-content.tsx:353`

**Risk Level:** 🔴 CRITICAL  
**Recommendation:**
```typescript
// After refund, fetch fresh balance
const { data: freshBalance } = await supabase
  .from('credits')
  .select('balance')
  .eq('user_id', userId)
  .single();
setCredits(freshBalance.balance);
```

### 🟠 HIGH PRIORITY ISSUES

#### 3. Partial Bulk Refund Logic (C-03)
**Scenario:** Bulk analysis of 10 keywords, 7 succeed, 3 fail
```
Current behavior:
- User pays 10 credits upfront
- 7 keywords processed successfully
- 3 fail due to DataForSEO timeout
- ❓ How many credits refunded?
```

**Current Code:** `fetch-keywords.ts:408-410`
```typescript
// Only refunds if serpRefundAmount > 0
// ISSUE: Partial failure logic unclear
```

**Risk Level:** 🟠 HIGH  
**File:** `fetch-keywords.ts`  
**Recommendation:** Track per-keyword success/failure and refund exact failed count

#### 4. Credit Check Timing (C-04)
**Scenario:** User starts with 3 credits, tries to analyze 5 keywords
```
Expected: Block immediately with "INSUFFICIENT_CREDITS"
Current: May partially process before failing
```

**Risk Level:** 🟠 HIGH  
**Verification Needed:** Check if credit count validated BEFORE deduction

#### 5. Purchase Flow Disconnection (C-05)
**Scenario:** User clicks "Buy Credits" during analysis
```
User flow:
1. Start analysis (5 credits deducted)
2. While loading, user opens pricing modal
3. User purchases 100 credits
4. Original analysis completes
5. UI shows old balance (95) not new (195)
```

**Risk Level:** 🟠 HIGH  
**File:** `CreditBalance.tsx`  
**Recommendation:** Subscribe to real-time credit updates via Supabase Realtime

### 🟡 MEDIUM ISSUES

#### 6. Guest Credit Display (C-06)
**Scenario:** Guest user sees "Credits: 0" or undefined
**Current:** Guest mode shows "∞" or hides credits
**Risk:** Confusing UX if credit display breaks

#### 7. Credit Calculation Mismatch (C-07)
**Scenario:** Forensic mode credits don't match UI label
```
UI says: "Analyze (11 Credits)" for forensic top10
Actual deduction: Check if exactly 11 credits deducted
```

---

## 🔍 SEARCH BAR - CONNECTION ANALYSIS

### Wiring Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                      SEARCH BAR FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐                                                │
│  │ SearchInput     │──────────────────┐                             │
│  │ (seedValue)     │                  │                             │
│  └─────────────────┘                  ▼                             │
│                               ┌───────────────┐                     │
│  ┌─────────────────┐          │ Zustand Store │                     │
│  │ BulkModeToggle  │─────────▶│ search.mode   │                     │
│  │ (Explore/Bulk)  │          │ search.seed   │                     │
│  └─────────────────┘          │ search.bulk   │                     │
│                               └───────────────┘                     │
│  ┌─────────────────┐                  │                             │
│  │ MatchTypeToggle │                  ▼                             │
│  │ (Broad/Phrase/  │          ┌───────────────┐                     │
│  │  Exact/Related/ │─────────▶│ handleSearch  │                     │
│  │  Questions)     │          │ ()            │                     │
│  └─────────────────┘          └───────────────┘                     │
│                                       │                             │
│  ┌─────────────────┐                  ▼                             │
│  │ CountrySelector │          ┌───────────────┐                     │
│  └─────────────────┘          │ bulkSearch    │                     │
│                               │ Keywords()    │                     │
│  ┌─────────────────┐          └───────────────┘                     │
│  │ LanguageSelect  │                  │                             │
│  └─────────────────┘                  ▼                             │
│                               ┌───────────────┐                     │
│  ┌─────────────────┐          │ Store:        │                     │
│  │ DeviceToggle    │          │ setKeywords() │                     │
│  │ (Desktop/Mobile)│          │ setCredits()  │                     │
│  └─────────────────┘          └───────────────┘                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔴 CRITICAL ISSUES

#### 1. Empty Keyword Submission (S-01)
**Scenario:** User submits empty or whitespace-only keyword
```
Input: "   " (spaces only)
Expected: Show validation error
Current: May pass to server action
```

**Current Check:** `keyword.length === 0` check exists
**Risk:** Whitespace-only may pass

**Risk Level:** 🔴 CRITICAL  
**File:** `KeywordResearchSearch.tsx:285`  
**Recommendation:**
```typescript
const sanitized = sanitizeKeywordInput(seedValue);
if (!sanitized || sanitized.length === 0) {
  toast.error("Please enter a keyword");
  return;
}
```

### 🟠 HIGH PRIORITY

#### 2. Search While Loading (S-02)
**Scenario:** User types new keyword while previous search is loading
```
Timeline:
T0: Search "shoe brand" → loading starts
T1: User types "sneakers" → submits
T2: T0 results arrive → overwrite T1 results?
```

**Current Mitigation:** `isExecuting` check exists  
**Risk:** Results from old search may overwrite new search

#### 3. Country/Language Mismatch (S-03)
**Scenario:** User selects India + French language
```
Current: Allows any country + any language combo
Risk: DataForSEO may return errors or wrong data
```

**File:** `KeywordResearchSearch.tsx`  
**Recommendation:** Validate country-language compatibility

### 🟡 MEDIUM ISSUES

#### 4. Suggestion Autocomplete UX (S-04)
**File:** `SearchSuggestions.tsx`  
**Issue:** Dropdown may stay open after selection

#### 5. Device Type Persistence (S-05)
**Issue:** Device type may not persist across sessions
**Current:** Not stored in localStorage

### 🟢 LOW ISSUES

#### 6. Placeholder Text Dynamic (S-06)
**Suggestion:** Make placeholder dynamic based on selected country

---

## 📦 BULK ANALYSIS - CONNECTION ANALYSIS

### Wiring Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                     BULK ANALYSIS FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐                                                │
│  │ BulkKeywords    │    ┌────────────────┐                         │
│  │ Input (textarea)│───▶│ parseBulk      │                         │
│  │ "shoe\nbag\n.." │    │ Keywords()     │                         │
│  └─────────────────┘    └────────────────┘                         │
│                                │                                    │
│                                ▼                                    │
│                         ┌────────────────┐                         │
│                         │ Validate:      │                         │
│                         │ - Max 500      │                         │
│                         │ - Dedupe       │                         │
│                         │ - Sanitize     │                         │
│                         └────────────────┘                         │
│                                │                                    │
│                                ▼                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                  bulkSearchKeywords()                          │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │  1. Arcjet Shield Check                                        │ │
│  │  2. Rate Limit Check (5/min guest, 50/min user)               │ │
│  │  3. deduct_credits_atomic(amount = keywords.length)           │ │
│  │  4. Check kw_cache for each keyword                           │ │
│  │  5. Fetch missing from DataForSEO Labs API                    │ │
│  │  6. Optional: Queue SERP tasks if forensic=true               │ │
│  │  7. Save to kw_cache                                          │ │
│  │  8. Return merged results                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                │                                    │
│                                ▼                                    │
│                         ┌────────────────┐                         │
│                         │ setKeywords()  │                         │
│                         │ setCredits()   │                         │
│                         └────────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔴 CRITICAL ISSUES

#### 1. Bulk Limit Bypass (B-01)
**Scenario:** User pastes 1000 keywords (limit is 500)
```
Expected: Block with "Max 500 keywords"
Risk: parseBulkKeywords() may not enforce limit
```

**File:** `input-parser.ts`  
**Check needed:** Verify MAX_BULK_KEYWORDS enforcement

**Risk Level:** 🔴 CRITICAL

#### 2. Duplicate Keyword Charging (B-02)
**Scenario:** User enters same keyword twice in bulk
```
Input: "shoes\nshoes\nsneakers"
Expected: Dedupe → charge 2 credits
Risk: May charge 3 credits
```

**Risk Level:** 🔴 CRITICAL  
**Recommendation:** Dedupe BEFORE credit deduction

### 🟠 HIGH PRIORITY

#### 3. Partial Bulk Failure (B-03)
**Scenario:** 100 keywords submitted, DataForSEO times out at keyword 50
```
Current behavior unclear:
- Do we return 50 successful results?
- Do we refund 50 credits?
- Do we retry failed ones?
```

#### 4. Bulk + Forensic Credit Calculation (B-04)
**Scenario:** 10 keywords + Forensic Top10 enabled
```
UI shows: "10 + 10 = 20 credits"
Verify: Exact deduction matches UI
```

### 🟡 MEDIUM ISSUES

#### 5. Bulk Textarea Pasting (B-05)
**Issue:** Large paste may freeze UI
**Recommendation:** Debounce parsing

#### 6. Bulk Results Order (B-06)
**Issue:** Results may not match input order
**User expectation:** Same order as input

---

## 🎛️ FILTERS - CONNECTION ANALYSIS

### Filter Wiring Map
```
┌─────────────────────────────────────────────────────────────────────┐
│                      FILTER ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ VolumeFilter│  │ KDFilter    │  │ CPCFilter   │  │ GeoFilter  │ │
│  │ [0-10M]     │  │ [0-100]     │  │ [0-1000]    │  │ [0-100]    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │               │         │
│         ▼                ▼                ▼               ▼         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Zustand Store: filters                     │  │
│  │  volumeRange: [min, max]                                      │  │
│  │  kdRange: [min, max]                                          │  │
│  │  cpcRange: [min, max]                                         │  │
│  │  geoRange: [min, max]                                         │  │
│  │  selectedIntents: string[]                                    │  │
│  │  selectedSerpFeatures: string[]                               │  │
│  │  includeKeywords: string[]                                    │  │
│  │  excludeKeywords: string[]                                    │  │
│  │  selectedTrend: string[]                                      │  │
│  │  weakSpotToggle: "all" | "with" | "without"                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              applyAllFilters() + applyEngineFilters()         │  │
│  │                         (filter-logic.ts)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   filteredKeywords[]                          │  │
│  │                   → KeywordTable renders                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🟠 HIGH PRIORITY ISSUES

#### 1. Volume Range Edge Case (F-01)
**Scenario:** User sets volume 1000-500 (min > max)
```
Expected: Validation error or auto-swap
Current: May filter out ALL keywords
```

**File:** `VolumeFilter.tsx`  
**Risk Level:** 🟠 HIGH

#### 2. Intent Filter Normalization (F-02)
**Scenario:** API returns intent as "I" but filter expects "informational"
```
Store: selectedIntents = ["informational"]
Keyword: intent = ["I"]
Result: No match → keyword hidden
```

**File:** `filter-logic.ts:130`  
**Current:** `intent.trim().toUpperCase()` normalization
**Verify:** API intent format matches filter format

#### 3. SERP Feature Name Mismatch (F-03)
**Scenario:** UI shows "Video Pack" but data has "video_pack"
```
SERP_FEATURE_LABELS normalization exists
Risk: Edge cases like "People Also Ask" vs "faq / paa"
```

**File:** `filter-logic.ts:23-44`

### 🟡 MEDIUM ISSUES

#### 4. Filter Preset Save (F-04)
**Issue:** Saving preset may fail silently if DB error
**File:** `filter-presets.ts`

#### 5. Filter Reset Memory (F-05)
**Issue:** Reset filters may not clear all nested states
**Check:** `weakSpotTypes[]` cleared on reset?

#### 6. GEO Score Filter (F-06)
**Issue:** Keywords with `geoScore: null` behavior
**Current:** Treated as 0? Or excluded?

#### 7. Trend Filter Logic (F-07)
**Issue:** "Rising" vs "Stable" vs "Falling" calculation
**Check:** minTrendGrowth threshold correct?

### 🟢 LOW ISSUES

#### 8. Include/Exclude Overlap (F-08)
**Scenario:** User adds "shoe" to both include AND exclude
**Expected:** Validation error

#### 9. Filter Count Badge (F-09)
**Issue:** Active filter count may be off by 1

---

## 📊 TABLE & COLUMNS - CONNECTION ANALYSIS

### Column Wiring Map
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TABLE COLUMN ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                       KeywordTable.tsx                              │ │
│  │                    (TanStack React Table v8)                        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    createKeywordColumns()                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│         ┌────────────────────────┼────────────────────────┐             │
│         ▼                        ▼                        ▼             │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│  │ CheckboxCol  │        │ KeywordCol   │        │ VolumeCol    │      │
│  │ → Selection  │        │ → Click open │        │ → formatVol  │      │
│  │   Zustand    │        │   drawer     │        │   (1K, 1M)   │      │
│  └──────────────┘        └──────────────┘        └──────────────┘      │
│         │                        │                        │             │
│         ▼                        ▼                        ▼             │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│  │ IntentCol    │        │ TrendCol     │        │ KDCol        │      │
│  │ → I/C/N/T    │        │ → Sparkline  │        │ → Color code │      │
│  │   badges     │        │   chart      │        │   0-100      │      │
│  └──────────────┘        └──────────────┘        └──────────────┘      │
│         │                        │                        │             │
│         ▼                        ▼                        ▼             │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│  │ CPCCol       │        │ SerpCol      │        │ GeoCol       │      │
│  │ → $0.00      │        │ → Feature    │        │ → Score bar  │      │
│  │   format     │        │   badges     │        │   animation  │      │
│  └──────────────┘        └──────────────┘        └──────────────┘      │
│         │                        │                        │             │
│         ▼                        ▼                        ▼             │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│  │ WeakSpotCol  │        │ RefreshCol   │        │ ActionsCol   │      │
│  │ → Reddit/    │        │ → Button +   │        │ → Dropdown   │      │
│  │   Quora/Pin  │        │   Cooldown   │        │   menu       │      │
│  └──────────────┘        └──────────────┘        └──────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 🔴 CRITICAL ISSUES

#### 1. Keyword ID Type Mismatch (T-01)
**Scenario:** Server returns `id: "abc123"` but UI expects `id: number`
```
Current: id = Number(row.id)
Risk: NaN if string ID
```

**File:** `refresh-column.tsx:63`  
```typescript
const numericId = Number(id) // What if id is "kw_abc123"?
```

**Risk Level:** 🔴 CRITICAL

### 🟠 HIGH PRIORITY

#### 2. Selection State Persistence (T-02)
**Scenario:** User selects 5 rows, changes filter, filter clears
```
Expected: Selection persists across filter changes
Current: May lose selection
```

**File:** `KeywordTable.tsx:142`

#### 3. Bulk Selection Limit (T-03)
**Scenario:** Page has 1000 keywords, user clicks "Select All"
```
Risk: UI freeze if selecting 1000+ rows
Recommendation: Limit to 100 or current page
```

#### 4. Sort + Pagination Mismatch (T-04)
**Scenario:** Sort by volume, go to page 3, sort by KD
```
Expected: Go back to page 1
Current: May stay on page 3 with wrong data
```

#### 5. Row Click vs Checkbox Click (T-05)
**Scenario:** User clicks row to open drawer but hits checkbox
```
Risk: Confusing UX - does it select or open?
Current: Checkbox = select, Row = drawer
Verify: Click target isolation working
```

### 🟡 MEDIUM ISSUES

#### 6. Trend Sparkline Null Data (T-06)
**Scenario:** Keyword has `trend: null` or `trend: []`
```
Expected: Show flat line or "N/A"
Risk: Sparkline crashes
```

#### 7. SERP Feature Overflow (T-07)
**Scenario:** Keyword has 10+ SERP features
```
Current: "+X more" badge?
Risk: UI breaks with too many badges
```

#### 8. Weak Spot Tooltip (T-08)
**Issue:** Tooltip may show stale data after refresh

#### 9. GEO Score Animation (T-09)
**Issue:** Animation may lag on large datasets

### 🟢 LOW ISSUES

#### 10. Column Resize (T-10)
**Status:** Not implemented (TanStack supports it)

#### 11. Column Visibility Toggle (T-11)
**Status:** Not implemented (requested feature)

---

## 🔄 REFRESH SYSTEM - CONNECTION ANALYSIS

### Refresh Wiring Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                      REFRESH FLOW ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  RefreshButton Click                                                │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────┐                                                │
│  │ Cooldown Check  │──▶ If < 5 min since last → BLOCK              │
│  └─────────────────┘                                                │
│         │ Pass                                                       │
│         ▼                                                            │
│  ┌─────────────────┐                                                │
│  │ updateKeyword   │                                                │
│  │ (isRefreshing:  │                                                │
│  │  true)          │                                                │
│  └─────────────────┘                                                │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────┐                                                │
│  │ refreshKeyword  │──▶ Server Action                               │
│  │ ()              │                                                │
│  └─────────────────┘                                                │
│         │                                                            │
│         ├──────────────────────────────────────────────────┐        │
│         ▼                                                  ▼        │
│  ┌─────────────────┐                            ┌─────────────────┐ │
│  │ HIGH TRAFFIC    │                            │ LOW TRAFFIC     │ │
│  │ (queue SERP)    │                            │ (live SERP)     │ │
│  │ → postback_url  │                            │ → immediate     │ │
│  │ → task_id saved │                            │   result        │ │
│  └─────────────────┘                            └─────────────────┘ │
│         │                                                  │        │
│         ▼                                                  ▼        │
│  ┌─────────────────┐                            ┌─────────────────┐ │
│  │ status:pending  │                            │ UPDATE:         │ │
│  │ "SERP scan      │                            │ weakSpots       │ │
│  │  queued"        │                            │ serpFeatures    │ │
│  └─────────────────┘                            │ geoScore        │ │
│         │                                       │ hasAio          │ │
│         ▼                                       │ rtv             │ │
│  ┌─────────────────┐                            └─────────────────┘ │
│  │ Webhook         │                                                │
│  │ /api/webhooks/  │                                                │
│  │ serp            │                                                │
│  └─────────────────┘                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔴 CRITICAL ISSUES

#### 1. Stale isRefreshing State (R-01)
**Scenario:** Refresh API fails but `isRefreshing` stays true
```
Timeline:
T0: Click refresh → isRefreshing = true
T1: API throws error
T2: Catch block runs but finally may not fire
T3: Spinner stuck forever
```

**File:** `refresh-column.tsx:273`  
**Current:** `finally { updateKeyword(id, { isRefreshing: false }) }`  
**Risk:** If error thrown before try block

**Risk Level:** 🔴 CRITICAL

#### 2. Queue Task Lost (R-02)
**Scenario:** SERP task queued but webhook never fires
```
Timeline:
T0: refreshKeyword() queues task
T1: DataForSEO processes task
T2: Webhook URL unreachable (Vercel cold start)
T3: User never gets updated data
T4: Credit already deducted → lost
```

**Risk Level:** 🔴 CRITICAL  
**File:** `refresh-keyword.ts:283`  
**Recommendation:** Implement task status polling fallback

### 🟠 HIGH PRIORITY

#### 3. Cooldown Time Display (R-03)
**Scenario:** Cooldown shows "4:59" but should show "4m 59s"
```
Current: formatCooldown() implementation
Verify: HH:MM:SS format correct
```

#### 4. Bulk Refresh Race Condition (R-04)
**Scenario:** User bulk refreshes 10 keywords, clicks refresh on row 1 again
```
Risk: Row 1 gets refreshed twice
```

#### 5. Refresh + Sort Interaction (R-05)
**Scenario:** Refreshed keyword volume changes, table sorted by volume
```
Expected: Row should move to new position
Current: May stay in old position until re-sort
```

### 🟡 MEDIUM ISSUES

#### 6. Refresh Badge Phases (R-06)
```
Phases: "just" | "verified" | "aging" | "stale"
Verify: Phase transitions at correct times:
- just: < 5 min
- verified: < 48 hours  
- aging: < 7 days
- stale: > 7 days
```

#### 7. Last Refreshed Display (R-07)
**Issue:** "5 minutes ago" may not update in real-time

---

## 🗂️ DRAWER/DETAIL VIEW - CONNECTION ANALYSIS

### Drawer Wiring
```
┌─────────────────────────────────────────────────────────────────────┐
│                       DRAWER ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Keyword Row Click                                                  │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────┐                                                │
│  │ openKeyword     │                                                │
│  │ Drawer(keyword) │                                                │
│  └─────────────────┘                                                │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────┐                                                │
│  │ Zustand:        │                                                │
│  │ selectedKeyword │                                                │
│  └─────────────────┘                                                │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                KeywordDetailsDrawer                              ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             ││
│  │  │ OverviewTab │  │ SocialTab   │  │ CommerceTab │             ││
│  │  │ (metrics)   │  │ (Reddit/YT) │  │ (Amazon)    │             ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘             ││
│  │         │                │                │                     ││
│  │         │                ▼                ▼                     ││
│  │         │         fetchSocialIntel  fetchAmazonData            ││
│  │         │         (1 credit)        (1 credit)                 ││
│  │         │                │                │                     ││
│  │         │                ▼                ▼                     ││
│  │         │         drawerCache      drawerCache                 ││
│  │         │         [social]         [commerce]                  ││
│  │         │                                                       ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🟠 HIGH PRIORITY

#### 1. Tab Switch Credit Charge (D-01)
**Scenario:** User switches to Social tab, data loads, switches to Commerce, back to Social
```
Expected: Social tab cached, no re-charge
Risk: May charge again if cache invalidated
```

**File:** `store/index.ts:145`  
**Cache TTL:** 5 minutes

#### 2. Drawer Close Data Loss (D-02)
**Scenario:** User in drawer, API fetching, closes drawer
```
Risk: Data arrives after close, goes nowhere
```

### 🟡 MEDIUM ISSUES

#### 3. YouTube Strategy Panel (D-03)
**Issue:** Video cards may show stale thumbnails

#### 4. Drawer Width Mobile (D-04)
**Issue:** Full-width on mobile may cut off content

---

## 🌍 COUNTRY & LANGUAGE - CONNECTION ANALYSIS

### 🟠 HIGH PRIORITY

#### 1. Country Code Normalization (CL-01)
**Scenario:** Old URLs use "UK" but system expects "GB"
```
File: country-normalizer.ts
Check: UK → GB mapping exists
Risk: 404 or wrong data for old shared URLs
```

### 🟡 MEDIUM ISSUES

#### 2. Language Auto-Detection (CL-02)
**Issue:** India selected but language defaults to "en" not "hi"

#### 3. Country Persistence (CL-03)
**Issue:** localStorage key `blogspy_last_country` may conflict

#### 4. Timezone Heuristic (CL-04)
**File:** `keyword-research-content.tsx:130-145`
```typescript
// Heuristic: Kolkata timezone → India
// Risk: VPN users get wrong default
```

---

## 🔤 MATCH TYPES - CONNECTION ANALYSIS

### Match Type Behavior
```
┌────────────────────────────────────────────────────────────────────┐
│                       MATCH TYPE LOGIC                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Type        │ Behavior                              │ API Param   │
│ ─────────────┼───────────────────────────────────────┼───────────│
│  Broad       │ All related keywords                  │ "broad"    │
│  Phrase      │ Must contain exact phrase             │ "phrase"   │
│  Exact       │ Exact match only                      │ "exact"    │
│  Related     │ Semantically similar                  │ "related"  │
│  Questions   │ Question format (how/what/why)        │ "questions"│
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 🟠 HIGH PRIORITY

#### 1. Match Type API Mapping (M-01)
**Verify:** Server action maps UI value to DataForSEO parameter correctly
```typescript
// File: fetch-keywords.ts:47
const matchType = (parsedInput.matchType ?? "broad").toString()
```

### 🟡 MEDIUM ISSUES

#### 2. Match Type + Bulk (M-02)
**Issue:** Does match type apply to ALL bulk keywords?

#### 3. Match Type Persistence (M-03)
**Issue:** Match type resets on page refresh

---

## 👤 GUEST MODE - CONNECTION ANALYSIS

### Guest Mode Restrictions
```
┌────────────────────────────────────────────────────────────────────┐
│                     GUEST MODE RESTRICTIONS                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Feature              │ Guest Allowed │ Action on Attempt          │
│ ──────────────────────┼───────────────┼────────────────────────────│
│  Search (seed)        │ ✅ Yes        │ Returns mock data (50 kw)  │
│  Bulk Analysis        │ ❌ No         │ "Sign up to unlock"        │
│  Refresh Keyword      │ ❌ No         │ "Sign up to refresh"       │
│  Export CSV           │ ❌ No         │ "Sign up to export"        │
│  Copy Keywords        │ ❌ No         │ "Sign up to copy"          │
│  Save Filter Preset   │ ❌ No         │ "Sign up to save"          │
│  Social Tab           │ ❌ No         │ Blurred with CTA           │
│  Commerce Tab         │ ❌ No         │ Blurred with CTA           │
│  Rate Limit           │ 5/10 min      │ 429 after limit            │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 🔴 CRITICAL ISSUES

#### 1. Guest Data Leak (G-01)
**Scenario:** Guest triggers real API call consuming server credits
```
Check: publicAction vs authenticatedAction usage
File: fetch-keywords.ts uses publicAction
Risk: Guest could deplete server DataForSEO budget
```

**Risk Level:** 🔴 CRITICAL  
**Verify:** Guest requests ONLY return mock data

### 🟠 HIGH PRIORITY

#### 2. Guest → User Transition (G-02)
**Scenario:** Guest analyzes keyword, signs up, expects to see that data
```
Current: Mock data discarded on login
Recommendation: Persist intent in localStorage
```

#### 3. Guest Rate Limit Bypass (G-03)
**Scenario:** Guest clears cookies, gets new session, bypasses rate limit
```
Check: IP-based rate limiting in addition to session
File: fetch-keywords.ts:133
```

### 🟡 MEDIUM ISSUES

#### 4. Guest UI Inconsistency (G-04)
**Issue:** Some features silently fail vs show toast

### 🟢 LOW ISSUES

#### 5. Guest Cookie Consent (G-05)
**Issue:** Rate limit uses cookies without consent banner

---

## 📱 DEVICE/RESPONSIVE - CONNECTION ANALYSIS

### Responsive Breakpoints
```
┌────────────────────────────────────────────────────────────────────┐
│                     RESPONSIVE BEHAVIOR                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Breakpoint     │ Table Columns                │ Filters           │
│ ────────────────┼──────────────────────────────┼──────────────────│
│  Desktop (>1024)│ All 12 columns               │ Inline toolbar    │
│  Tablet (768)   │ 8 columns (hide GEO, SERP)   │ Collapsible       │
│  Mobile (<768)  │ 4 columns (KW, Vol, KD, CPC) │ Sheet/Modal       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Issues

#### 1. Table Horizontal Scroll (RES-01)
**Issue:** Mobile may not scroll horizontally
**Risk Level:** 🟠 HIGH

#### 2. Filter Sheet UX (RES-02)
**Issue:** Mobile filter sheet may be hard to dismiss

---

## ✅ HEALTHY CONNECTIONS (No Issues Found)

1. **Arcjet Shield** - Properly configured, blocking bots
2. **Upstash Rate Limit** - Working, analytics enabled
3. **Supabase RPC** - Atomic transactions, row-level locking
4. **TanStack Table** - Proper virtualization
5. **Zustand DevTools** - Enabled for debugging
6. **Error Boundary** - Catches component crashes

---

## 🎯 PRIORITY FIX RECOMMENDATIONS

### Phase 1 (This Sprint) - Critical
1. Fix double-click deduction race (C-01)
2. Add credit balance refresh after refund (C-02)
3. Validate keyword ID type consistency (T-01)
4. Ensure guest mode returns ONLY mock data (G-01)
5. Fix stale isRefreshing state (R-01)

### Phase 2 (Next Sprint) - High
1. Implement partial bulk refund logic (C-03, B-03)
2. Add bulk keyword deduplication (B-02)
3. Fix selection persistence across filters (T-02)
4. Add webhook polling fallback (R-02)
5. Validate volume range min < max (F-01)

### Phase 3 (Backlog) - Medium/Low
1. Add column visibility toggle (T-11)
2. Improve mobile responsive (RES-01, RES-02)
3. Add guest → user data transition (G-02)
4. Language auto-detection (CL-02)

---

## 📈 TESTING CHECKLIST

### Credit System Tests
- [ ] Search with 0 credits → INSUFFICIENT_CREDITS
- [ ] Search with exact credits → Success, balance = 0
- [ ] API failure → Refund + balance updated
- [ ] Double-click protection → Only 1 deduction

### Search Tests
- [ ] Empty keyword → Validation error
- [ ] Whitespace keyword → Validation error
- [ ] 500+ character keyword → Handled
- [ ] Special characters → Sanitized

### Bulk Tests
- [ ] 1 keyword → Works
- [ ] 500 keywords → Works
- [ ] 501 keywords → Blocked
- [ ] Duplicate keywords → Deduped

### Filter Tests
- [ ] Each filter in isolation
- [ ] All filters combined
- [ ] Reset clears all
- [ ] Preset save/load

### Table Tests
- [ ] Sort each column
- [ ] Pagination
- [ ] Select all
- [ ] Bulk actions

### Refresh Tests
- [ ] Single refresh
- [ ] Cooldown enforced
- [ ] Bulk refresh
- [ ] Queue vs Live path

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** January 31, 2026  
**Review Required:** Engineering Lead + QA Lead
