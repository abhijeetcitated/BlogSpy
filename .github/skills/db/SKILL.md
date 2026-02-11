# Database Skill

## Purpose
Guide schema/query changes with integrity and performance safeguards.

## Rules
- Use transaction-safe patterns for related writes.
- Validate tenant boundaries for all read/write paths.
- Add indexes where required by workload.
- Avoid destructive schema operations without rollback plan.

## Deliverables
- Schema impact summary.
- Migration risk and rollback notes.
- Query/index checklist.
