# CitaTed Copilot Instructions

This repository uses `AGENTS.md` as the primary policy contract.
If this file conflicts with `AGENTS.md`, follow `AGENTS.md` and update this file.

## Core Alignment
- Next.js App Router code lives in `src/app`.
- Prefer Server Actions for mutations (`src/actions` or `src/app/**/actions.ts`).
- Avoid new `src/app/api/**` routes unless webhook/streaming is explicitly required.
- Validate inputs with Zod.
- Avoid `any` in new code.
- Preserve existing wiring unless migration is planned and verified.

## Delivery Discipline
- Create plan first, then implement.
- Run regression checks for impacted flows.
- After any code change run `npm run build` and fix failures.

## Companion Files
- Path-scoped rules: `.github/instructions/*.instructions.md`
- Skills: `.github/skills/**/SKILL.md`
- Prompts: `.github/prompts/*.prompt.md`
- Agents: `.github/agents/*.agent.md`
- Context and maps: `.github/context/*`, `memory-bank/maps/*.json`

## Planning Baseline
- Before feature planning, load `.github/context/*`.
- For implementation/review, use `memory-bank/maps/*.json` and save feature artifacts to `memory-bank/features/<feature-slug>/`.

## Dependency Security Governance
- For unresolved dependency advisories, maintain `.github/context/dependency-risk-register.md`.
- Follow `.github/context/dependency-monitoring-plan.md` for cadence and escalation.
- On any dependency/security change:
  - run `npm audit --omit=dev`
  - run `npm run build`
  - update risk register status if vulnerabilities remain
