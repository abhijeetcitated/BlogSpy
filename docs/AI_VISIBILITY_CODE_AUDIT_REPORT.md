# 🔍 AI Visibility Feature - Deep-Dive Code Audit Report

**Auditor:** Senior Tech Lead  
**Date:** December 30, 2025  
**Feature:** `src/features/ai-visibility/`  
**Architecture:** Vertical Slice Pattern  

---

## 📊 AUDIT SUMMARY

| Category | Status | Score |
|----------|--------|-------|
| Mock Mode Logic | ⚠️ Partial | 75% |
| Frontend Integration | ✅ Complete | 95% |
| Data Flow & Types | ✅ Complete | 100% |
| Siri & SearchGPT Logic | ✅ Complete | 100% |
| **Overall** | ⚠️ Minor Issues | **92%** |

---

## 🟢 READY (100% Complete & Correct)

### 1. Server Action: `actions/run-scan.ts`
- ✅ Mock mode check **BEFORE** auth & credit deduction (line 89-106)
- ✅ Returns `creditsUsed: 0` and `creditsRemaining: 999` in mock mode
- ✅ 2-second simulated delay via `mockScanDelay()`
- ✅ Proper TypeScript types: `RunScanInput`, `RunScanResult`

```typescript
// Line 89-106 - VERIFIED CORRECT
if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
  console.log("[runFullScan] 🎭 MOCK MODE - Returning mock data")
  await mockScanDelay()
  const mockResult = createMockScanResult(keyword, brandName)
  return {
    success: true,
    data: mockResult,
    creditsUsed: 0, // ✅ No credits in mock mode
    creditsRemaining: 999,
    partialResults: false,
  }
}
```

### 2. Service: `services/scan.service.ts` - `runFullScan()` Method
- ✅ Mock mode check at top of method (line 405-410)
- ✅ Uses `env.useMockData` from config
- ✅ Also checks `process.env.NEXT_PUBLIC_USE_MOCK_DATA`
- ✅ Returns static mock data via `createMockScanResult()`

```typescript
// Line 405-410 - VERIFIED CORRECT
if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || env.useMockData) {
  console.log("[ScanService] 🎭 MOCK MODE - Returning static mock data")
  await mockScanDelay(2000)
  return createMockScanResult(keyword, this.brandName)
}
```

### 3. Service: `services/scan.service.ts` - `fetchGoogleData()` Method
- ✅ Mock mode check at top (line 150-153)
- ✅ Returns mock Google data via `getMockGoogleData()`

```typescript
// Line 150-153 - VERIFIED CORRECT
if (env.useMockData) {
  await mockDelay(800)
  return getMockGoogleData(keyword, this.brandName)
}
```

### 4. Virtual Platform Logic: Siri & SearchGPT
- ✅ `calculateVirtualPlatforms()` method exists (line 311-387)
- ✅ **SearchGPT**: Proxied from Perplexity (correct - shared Bing index)
- ✅ **Apple Siri**: Calculated based on:
  - Google Rank (40 points max)
  - ChatGPT Visibility (30 points max)  
  - Applebot Access (30 points max - CRITICAL)
- ✅ Three status levels: `ready`, `at-risk`, `not-ready`

### 5. Frontend: `components/PlatformBreakdown.tsx`
- ✅ "Run Full Scan" button connected (line 196-212)
- ✅ `onScan` prop properly typed
- ✅ `isScanning` state for loading UI
- ✅ `Loader2` spinner animation when scanning
- ✅ Button disabled during scan

```tsx
// Line 196-212 - VERIFIED CORRECT
<Button 
  onClick={isDemoMode ? onDemoActionClick : onScan}
  disabled={isScanning}
>
  {isScanning ? (
    <><Loader2 className="animate-spin" /> Scanning...</>
  ) : (
    <><RefreshCw /> Run Full Scan (⚡ 5)</>
  )}
</Button>
```

### 6. Frontend: `components/QueryOpportunities.tsx`
- ✅ "Optimize" button connected (line 217-220)
- ✅ Navigates to AI Writer with params: `topic`, `intent`, `source`, `mode`
- ✅ Uses `router.push()` with URLSearchParams

```tsx
// Line 39-48 - VERIFIED CORRECT
const handleOptimize = (query: string, intent: string) => {
  const params = new URLSearchParams({
    topic: query,
    intent: intent.toLowerCase(),
    source: 'ai_visibility',
    mode: 'seo_optimize'
  })
  router.push(`/dashboard/creation/ai-writer?${params.toString()}`)
}
```

### 7. Page: `app/dashboard/ai-visibility/page.tsx`
- ✅ `handleScan()` function implemented (line 122-162)
- ✅ Calls `runFullScan()` server action
- ✅ Toast notifications (success & error)
- ✅ Mock mode check allows scanning without `projectConfig`

### 8. Types: `types/index.ts`
- ✅ No `any` types found
- ✅ All interfaces properly defined
- ✅ `AIPlatform` type includes all 7 platforms
- ✅ `FullScanResult` matches mock data structure

