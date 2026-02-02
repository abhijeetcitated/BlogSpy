# 🧪 Master QA Audit Prompt: Keyword Explorer Feature

> **Role:** Senior Frontend Architect & Test Engineer  
> **Mission:** Conduct a generic, line-by-line "Code & Logic Integrity Check" of the Keyword Explorer feature.  
> **Output:** A brutal validation report proving 100% correctness or exposing hidden flaws.

---

## 📋 Instructions for the AI Agent

Please analyze the following `src/features/keyword-research` files and verify logic integrity across these 5 dimensions. For every check, provide a **PASS/FAIL** verdict with code evidence.

### 🔍 DIMENSION 1: SEARCH & INPUT LOGIC
**Target File:** `src/features/keyword-research/components/search/keyword-search-form.tsx`

1.  **Input Validation:**
    *   Does the search bar prevent empty string submission?
    *   How is whitespace handled? (`trim()`?)
    *   Is there a character limit enforced?
2.  **State Management:**
    *   Does `isLoading` state *immediately* disable the input and button?
    *   Is there a debounce mechanism for the input or suggestions?
3.  **User Feedback:**
    *   Does the UI show a clear spinner/loading state during the fetch?
    *   Does it handle "No Results" or "Error" states gracefully?

### 🎛️ DIMENSION 2: FILTER ENGINE PRECISION
**Target File:** `src/features/keyword-research/utils/filter-utils.ts`

1.  **Multi-Select Logic (Intent):**
    *   Verify the logic: Is it `OR` (match *any* selected) or `AND` (match *all* selected)?
    *   Code Check: `k.intent.some(i => selected.includes(i))`?
2.  **Range Filter Boundaries (Volume, KD, CPC):**
    *   **Zero Handling:** Does `min: 0` correctly include keywords with `0` value?
    *   **Null Handling:** How are `null`/`undefined` API values treated? (Should default to 0).
    *   **Inclusive/Exclusive:** Is the logic `>= min && <= max`?
3.  **Text Filters (Include/Exclude):**
    *   **Include Logic:** Must contain ALL terms (`AND`) or ANY term (`OR`)?
    *   **Exclude Logic:** Must exclude if containing ANY term (`OR`)?
    *   **Case Sensitivity:** Is everything normalized to `.toLowerCase()` before comparing?

### 📊 DIMENSION 3: TABLE & SORTING MATH
**Target Files:** `src/features/keyword-research/utils/sort-utils.ts`, `KeywordTable.tsx`

1.  **Numeric Sorting Integrity:**
    *   Verify sorting for `Volume`, `CPC`, `KD`.
    *   **Crucial:** Ensure it uses `a - b` (numeric) and NOT `a.localeCompare(b)` (string).
    *   *Test Case:* Does `100` come after `20`? (String sort would put `100` before `20`).
2.  **Complex Sorting (RTV & Trend):**
    *   **Trend Sort:** How is the "Trend" column sorted? By last month? By growth %?
    *   **RTV Sort:** Is the calculated RTV value sortable?
3.  **Sparkline Data Safety:**
    *   In `trend-column.tsx`, how does it handle an empty array `[]` or single data point?
    *   Does it crash on `division by zero` if the first month value is `0`?

### 📉 DIMENSION 4: FORMULA VERIFICATION (The "Truth")
**Target Files:** `rtv-calculator.ts`, `geo-calculator.ts`

1.  **RTV (Realizable Traffic Value):**
    *   Verify the negative multipliers: `AI Overview` (-50%), `Ads` (-15%).
    *   **Logic Check:** Is the formula `Volume * (1 - Loss)`?
    *   **Cap Check:** Is the total loss capped at 85%?
2.  **GEO Score:**
    *   Verify the weights: `AIO (+40)`, `Snippet (+30)`, `Intent (+20)`.
    *   Is the final score clamped between 0 and 100?

### ⚡ DIMENSION 5: ACTION TIMING & SECURITY
**Target Files:** `fetch-keywords.ts`, `keyword-store.ts`

1.  **Credit Deduction Order:**
    *   Does the credit deduction happen **strictly BEFORE** the API data fetch? [Security Critical]
    *   Is there an "Atomic" transaction or check to prevent negative balance?
2.  **Race Conditions:**
    *   If a user clicks "Search" twice rapidly, does the second request get cancelled or blocked?
3.  **Data Consistency:**
    *   When new data arrives, does it *replace* or *append* to the existing list? (Check Store logic).

---

### 🛠️ DIMENSION 6: AUTO-FIX PROTOCOL (Critical)
**Instruction:**
*   If you encounter a **CLEAR** Logic, Math, or Sorting error (e.g., missing sort case, wrong formula multiplier, or missing validation):
*   **DO NOT ASK FOR PERMISSION.**
*   **GENERATE THE FIX** and apply it immediately using `replace_file_content`.
*   **Condition:** Only auto-fix if the error is "Sahi/Galat" (Binary) — do not auto-fix subjective design choices.

---

## 📝 Report Template to Generate

```markdown
# 🛡️ Keyword Explorer Logic Audit Report

## 1. Search Bar Logic
- **Input Trim:** [PASS/FAIL] - Code: `query.trim()`
- **Loading State:** [PASS/FAIL] - Code: `disabled={isLoading}`

## 2. Filter Math
- **Volume Range:** [PASS/FAIL] - Logic: `>= min && <= max`
- **Intent Filter:** [PASS/FAIL] - Logic: `OR` condition confirmed

## 3. Table Sorting
- **Numeric Sort:** [PASS/FAIL] - Confirmed `a.volume - b.volume`
- **Trend Sort:** [PASS/FAIL] - Uses calculated growth %

## 4. Formulas
- **RTV:** [PASS/FAIL] - Correct multipliers found
- **GEO:** [PASS/FAIL] - Correct weights found

## 5. Security
- **Credit Timing:** [PASS/FAIL] - Deduction occurs at line X, Fetch at line Y
```
