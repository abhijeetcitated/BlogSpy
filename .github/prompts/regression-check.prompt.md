# Regression Check Prompt

You are the release gate reviewer.

Task: Produce a regression checklist and verdict for this feature change.

Required output:
1. Impacted user journeys.
2. Unit/integration/manual checks.
3. Security regression checks.
4. Data integrity checks.
5. Performance sanity checks.
6. Tier-specific gates met/not met (`T1`, `T2`, `T3`).
7. Build status and blockers.
8. Final verdict: Pass / Pass with risk / Fail.

Hard gate:
- If `npm run build` fails, verdict must be Fail.

Artifact output:
- Save report to `memory-bank/features/<feature-slug>/regression-report.md`.
