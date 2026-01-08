# 🔬 Keyword Research - Forensic Code Audit Report

**Date:** January 2026  
**Auditor:** GitHub Copilot  
**Feature:** Keyword Magic / Keyword Research  
**Scope:** Security, Performance, Mock Mode, API Cost Optimization

---

## 📊 Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| **Security (Auth Guards)** | 40/100 | 🔴 CRITICAL |
| **Mock Mode Coverage** | 50/100 | 🔴 CRITICAL |
| **API Cost Optimization** | 75/100 | 🟡 NEEDS WORK |
| **UI/UX Integrity** | 90/100 | ✅ GOOD |
| **Overall Score** | **58/100** | 🔴 NOT PRODUCTION READY |

---

## 🔴 Phase 1: Security Audit - Critical Findings

### 1.1 Authentication Guard Status

| File | Guard | Status | Risk |
|------|-------|--------|------|
| `refresh-keyword.ts` | `authAction` | ✅ SECURED | None |
| `search.action.ts` | `authAction` | ✅ SECURED | None |
| `getUserCreditsAction` | `authAction` | ✅ SECURED | None |
| `fetch-keywords.ts` | `action` | 🔴 PUBLIC | Can trigger paid Labs API without auth |
| `fetch-drawer-data.ts` | `action` | 🔴 PUBLIC | Can trigger social/commerce APIs without auth |
| `refresh-row.ts` | `action` | 🔴 PUBLIC | Can trigger expensive SERP API without auth! |

### 1.2 Critical Security Issue: `refresh-row.ts`

```typescript
// refresh-row.ts:4-21
import { action } from "@/lib/safe-action" // dev/public action; swap to authAction when gating credits

export const refreshRow = action
  .schema(RefreshRowSchema)
  .action(async ({ parsedInput }): Promise<RefreshRowResponse> => {
    // NO AUTH CHECK! NO CREDIT DEDUCTION!
    const data = await refreshLiveSerp({ ... }) // EXPENSIVE API CALL
    return { success: true, data }
  })
```

**Impact:** Any unauthenticated user can call this endpoint and drain your DataForSEO SERP API credits.

### 1.3 Duplicate Refresh Actions

There are TWO refresh actions:
- `refreshKeywordAction` - ✅ Secured with `authAction`, deducts credits
- `refreshRow` - 🔴 Public with `action`, NO credit deduction

**Recommendation:** Delete `refresh-row.ts` and use only `refreshKeywordAction`.

---

## 🔴 Phase 2: Mock Mode Audit - Critical Findings

### 2.1 Mock Mode Coverage Matrix

| Service/Action | Mock Check | Status |
|----------------|------------|--------|
| `keyword.service.ts` | `isMockMode()` | ✅ Returns mock data |
| `fetch-keywords.ts` | `isMockMode()` | ✅ Returns mock data |
| `refresh-keyword.ts` | Partial | 🔴 Only skips credit deduction |
| `live-serp.ts` | **NONE** | 🔴 ALWAYS hits real API |
| `refresh-row.ts` | **NONE** | 🔴 ALWAYS hits real API |

### 2.2 Critical Bug: Live SERP Has No Mock Mode

```typescript
// live-serp.ts - NO MOCK CHECK ANYWHERE
export async function refreshLiveSerp(params: {...}): Promise<LiveSerpRefreshResult> {
  const dataForSEO = getDataForSEOClient()
  
  // DIRECTLY CALLS PAID API - NO MOCK MODE CHECK!
  const { data } = await dataForSEO.post<DataForSEOResponse<SerpAdvancedResult>>(
    "/serp/google/organic/live/advanced",
    [{ keyword, location_code, language_code, depth }]
  )
  ...
}
```

### 2.3 Critical Bug: `refreshKeywordAction` Hits Real API in Mock Mode

```typescript
// refresh-keyword.ts:82-96
export const refreshKeywordAction = authAction
  .action(async ({ parsedInput, ctx }) => {
    await useRefreshCredit(ctx.userId) // This IS mock-aware
    
    const result = await refreshLiveSerp({ ... }) // THIS IS NOT!
    return { success: true, data: result }
  })
```

**Impact:** When `NEXT_PUBLIC_USE_MOCK_DATA=true`:
- ✅ Credits are NOT deducted
- 🔴 Real SERP API is STILL called (costs ~$0.01 per call)

---

## 🟡 Phase 3: API Cost Optimization Audit

### 3.1 API Routing Strategy

| Endpoint | API | Cost | Used For |
|----------|-----|------|----------|
| `/labs/google/keyword_ideas` | Labs | Cheap (~$0.001) | Bulk keyword research |
| `/serp/google/organic/live/advanced` | SERP | Expensive (~$0.01) | Single keyword refresh |

**Current Status:** Correctly routed. Labs API for bulk, SERP API for refresh.

### 3.2 Credit Deduction Flow

```
User clicks Refresh → refreshKeywordAction
                         ↓
                    authAction middleware (ctx.userId)
                         ↓
                    useRefreshCredit(userId)
                         ↓
                    Supabase RPC: use_credits
                         ↓
                    refreshLiveSerp (API call)
                         ↓
                    Update Zustand store
```

