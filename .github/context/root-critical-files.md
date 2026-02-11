# Root Critical Files

Last updated: 2026-02-06

## Runtime and Build
- `package.json`: scripts/dependencies/build command contract.
- `package-lock.json`: deterministic dependency resolution.
- `tsconfig.json`: TS strictness + path aliases.
- `next.config.ts`: Next.js runtime/build behavior.
- `proxy.ts`: auth/session request interception path.
- `eslint.config.mjs`: lint baseline.

## Database/Auth/Infra
- `prisma/schema.prisma`: relational data model and indexes.
- `prisma.config.ts`: Prisma runtime config.
- `supabase/migrations/**`: SQL and policy evolution.
- `.vscode/mcp.json`: MCP server access config (Supabase/Upstash/Postgres/etc).

## Governance and Agent Control
- `AGENTS.md`: source-of-truth policy and workflow contract.
- `.github/copilot-instructions.md`: repo-wide AI behavior (must align to AGENTS).
- `.github/instructions/*.instructions.md`: path-scoped coding/security/db/wiring rules.
- `.github/agents/*.agent.md`: planner/implementer/reviewer/orchestrator roles.
- `.github/prompts/*.prompt.md`: mandatory planning/audit/regression artifacts.
- `.github/skills/**/SKILL.md`: specialized execution checklists.
- `.github/context/*`: internal architecture memory + external research standards.

## Product memory
- `memory-bank/activeContext.md`
- `memory-bank/decisionLog.md`
- `memory-bank/progress.md`
- `memory-bank/projectbrief.md`
- `memory-bank/maps/*.json`

## Critical edit policy
1. Any change touching files above is Tier-3 unless explicitly proven otherwise.
2. Contract changes require wiring audit + reviewer gate.
3. Any code change still requires `npm run build` pass.
