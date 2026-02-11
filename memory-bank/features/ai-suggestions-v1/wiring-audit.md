# AI Suggestions V1 — Wiring Audit (v2)

**Feature slug**: `ai-suggestions-v1`
**Date**: 2026-02-07 (v2)
**Author**: Gama Orchestrator (planner phase)

---

## v2 Delta Summary

This audit covers ONLY the v2 changes (card contract alignment, auto-refresh, error state).
The v1 wiring (static -> dynamic, server action, rule engine) is already in place and verified.

---

## v2 Changes — File-by-File

### 1. `src/features/dashboard/components/command-center-data.ts`

**Change**: Update `AgenticSuggestion` interface
- RENAME: `action` -> `ctaLabel`
- RENAME: `actionHref` -> `ctaHref`
- RENAME: `timeAgo` -> `freshness`
- ADD: `evidence: string`
- ADD: `effort?: string`

**Consumers**: engine, action (return type), agentic-suggestions.tsx, CommandCenter, DashboardClient
**Risk**: LOW — all consumers in same feature directory

### 2. `src/features/dashboard/services/suggestion-engine.ts`

**Change**: Update all 8 `suggestions.push()` calls
- RENAME: `action:` -> `ctaLabel:`
- RENAME: `actionHref:` -> `ctaHref:`
- RENAME: `timeAgo:` -> `freshness:`
- ADD: `evidence:` with data-specific text per type
- ADD: `effort:` with estimated time per type

**Consumers**: fetch-ai-suggestions.ts (calls `generateSuggestions`)
**Risk**: LOW — pure function, type-checked

### 3. `src/features/dashboard/components/agentic-suggestions.tsx`

**Change**: Update SuggestionCard render
- UPDATE: `suggestion.action` -> `suggestion.ctaLabel`
- UPDATE: `suggestion.actionHref` -> `suggestion.ctaHref`
- UPDATE: `suggestion.timeAgo` -> `suggestion.freshness`
- ADD: Render `suggestion.evidence` (bold text above description)
- ADD: Render `suggestion.effort` if present (badge/tag)
- ADD: `error?: boolean` prop
- ADD: ErrorState component (shown when error = true and no suggestions)

**Consumers**: CommandCenter.tsx
**Risk**: LOW — UI only

### 4. `src/features/dashboard/CommandCenter.tsx`

**Change**: Add `suggestionsError?: boolean` prop
- PASS to `<AgenticSuggestions error={suggestionsError} />`

**Consumers**: DashboardClient.tsx
**Risk**: LOW — additive prop

### 5. `src/features/dashboard/components/DashboardClient.tsx`

**Change**:
- ADD: `suggestionsError` state (boolean)
- ADD: Set error on failed fetch (catch/no data)
- ADD: 30m auto-refresh interval (`setInterval` + cleanup in `useEffect`)
- PASS: `suggestionsError` to CommandCenter

**Consumers**: dashboard/page.tsx (no prop change)
**Risk**: LOW — internal state only

---

## Export/Import Contract — v2 Changes

### Changed Exports

| Symbol | File | Change | Impact |
|--------|------|--------|--------|
| `AgenticSuggestion` | command-center-data.ts | Interface fields renamed/added | All consumers auto-update via TypeScript |

### Preserved Exports (no change)

All exports from v1 remain: `BentoGrid`, `AgenticSuggestions`, `AddProjectDialog`, `ProjectSwitcher`, `quickActions`, `recentSearches`, `recentActivity`, type exports.

### New Props Added

| Component | New Props | Consumer |
|-----------|----------|----------|
| `AgenticSuggestions` | `error?: boolean` | CommandCenter.tsx |
| `CommandCenter` | `suggestionsError?: boolean` | DashboardClient.tsx |

---

## Regression Scope — v2

### Must Verify
1. Build passes (npm run build)
2. Dashboard loads — suggestions render
3. Card fields display correctly (evidence, effort, ctaLabel)
4. Refresh button works (30s cooldown)
5. Auto-refresh fires after 30m (verify interval setup)
6. Error state renders when fetch fails
7. BentoGrid/stats unaffected

### Not Impacted
- Auth flow
- Other pages
- Sidebar
- API routes
- Prisma schema

---

## Gate: WIRING AUDIT v2 COMPLETE
