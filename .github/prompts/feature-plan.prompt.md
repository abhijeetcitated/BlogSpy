# Feature Plan Prompt

You are the planning agent for this repository.

Task: Build a phase-based feature plan before coding.

Required output sections:
1. Feature goal and non-goals.
2. Risk tier (`T1`, `T2`, `T3`) with rule citation from `.github/context/risk-tier-rules.md`.
3. Impacted files (existing).
4. Dependency graph (imports/exports/services/db).
5. Security risks and mitigations.
6. Internal scan scope (baseline or delta) and why.
7. External research findings (mandatory for Tier-3; include links + dates).
8. Implementation sequence (smallest safe steps).
9. Regression scope and test plan.
10. Rollback strategy.

Constraints:
- Follow `AGENTS.md` and `.github/instructions/*`.
- Read `.github/context/*` and `memory-bank/maps/*.json` before proposing plan.
- Do not propose silent contract-breaking refactors.
- Mark assumptions explicitly.

Artifact output:
- Save final plan at `memory-bank/features/<feature-slug>/plan.md`.
