# Memory Bank — Active Context

## Project
- Repo: `blogspy-saas` (Next.js/TypeScript)
- Workspace: `e:/startup/blogspy-saas`

## Operating Constraints
- Hardware: 4GB RAM (avoid heavy indexing/search)
- Build discipline: run `npm run build` after every file edit

## Current Objective
- Refactor Keyword Research backend layers (services/utils/actions) for clean separation of concerns:
  - Discovery: DataForSEO Labs (keyword suggestions)
  - Live refresh: DataForSEO SERP (weak-spot + AIO presence)
  - Actions: thin secured entrypoints delegating to services
- Wire UI refresh to server action (no more client-side simulated refresh).

## UI Design System (Record)
- Style target: "Linear/Vercel" modern dark mode.
- Containers: `bg-slate-950`.
- Cards: `bg-slate-900/50` + `border border-slate-800`.
- Hover: `hover:bg-slate-800/80` + `transition-all duration-200`.
- Spacing: generous whitespace (`gap-4`, `p-4`), avoid dense tables.
- Typography:
  - Titles: `text-sm font-medium text-slate-200`
  - Meta: `text-xs text-slate-500`
  - Stats: `font-mono text-xs text-indigo-400`

## Current Focus Areas (from open tabs)
- Keyword research feature: drawers, table columns, filters
  - `src/features/keyword-research/...`
  - `app/dashboard/research/keyword-magic/page.tsx`

## Notes
- Follow Read → Plan → Act → Check loop.
- Update `decisionLog.md` after completing any fix/feature.
