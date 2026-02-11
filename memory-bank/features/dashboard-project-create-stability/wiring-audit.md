# Wiring Audit: dashboard-project-create-stability

> Date: 2026-02-07
> Author: Planner Agent

---

## 1. Dependency Map

### File: `src/features/dashboard/actions/create-project.ts`

**Imports FROM:**
- `next/cache` → `revalidatePath`
- `url` → `domainToASCII`
- `@prisma/client` → `Prisma`, `UserProject` type
- `@/lib/prisma` → `prisma`
- `@/lib/auth/server-auth` → `getServerUser`
- `@/lib/safe-action` → `publicAction`, `z`

**Exports TO:**
- `src/features/dashboard/components/AddProjectDialog.tsx` → `createProject` (server action)
- Used types: `CreateProjectInput`, `UserProjectPayload`, `CreateProjectResult`

**Change Impact:** Error handling in catch block. No export signature change. No import change. **SAFE.**

---

### File: `src/features/dashboard/actions/get-projects.ts`

**Imports FROM:**
- `@/lib/auth/server-auth` → `getServerUser`
- `@/lib/prisma` → `prisma`

**Exports TO:**
- `src/components/shared/layout/app-sidebar.tsx` → `getProjects`, `ProjectSummary` type

**Change Impact:** Add try/catch inside function body. Return signature unchanged (`Promise<ProjectSummary[]>`). **SAFE.**

---

### File: `src/features/dashboard/components/AddProjectDialog.tsx`

**Imports FROM:**
- `next-safe-action/hooks` → `useAction`
- `@/features/dashboard/actions/create-project` → `createProject`
- `@/store/ui-store` → `useUIStore`
- `@/store/user-store` → `useUserStore`
- `@/components/shared/ui/country-selector` → `CountrySelector`

**Exports TO:**
- `src/features/dashboard/components/ProjectSwitcher.tsx` → `AddProjectDialog`

**Change Impact:** Add local country normalization map. No export signature change. **SAFE.**

---

### File: `src/lib/prisma.ts`

**Imports FROM:**
- `@prisma/client` → `PrismaClient`
- `@prisma/adapter-pg` → `PrismaPg`
- `pg` → `Pool`

**Exports TO:**
- Every server action and service file in the project that uses `prisma`
- Key consumers: `create-project.ts`, `get-projects.ts`, `fetch-stats.ts`, `add-keyword.ts`, `logger.ts`, etc.

**Change Impact:** Adding Pool configuration options (timeouts, max connections). Does not change the exported `prisma` object shape or API. All consumers receive the same `PrismaClient` instance. **SAFE** — behavioral improvement only.

---

### File: `src/components/shared/layout/app-sidebar.tsx`

**Imports FROM:**
- `@/lib/supabase/server` → `createServerClient`
- `@/features/dashboard/actions/get-projects` → `getProjects`, `ProjectSummary`
- `./app-sidebar-client` → `AppSidebarClient`

**Exports TO:**
- `src/app/dashboard/layout.tsx` (or similar layout consuming `<AppSidebar />`)

**Change Impact:** Improve error log message. No functional change. **SAFE.**

---

## 2. Cross-Feature Contract Verification

| Contract | Status |
|----------|--------|
| `createProject` export signature | ✅ No change |
| `CreateProjectResult` type | ✅ No change |
| `UserProjectPayload` type | ✅ No change |
| `getProjects` return type | ✅ No change |
| `ProjectSummary` type | ✅ No change |
| `prisma` export | ✅ Same PrismaClient instance |
| `AppSidebar` component props | ✅ No change |
| `AddProjectDialog` props | ✅ No change |
| `useUserStore` interface | ✅ No change |
| BroadcastChannel protocol | ✅ No change |

## 3. Shared Module Check

| Module | Breaking Change? | Notes |
|--------|-----------------|-------|
| `src/lib/prisma.ts` | No | Pool config change only |
| `src/lib/safe-action.ts` | No | Not modified |
| `src/store/user-store.ts` | No | Not modified |
| `src/lib/auth/server-auth.ts` | No | Not modified |

## 4. Risk Summary

- **Total files changed:** 5
- **Export/API contract changes:** 0
- **Schema changes:** 0
- **New dependencies:** 0
- **Breaking changes:** 0
- **Risk level:** Low-Medium (defensive error handling + pool hardening)

## 5. Verdict

All changes are backward-compatible internal improvements. No consumers need updating. No public contracts change. Safe to proceed to implementation.
