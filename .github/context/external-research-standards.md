# External Research Standards (Verified)

Last reviewed: 2026-02-06

## Research method
1. Prefer official vendor docs and release notes.
2. Record source links and verify dates.
3. Separate facts from team-specific inferences.

## Current external standards used by this repo

### Next.js 16
- Routing/caching behavior and new directives are documented in official Next.js 16 release notes.
- Source: https://nextjs.org/blog/next-16

### Supabase security
- RLS must be enabled and policies must explicitly enforce authenticated scope.
- Sources:
  - https://supabase.com/docs/guides/database/postgres/row-level-security
  - https://supabase.com/docs/guides/api/securing-your-api

### DataForSEO operations
- Request limits and endpoint-specific limits/concurrency must be respected; design async/retry-aware calls.
- Sources:
  - https://dataforseo.com/help-center/rate-limits-and-request-limits
  - https://docs.dataforseo.com/v3/

### Upstash queue/reliability
- Use retries, DLQ/failure handling, and queue controls for resilient async tasks.
- Sources:
  - https://upstash.com/docs/qstash/features/retry
  - https://upstash.com/docs/qstash/howto/handling-failures
  - https://upstash.com/docs/workflow/features/dlq
  - https://upstash.com/docs/qstash/features/queues

### Delivery and reliability strategy
- Small batch size and progressive rollout improve speed + stability.
- Reliability goals should be error-budget driven, not absolute perfection.
- Use DORA's current five-metrics model as the default performance lens.
- Sources:
  - https://dora.dev/guides/dora-metrics/
  - https://dora.dev/guides/dora-metrics/history
  - https://sre.google/sre-book/introduction/
  - https://sre.google/workbook/error-budget-policy/

## Mandatory usage in planning
- Planner must cite at least 2 relevant external primary sources for Tier-3 work.
- Implementer must document applied constraints (limits, retries, auth model).
- Reviewer must verify that external constraints are represented in tests/checklists.
