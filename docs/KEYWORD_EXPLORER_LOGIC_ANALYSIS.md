# 🧠 Keyword Explorer: Correct vs Incorrect Logic Analysis
**Context:** Feature Audit & Optimization
**Date:** 2026-01-21

## 1. ✅ What is CORRECT (Do Not Touch)
The following patterns are architecturally sound and should be preserved:

*   **Mock Data Strategy:**
    *   Keeping `useMockMode()` active is **Correct** for the current Dev/Test phase.
    *   Using simulated latency (800ms) in `fetchKeywords` is **Correct** to mimic real-world UI states.

*   **RTV Formula Button:**
    *   Calculated metrics (`Volume - Loss%`) are **Correct**.
    *   The "Formula Button" provides necessary transparency. This is **Correct** UX.

*   **Zustand Store (`store/index.ts`):**
    *   Centralized state is **Correct**. It prevents prop-drilling hell.

*   **Filter Logic (`filter-utils.ts`):**
    *   The O(n) single-pass filtering is **Correct** and high-performance.

## 2. ❌ What is INCORRECT (Needs Attention)
The following areas show potential fragility or logic gaps:

*   **Geo Score Calculation (`geo-calculator.ts`):**
    *   *Current:* Based on heuristics (word count + intent).
    *   *Issue:* It doesn't factor in **Backlink Difficulty** or **Domain Authority** fully (though this might be intentional for "Version 1").
    *   *Verdict:* Acceptable for now, but mark as "Heuristic" in UI.

*   **Missing Error Boundary granularity:**
    *   If `mapKeywordData` fails for *one* item, it might crash the whole list locally.
    *   *Verdict:* Needs a `try/catch` inside the mapper loop for robustness.

*   **Hardcoded "US" Default:**
    *   `keyword-research-content.tsx` defaults to "US" if params are missing.
    *   *Issue:* Should ideally detect user locale or stick to last used.
    *   *Verdict:* Minor UX friction.

## 3. 🧠 Memory Bank Update (GEMINI.md Protocol)
*   **Protocol:** "Keyword Explorer relies on **Client-Side Calculation** for RTV and GeoScore using raw data from `keyword.service.ts`. Mocks are intentional."
