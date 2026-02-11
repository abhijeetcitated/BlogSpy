---
applyTo: "src/**/*.ts,src/**/*.tsx,prisma/**/*.prisma,proxy.ts"
---
# Security Instructions

## Objective
Ship secure-by-default behavior for auth, data access, and external integrations.

## Rules
- Threat model each feature: abuse path, impact, mitigation.
- Enforce tenant/user isolation in queries and actions.
- Never trust client-provided identifiers without validation.
- Keep secrets server-only and never expose in client bundles.
- Add rate limiting/abuse controls where cost or write amplification exists.

## Supabase/RLS
- Prefer RLS-protected access paths.
- Validate that policies enforce tenant boundaries.
- Confirm no privileged bypass path is reachable from user-triggered flows.

## Required Checks
- Security checklist output is mandatory before merge.
- Verify authz for create/read/update/delete paths.
