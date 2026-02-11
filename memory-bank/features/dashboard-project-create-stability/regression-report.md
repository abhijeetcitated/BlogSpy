# Regression Report: dashboard-project-create-stability

> Date: 2026-02-07
> Author: Reviewer Agent
> Build Status: **PASS** (no type errors, no broken imports)

---

## 1. Files Changed

| # | File | Lines Changed | Description |
|---|------|--------------|-------------|
| 1 | `src/lib/prisma.ts` | +4 | Added Pool config: `max`, `connectionTimeoutMillis`, `idleTimeoutMillis`, `allowExitOnIdle` |
| 2 | `src/features/dashboard/actions/create-project.ts` | +19 −4 | Classified Prisma errors into safe error codes; improved log prefix |
| 3 | `src/features/dashboard/actions/get-projects.ts` | +6 −0 | Wrapped Prisma query in try/catch; returns `[]` on failure with log |
| 4 | `src/features/dashboard/components/AddProjectDialog.tsx` | +12 −2 | Added `normalizeCountryForDisplay` for optimistic project; added `DATABASE_UNAVAILABLE` and `DATABASE_ERROR` toast cases |
| 5 | `src/components/shared/layout/app-sidebar.tsx` | +1 −1 | Improved error log message for DB failures |

## 2. Regression Checks

### 2.1 Project Creation Flow

| Test Case | Status | Notes |
|-----------|--------|-------|
| Create project with valid name/domain/country | PASS | No signature changes to `createProject` action |
| Create project with GB country code | PASS | `normalizeProjectCountry` maps GB → UK in Zod transform (server); `normalizeCountryForDisplay` maps GB → UK for optimistic display (client) |
| Create project with duplicate domain | PASS | P2002 still throws `DUPLICATE_DOMAIN` |
| Create project when DB is down | IMPROVED | Now returns `DATABASE_UNAVAILABLE` instead of opaque `INTERNAL_SERVER_ERROR` |
| Create project with Prisma constraint error | IMPROVED | P2003 → `DATABASE_CONSTRAINT_ERROR`; other Prisma errors → `DATABASE_ERROR` |
| Create project with connection timeout | IMPROVED | Detected via message pattern → `DATABASE_UNAVAILABLE` |
| Optimistic project display in sidebar | FIXED | Country code normalized to `UK` before display; matches COUNTRY_FLAGS map |

### 2.2 Project Loading in Sidebar

| Test Case | Status | Notes |
|-----------|--------|-------|
| Load projects on authenticated page | PASS | `getProjects()` unchanged API; try/catch adds safety net |
| Load projects when DB is unavailable | IMPROVED | Returns `[]` with server log instead of crashing |
| Project list hydration to Zustand store | PASS | `setProjects()` contract unchanged |
| Project switcher display | PASS | No changes to `ProjectSwitcher.tsx` |

### 2.3 Prisma Pool Stability

| Test Case | Status | Notes |
|-----------|--------|-------|
| Connection acquisition with timeout | IMPROVED | `connectionTimeoutMillis: 10_000` prevents indefinite hangs |
| Idle connection cleanup | IMPROVED | `idleTimeoutMillis: 30_000` releases stale connections |
| Pool size limit for serverless | IMPROVED | `max: 5` prevents connection exhaustion |
| Existing Prisma queries across app | PASS | Pool config change is transparent to all consumers |

### 2.4 Wiring Integrity

| Check | Result |
|-------|--------|
| Export signatures unchanged | PASS |
| Import graph unchanged | PASS |
| Prisma schema unchanged | PASS |
| No new API routes | PASS |
| No auth path changes | PASS |
| No RLS policy changes | PASS |
| All consumers still compile | PASS |

## 3. Security Review

- Error messages are safe alphanumeric codes (pass `handleServerError` regex)
- No internal details leaked to client
- No new attack surface
- Auth flow unchanged
- Input validation (Zod) unchanged

## 4. Risk Summary

| Risk | Level | Mitigation |
|------|-------|------------|
| Pool config could affect other Prisma consumers | Low | `max: 5` is conservative; `connectionTimeoutMillis` is generous at 10s |
| `getProjects` swallowing errors could hide issues | Low | Server-side `console.error` preserves observability |
| Country normalization only applies to display | Low | Server-side normalization (Zod transform) is authoritative |

## 5. Build Gate

```
npm run build → SUCCESS
No type errors. No broken imports. All routes compile.
```

---

## 6. Reviewer Verdict

### **PASS**

All changes are backward-compatible defensive improvements. No contract breaks. No schema changes. Build succeeds. Error handling is now classified with user-actionable feedback instead of opaque `INTERNAL_SERVER_ERROR`. Prisma pool is hardened with timeouts. Country code normalization gap is closed on client side.

**Approved for merge.**
