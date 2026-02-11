---
applyTo: "src/actions/**/*.ts,src/app/**/actions.ts,src/services/**/*.ts,src/lib/**/*.ts"
---
# Backend Instructions

## Objective
Keep backend changes predictable, typed, and compatible with existing wiring.

## Rules
- Use Server Actions for mutations.
- Keep handlers idempotent where possible.
- Parse external/user input with Zod before business logic.
- Return typed errors and avoid leaking raw internals.
- Do not silently change shared function contracts.

## Next.js 16 Notes
- In page components, await `params` and `searchParams` promises.
- Avoid legacy patterns that bypass App Router conventions.

## Required Checks
- Build impacted flow map before edits.
- Update all consumers when exports or signatures change.
- Run feature regression checklist and then `npm run build`.
