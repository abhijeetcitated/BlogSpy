# Feature Plan: dashboard-project-create-stability

> Risk Tier: **Tier 2** (existing feature action/service wiring, shared component edits, touches server state)
> Date: 2026-02-07
> Author: Planner Agent

---

## 1. Problem Statement

The dashboard project-creation flow has multiple reliability issues:

1. **`INTERNAL_SERVER_ERROR` on project create** — Prisma errors (connectivity, timeouts, constraint violations beyond P2002) are not caught by the `createProject` server action; the `handleServerError` in `safe-action.ts` maps any non-alphanumeric error message to `INTERNAL_SERVER_ERROR`, giving users no actionable feedback.
2. **Existing projects not visible in sidebar/project switcher** — If `getProjects()` throws due to Prisma connectivity, `AppSidebar` catches it and passes `projects = []`. No retry, no user feedback.
3. **Country code normalization gap** — `CountrySelector` emits ISO 3166-1 `GB`, but `SUPPORTED_PROJECT_COUNTRIES` only includes `UK`. The Zod `.transform()` already maps `GB → UK`, but the client-side COUNTRY_FLAGS map in `ProjectSwitcher` and the optimistic project both use the pre-transform `country` value. If the CountrySelector ever emits a code outside the supported set (e.g., a country from the extended list), the Zod refine fails silently.
4. **Prisma + Supabase TLS/pooler stability** — The `prisma.ts` pool setup handles SSL configuration, but there's no connection validation or recovery strategy when the pool has stale/dead connections.

## 2. Root Cause Analysis

### 2.1 INTERNAL_SERVER_ERROR

- **File**: `src/features/dashboard/actions/create-project.ts`
- The `catch` block only handles `Prisma.PrismaClientKnownRequestError` with code `P2002` (duplicate). All other errors (connectivity, validation, pooler timeout, unknown Prisma errors) rethrow the raw error.
- **File**: `src/lib/safe-action.ts` line 106
- `handleServerError` tests if the error message matches `/^[A-Z0-9_]{3,80}$/`. Prisma error messages like `"Can't reach database server at..."` fail this test → returns `"INTERNAL_SERVER_ERROR"`.

### 2.2 Projects Not Visible

- **File**: `src/components/shared/layout/app-sidebar.tsx`
- If `getProjects()` throws, `catch` sets `projects = []`. No retry. No error indicator in sidebar.
- **File**: `src/features/dashboard/actions/get-projects.ts`
- No error wrapping. Raw Prisma errors propagate.

### 2.3 Country Code Normalization

- **File**: `src/features/dashboard/actions/create-project.ts` line 21-26
- `normalizeProjectCountry` handles `GB → UK`. ✅
- **File**: `src/features/dashboard/components/AddProjectDialog.tsx` line 138
- The optimistic project uses `country` (the pre-submit state `"GB"`) for `targetcountry`. This could lead to display inconsistency in the sidebar immediately after create (shows `GB` flag lookup fails, gets `🌍` fallback).

### 2.4 Prisma Connection Stability

- **File**: `src/lib/prisma.ts`
- No connection validation (`pg` Pool `connectionTimeoutMillis`, `idleTimeoutMillis`).
- No explicit `statement_timeout` or `query_timeout` for Supabase pooler.
- Pool signature-based recycling is good but pool has no health-check.

## 3. Impacted Files

| # | File | Change Type | Risk |
|---|------|------------|------|
| 1 | `src/features/dashboard/actions/create-project.ts` | Edit: improve Prisma error handling | Medium |
| 2 | `src/features/dashboard/actions/get-projects.ts` | Edit: add error wrapping | Low |
| 3 | `src/features/dashboard/components/AddProjectDialog.tsx` | Edit: normalize country in optimistic project | Low |
| 4 | `src/lib/prisma.ts` | Edit: add Pool config for timeouts | Medium |
| 5 | `src/components/shared/layout/app-sidebar.tsx` | Edit: improve error handling for getProjects | Low |

## 4. Change Specification

### 4.1 Fix `create-project.ts` — Classify Prisma errors

```
Wrap the entire try/catch to map common Prisma errors to safe error codes:
- PrismaClientInitializationError → "DATABASE_UNAVAILABLE"
- PrismaClientKnownRequestError P2002 → "DUPLICATE_DOMAIN" (existing)
- PrismaClientKnownRequestError P2003 → "DATABASE_CONSTRAINT_ERROR"
- PrismaClientKnownRequestError (other) → "DATABASE_ERROR"
- Connection/timeout errors → "DATABASE_UNAVAILABLE"
- General Error → re-throw with safe message
```

### 4.2 Fix `get-projects.ts` — Wrap Prisma errors

```
Add try/catch around prisma.userProject.findMany.
On error: log and return [] with console.error.
(Do not throw — AppSidebar already handles empty array gracefully)
```

### 4.3 Fix `AddProjectDialog.tsx` — Normalize country in optimistic project

```
Apply normalizeProjectCountry on the client side for optimistic display.
Map "GB" → "UK" before building optimisticProject.
Add a simple CLIENT_COUNTRY_MAP constant.
```

### 4.4 Harden `prisma.ts` — Pool configuration

```
Add connectionTimeoutMillis: 10_000
Add idleTimeoutMillis: 30_000
Add max: 5 (limit pool size for serverless)
Add statement_timeout: '30s' via pool connection options
```

### 4.5 Fix `app-sidebar.tsx` — Resilient project loading

```
No structural change needed. The existing try/catch with fallback to [] is adequate.
Add a more descriptive log message. Keep behavior unchanged.
```

## 5. Execution Order

1. `prisma.ts` — Harden pool config (foundation fix)
2. `create-project.ts` — Classify errors (core fix)
3. `get-projects.ts` — Wrap errors (defense-in-depth)
4. `AddProjectDialog.tsx` — Normalize country (display fix)
5. `app-sidebar.tsx` — Improve log (observability)
6. Run `npm run build`

## 6. Security Checklist

- [x] No new exports or API routes
- [x] No auth path changes
- [x] No schema changes
- [x] No RLS policy changes
- [x] All user input validation preserved (Zod schema intact)
- [x] No secrets exposed
- [x] Error messages are safe codes (no internal details leaked)

## 7. Regression Scope

- Dashboard project creation flow
- Sidebar project loading
- Project switcher display
- Country selection and normalization
- All existing Prisma queries (pool config change)

## 8. Rollback Plan

All changes are backward-compatible. Rollback = revert the commit.
No schema migrations. No external service changes.
