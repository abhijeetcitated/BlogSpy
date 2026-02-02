# Keyword Research – Forensic Audit (Logic & Math Verification)

**Date:** January 21, 2026  
**Scope:** `src/features/keyword-research` (components, utils, services)  
**Reviewer:** Senior QA Automation Engineer & Algorithm Auditor

---

## Executive Summary
This report validates the logic, math, and execution flow in the Keyword Explorer feature. Findings are grouped into four critical zones and rated as:
- ✅ **PASS** — logic is sound and follows best practices
- ⚠️ **WARNING** — suspicious, inconsistent, or incomplete logic
- ❌ **FAIL** — broken logic or security risk

---

## 🔍 Zone 1: Proprietary Math & Algorithms (The Brain)

### 1) RTV Formula
**Status:** ✅ PASS

**What the code does:**
- Calculates total SERP traffic loss from specific feature rules.
- Caps total loss at 85%.
- Uses $RTV = Volume \times (1 - Loss)$.
- AI Overview suppresses Featured Snippet loss.

**Penalty rules (canonical):**
- `ai_overview` → 50%
- `local_pack` → 30%
- `featured_snippet` → 20% (only if no AI Overview)
- `ads_top` or `shopping_ads` or `cpc > 1` → 15%
- `video_pack` → 10%
- Total loss cap → 85%

**extracted_formula:**
```ts
const cappedLoss = Math.min(totalLoss, MAX_LOSS_CAP)
const rtv = Math.floor(volume * (1 - cappedLoss / 100))
```

**Files checked:**
- `src/features/keyword-research/utils/rtv-calculator.ts`

---

### 2) GEO Score Calculation
**Status:** ✅ PASS (with dependency note)

**Formula:**
- +40 if AIO present
- +30 if Featured Snippet present
- +20 if intent is Informational
- +10 if intent is Commercial
- +10 if word count ≥ 5
- Clamp to 0–100

**Dependency note:**
The GEO calculator itself does not parse SERP data. It requires `hasAIO` and `hasSnippet` inputs. These are derived in `data-mapper.ts` and `live-serp.ts` where SERP feature normalization and detection occur.

**Files checked:**
- `src/features/keyword-research/utils/geo-calculator.ts`
- `src/features/keyword-research/utils/data-mapper.ts`
- `src/features/keyword-research/services/live-serp.ts`

---

### 3) Weak Spot Detection (Forums/Community)
**Status:** ⚠️ WARNING

**Exact condition:**
- Checks **top 10** SERP items.
- Extracts hostname from `domain` or `url`.
- Matches against a list of domains.
- Records earliest rank where a weak spot appears.

**Detected domains list:**
- reddit.com
- quora.com
- pinterest.com
- linkedin.com
- medium.com

**Issue:**
The core product UI and filter logic only track Reddit/Quora/Pinterest, but detection includes LinkedIn/Medium. This can produce data that is never surfaced or filtered properly.

**Files checked:**
- `src/features/keyword-research/utils/weak-spot-detector.ts`

---

## 🔍 Zone 2: Filter Logic (The Filter Engine)

### 1) Server vs Client Filtering
**Status:** ⚠️ WARNING

**Finding:**
Filtering is performed **client-side** in `keyword-research-content.tsx` via `applyAllFilters()` and is not enforced in server actions. This is risky for large datasets and can cause performance or memory issues.

**Files checked:**
- `src/features/keyword-research/actions/fetch-keywords.ts`
- `src/features/keyword-research/utils/filter-utils.ts`
- `src/features/keyword-research/keyword-research-content.tsx`

---

### 2) Intent Filter Logic
**Status:** ✅ PASS

**Logic:**
- Multi-select intents are evaluated with **OR** logic.
- Keyword passes if it has **any** of the selected intents.

**Files checked:**
- `src/features/keyword-research/utils/filter-utils.ts`

---

### 3) Range Filters (Volume / KD / CPC)
**Status:** ✅ PASS

**Logic:**
- Inclusive range check: `min <= value <= max`
- `null` or `undefined` values treated as 0
- Default full ranges skip filtering

**Edge case handling:**
- Volume `0` is valid and preserved

**Note:**
GEO filter defaults missing values to `50`, which can pass mid-range filters unexpectedly (see warning below).

**Files checked:**
- `src/features/keyword-research/utils/filter-utils.ts`

---

### 4) GEO Range Filter
**Status:** ⚠️ WARNING

**Issue:**
Missing GEO values are coerced to `50`, meaning keywords with no GEO data can incorrectly pass the filter.

---

## 🔍 Zone 3: Table & Column Logic (The Display)

### 1) Trend Visualization
**Status:** ⚠️ WARNING

**Findings:**
- The sparkline uses the provided array length without padding or normalization.
- Labs data is mapped to **6 months**; UI labels claim **12 months**.
- Missing data results in shorter, potentially misleading lines.

**Files checked:**
- `src/features/keyword-research/components/table/columns/trend/trend-column.tsx`
- `src/features/keyword-research/components/table/columns/columns.tsx`
- `src/features/keyword-research/utils/data-mapper.ts`

---

### 2) Sorting (RTV / GEO)
**Status:** ⚠️ WARNING

**Findings:**
- `sort-utils.ts` does not include cases for `rtv` or `geoScore` even though the type supports them.
- In the current table, TanStack handles sorting by accessor, so `geoScore` is likely numeric there, but the shared utility is incomplete.

**Files checked:**
- `src/features/keyword-research/utils/sort-utils.ts`
- `src/features/keyword-research/components/table/KeywordTable.tsx`

---

## 🔍 Zone 4: Execution Timing & Security (The Action)

### 1) Analyze Trigger / Double-Click Protection
**Status:** ✅ PASS (minor latency window)

**Findings:**
- Analyze button disables when `status === "executing"`.
- There may be a brief timing gap before the status updates, but overall behavior prevents duplicate submits.

**Files checked:**
- `src/features/keyword-research/components/page-sections/KeywordResearchSearch.tsx`

---

### 2) Credit Deduction Timing
**Status:** ✅ PASS

**Order:**
1) Check auth / idempotency
2) Deduct credits atomically
3) Fetch keyword data

This matches secure transactional best practice.

**Files checked:**
- `src/features/keyword-research/actions/fetch-keywords.ts`
- `src/lib/safe-action.ts`

---

## Final Verdict
- ✅ Core math and scoring logic is consistent and defensible.
- ⚠️ Key warnings exist in **filter scaling**, **trend data consistency**, **weak-spot domain mismatch**, and **sorting completeness**.
- ❌ No hard failures detected.

---

## Appendix: File References
- `src/features/keyword-research/utils/rtv-calculator.ts`
- `src/features/keyword-research/utils/geo-calculator.ts`
- `src/features/keyword-research/utils/youtube-intelligence.ts`
- `src/features/keyword-research/utils/weak-spot-detector.ts`
- `src/features/keyword-research/utils/filter-utils.ts`
- `src/features/keyword-research/actions/fetch-keywords.ts`
- `src/features/keyword-research/components/table/columns/columns.tsx`
- `src/features/keyword-research/components/table/columns/trend/trend-column.tsx`
- `src/features/keyword-research/components/table/columns/weak-spot/weak-spot-column.tsx`
- `src/features/keyword-research/utils/sort-utils.ts`
- `src/features/keyword-research/components/page-sections/KeywordResearchSearch.tsx`
- `src/lib/safe-action.ts`