**Status:** Credit flow is correct when using `refreshKeywordAction`.

### 3.3 Bulk Refresh Implementation

`RefreshCreditsHeader.tsx` correctly:
- Uses `refreshKeywordAction` (secured)
- Processes in batches of 3
- Shows toast progress
- Updates Zustand store per keyword

---

## ✅ Phase 4: UI/UX Integrity Audit

### 4.1 Column Components

| Column | Implementation | Status |
|--------|----------------|--------|
| WeakSpotColumn | Correct Reddit/Quora/Pinterest detection | ✅ |
| GeoColumn | Correct 0-100 score with color scaling | ✅ |
| RefreshCell | Uses secured `refreshKeywordAction` | ✅ |
| RefreshCreditsHeader | Bulk refresh with credit tracking | ✅ |
| CreditBalance | Pill-style in export bar | ✅ |

### 4.2 SERP Features Filter

**Status:** ✅ FIXED - All 10 unique options restored:
- ai_overview, featured_snippet, faq, video, image
- shopping, ad, local, news, reviews

### 4.3 Zustand Store Integration

**Status:** ✅ Correct
- `selectedIds: Set<number>` - Proper type
- `updateKeyword(id, updates)` - Optimistic updates work
- Bulk refresh correctly filters by `selectedIds`

---

## 🛠️ Required Fixes (Priority Order)

### P0: Critical Security Fixes

#### Fix 1: Add Mock Mode to `live-serp.ts`

```typescript
// live-serp.ts - ADD THIS
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

function generateMockSerpResult(keyword: string): LiveSerpRefreshResult {
  const hash = keyword.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    weakSpot: hash % 3 === 0 ? { type: "reddit", rank: 5 + (hash % 10) } : { type: null },
    serpFeatures: ["featured_snippet", "video"],
    geoScore: 40 + (hash % 50),
    hasAio: hash % 2 === 0,
    checkedAt: new Date().toISOString(),
  }
}

export async function refreshLiveSerp(params: {...}): Promise<LiveSerpRefreshResult> {
  // ADD MOCK CHECK AT TOP
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
    return generateMockSerpResult(params.keyword)
  }
  
  // ... existing real API code
}
```

#### Fix 2: Delete or Secure `refresh-row.ts`

**Option A (Recommended):** Delete the file entirely. It's redundant.

```bash
rm src/features/keyword-research/actions/refresh-row.ts
```

**Option B:** Convert to `authAction` with credit deduction:

```typescript
// refresh-row.ts
import { authAction } from "@/lib/safe-action"

export const refreshRow = authAction
  .schema(RefreshRowSchema)
  .action(async ({ parsedInput, ctx }) => {
    await useRefreshCredit(ctx.userId) // Add credit deduction
    const data = await refreshLiveSerp({ ... })
    return { success: true, data }
  })
```

#### Fix 3: Secure `fetch-keywords.ts`

```typescript
// fetch-keywords.ts:11
- import { action } from "@/lib/safe-action"
+ import { authAction } from "@/lib/safe-action"

// fetch-keywords.ts:178
- export const fetchKeywords = action
+ export const fetchKeywords = authAction
```

#### Fix 4: Secure `fetch-drawer-data.ts`

```typescript
// fetch-drawer-data.ts:15
- import { action } from "@/lib/safe-action"
+ import { authAction } from "@/lib/safe-action"

// For each export:
- export const fetchAmazonData = action
+ export const fetchAmazonData = authAction

- export const fetchSocialInsights = action
+ export const fetchSocialInsights = authAction
```

---

## 📋 Implementation Checklist

- [ ] Add mock mode to `live-serp.ts` with realistic delay
- [ ] Delete `refresh-row.ts` (redundant and insecure)
- [ ] Change `fetch-keywords.ts` from `action` to `authAction`
- [ ] Change `fetch-drawer-data.ts` from `action` to `authAction`
- [ ] Add rate limiting to refresh endpoints
- [ ] Add API call logging for cost tracking

---

## 🎯 Post-Fix Expected Scores

| Category | Current | After Fix |
|----------|---------|-----------|
| Security | 40/100 | 95/100 |
| Mock Mode | 50/100 | 100/100 |
| API Cost | 75/100 | 90/100 |
| UI/UX | 90/100 | 90/100 |
| **Overall** | **58/100** | **94/100** |

---

## 📝 Audit Notes

1. **Good Practices Found:**
   - Zustand store architecture is clean
   - TanStack Table integration is solid
   - Optimistic updates work correctly
   - Credit deduction uses Supabase RPC (proper transaction)

2. **Technical Debt:**
   - TODO comments indicate awareness of issues
   - "Switch to authAction for production" comments exist but not implemented

3. **Testing Recommendations:**
   - Add integration tests for auth guards
   - Add mock mode verification tests
   - Add cost tracking dashboard

---

**Verdict:** 🔴 NOT PRODUCTION READY

The keyword research feature has critical security vulnerabilities that allow unauthenticated API access and can drain paid API credits. The mock mode implementation is incomplete, causing real API calls during development. These issues MUST be fixed before production deployment.
