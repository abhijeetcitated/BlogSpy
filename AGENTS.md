# DRAGON GOD MODE - CODEX INSTRUCTIONS (v2026)

> IDENTITY: APEX DEVELOPER
> TARGET: blogspy-saas (CitaTed)

## Rule 0: Build Gate (Mandatory)
After ANY code change, run:

```bash
npm run build
```

If build fails, fix immediately before marking task done.

## Stack Contract (Strict)
- Next.js v16.1.1: `params` and `searchParams` are promises in pages.
- React v19.2.3: use `useActionState`; avoid `forwardRef` unless legacy interop is required.
- Tailwind v4.1.18: theme via CSS variables in `src/app/globals.css`.
- Prisma v7.3.0: run `npx prisma generate` after schema changes.
- Supabase v0.8.0 (`@supabase/ssr`): RLS mandatory.
- Mutations: use `next-safe-action` + `zod`.

## Coding Commandments
1. App Router only (`src/app`).
2. Mutations are Server Actions in `src/actions` or `src/app/**/actions.ts`.
3. Do not create new `src/app/api/**` routes unless webhook/streaming is explicitly required.
4. No `any` in new code.
5. Parse all inputs with Zod.

## Source-of-Truth Order
1. `AGENTS.md` (this file)
2. `.github/copilot-instructions.md`
3. `.github/instructions/*.instructions.md` (path-scoped)
4. Prompt / Agent / Skill files

If conflicts exist, follow this order and fix lower-priority files.

## Senior Workflow (7 phases + 2 hidden gates)
- Phase 0 (hidden): Preflight baseline capture.
- Phase 1: Research and discovery.
- Phase 2: Security and threat modeling.
- Phase 3: Wiring blueprint and dependency map.
- Phase 4: Implementation.
- Phase 5: Verification and crash testing.
- Phase 6: Self-correction loop.
- Phase 7: Future-proof handover.
- Phase 8 (hidden): Post-merge validation.

## Baseline + Delta Scanning Process
Before feature work:
1. One-time baseline scan of required code:
   - `src/**`
   - `package.json`, `tsconfig*.json`, `next.config.*`, `proxy.ts`
   - `prisma/schema.prisma`
   - auth/supabase/db wiring files under `src/lib/**`, `src/services/**`, `src/actions/**`
2. Build dependency and wiring maps (imports/exports, routes, actions, data flow).

For each feature:
1. Run delta scan only on impacted files + direct dependents.
2. Expand scope only when dependency graph requires it.
3. Refresh machine maps with `npm run maps:generate` weekly and before Tier-3 releases.

Default exclude list:
- logs, build outputs, snapshots, generated files, vendor folders, random docs.
- exception: always include governance docs (`AGENTS.md`, `.github/instructions/**`, `.github/skills/**/SKILL.md`, `.github/prompts/**`, `.github/agents/**`).

## Do Not Break Existing Wiring
- Never remove existing exports without updating all consumers.
- Never silently refactor shared modules.
- If file contracts change, update all importers in the same change.
- Add explicit backward-compat notes in PR/change summary.

## Mandatory Per-Feature Artifacts
1. `feature-plan.prompt.md` output
2. `wiring-audit.prompt.md` output
3. `regression-check.prompt.md` output

No implementation starts before plan + wiring artifacts are complete.

Artifacts are stored under:
- `memory-bank/features/<feature-slug>/plan.md`
- `memory-bank/features/<feature-slug>/wiring-audit.md`
- `memory-bank/features/<feature-slug>/regression-report.md`

Context files to read before planning:
- `.github/context/src-index.md`
- `.github/context/root-critical-files.md`
- `.github/context/wiring-map.md`
- `.github/context/integration-catalog.yaml`
- `.github/context/risk-tier-rules.md`
- `.github/context/external-research-standards.md`
- `memory-bank/maps/import-graph.json`
- `memory-bank/maps/route-action-map.json`
- `memory-bank/maps/db-table-map.json`

## Agent Role Contracts
- Planner: read-only analysis, sequencing, risk map, no code edits.
- Implementer: constrained edits aligned to plan, no silent architecture drift.
- Reviewer: regression/security/wiring validation and release gate verdict.

## Execution Checklist
1. Read relevant files.
2. Produce/refresh feature plan and wiring audit.
3. Implement minimal safe change set.
4. Run tests relevant to scope.
5. Run `npm run build`.
6. Fix all failures.
7. Produce regression report and handover notes.

Final reminder: Preserve CitaTed branding (`Cita` white + `Ted` amber).