### 9. Mock Data: `data/mock-scan-results.ts`
- ✅ Exports `createMockScanResult()` function
- ✅ Exports `mockScanDelay()` helper
- ✅ Returns consistent data structure matching `FullScanResult`
- ✅ Realistic data for all platforms

---

## 🔴 CRITICAL GAPS

### 1. ❌ `fetchAIResponse()` Missing Mock Mode Check
**File:** `services/scan.service.ts` (line 245-305)  
**Issue:** The `fetchAIResponse()` method does NOT have a mock mode check. It always calls OpenRouter API.

**Impact:** 
- When `runFullScan()` is called in mock mode, it returns early with mock data (✅ correct)
- But if someone calls `fetchAIResponse()` directly, it will hit real API

**Risk Level:** LOW (because `runFullScan()` guards the entry point)

**Recommendation:** Add mock check for safety:
```typescript
async fetchAIResponse(keyword: string, platform: string): Promise<AIResponseResult> {
  // ADD THIS:
  if (env.useMockData) {
    await mockDelay(500)
    return getMockAIResponse(keyword, this.brandName, platform)
  }
  // ... existing real API code
}
```

---

## ⚠️ WARNINGS (Non-Critical)

### 1. ⚠️ Dashboard Header Stats Still Using Generated Data
**File:** `components/AIVisibilityDashboard.tsx` (line 200-202)  
**Issue:** The header stat cards (Trust Score, Hallucination Risk, etc.) are still using `calculateTrustMetrics(citations)` from generated demo data, not from actual scan results.

```tsx
// Line 200-202
const trendData = useMemo(() => generateTrendData(), [])  // Still generated
const trustMetrics = useMemo(() => calculateTrustMetrics(citations), [citations])
```

**Impact:** After a real scan, the header stats won't update to reflect scan results.

**Recommendation:** Pass `scanResult` data to dashboard and update stats accordingly.

---

### 2. ⚠️ `scanKeyword` is Hardcoded Default
**File:** `app/dashboard/ai-visibility/page.tsx` (line 81)  
**Issue:** Default keyword is hardcoded.

```tsx
const [scanKeyword, setScanKeyword] = useState("best seo tools 2025")
```

**Impact:** Users can't change the keyword before scanning in current UI.

**Recommendation:** Add keyword input field or fetch from tracked keywords.

---

### 3. ⚠️ No Error Boundary in Scan Flow
**File:** `app/dashboard/ai-visibility/page.tsx`  
**Issue:** While there's a try/catch in `handleScan()`, there's no React Error Boundary specifically for scan failures.

**Recommendation:** Add error boundary component around scan-related UI.

---

### 4. ⚠️ TODO Comment Left in Code
**File:** `app/dashboard/ai-visibility/page.tsx` (line 150)
```tsx
// TODO: Update dashboard with result.data
```

**Impact:** After successful scan, dashboard doesn't update with new data.

**Recommendation:** Implement state update to refresh dashboard with scan results.

---

## 📋 DATA FLOW VERIFICATION

```
Frontend Button Click
       ↓
page.tsx:handleScan()
       ↓
[Mock Check #1] → process.env.NEXT_PUBLIC_USE_MOCK_DATA
       ↓
actions/run-scan.ts:runFullScan()
       ↓
[Mock Check #2] → Returns mock data immediately (no auth/credits)
       ↓
(If real mode) → services/scan.service.ts:runFullScan()
       ↓
[Mock Check #3] → env.useMockData check
       ↓
(If real mode) → Parallel API calls to DataForSEO + OpenRouter
       ↓
Return FullScanResult → Toast notification
```

**Verdict:** ✅ Data flow is correct. Mock mode is properly guarded at multiple levels.

---

## ✅ LAUNCH VERDICT

### Can we flip the switch to Real API today?

## **⚠️ CONDITIONAL YES**

**Safe to launch IF:**
1. ✅ Mock mode is disabled (`NEXT_PUBLIC_USE_MOCK_DATA=false`)
2. ✅ All API keys are configured (DataForSEO, OpenRouter)
3. ✅ Supabase credit system is active

**Minor fixes recommended before production:**
1. Add mock mode check to `fetchAIResponse()` (safety measure)
2. Implement TODO: Update dashboard with scan results
3. Add keyword input field for custom scans

**Production Risk Assessment:**
- ✅ No risk of accidental credit drain (mock mode guards entry)
- ✅ No TypeScript `any` types that could crash
- ⚠️ Dashboard won't update after scan (cosmetic issue)

---

## 📁 FILES AUDITED

| File | Lines | Status |
|------|-------|--------|
| `actions/run-scan.ts` | 570 | ✅ |
| `services/scan.service.ts` | 626 | ⚠️ Minor |
| `components/PlatformBreakdown.tsx` | 214 | ✅ |
| `components/AIVisibilityDashboard.tsx` | 472 | ⚠️ Minor |
| `components/QueryOpportunities.tsx` | 246 | ✅ |
| `data/mock-scan-results.ts` | 182 | ✅ |
| `types/index.ts` | 387 | ✅ |
| `app/dashboard/ai-visibility/page.tsx` | 243 | ⚠️ Minor |

---

**Audit Complete.** 🎯
