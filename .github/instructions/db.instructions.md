---
applyTo: "prisma/schema.prisma,prisma/**/*.sql,src/lib/**/*.ts,src/services/**/*.ts,src/actions/**/*.ts"
---
# Database Instructions

## Objective
Preserve data integrity, performance, and migration safety.

## Rules
- Treat schema changes as backward-compatible unless migration plan says otherwise.
- Add indexes for high-cardinality filters and frequent joins.
- Use transactional boundaries for multi-step writes.
- Keep read/write paths tenant-scoped.

## Prisma Workflow
- After schema changes run `npx prisma generate`.
- Document migration risk and rollback steps.

## Required Checks
- Validate query plans for critical new queries.
- Confirm no N+1 regressions in hot paths.
- Re-run feature regression and `npm run build`.
