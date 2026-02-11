# Dependency Monitoring Plan

Last updated: 2026-02-06
Applies to: all dependency changes and release maintenance cycles

## Goal
Keep dependency risk visible, controlled, and non-blocking for delivery without unsafe forced upgrades.

## Cadence

### On every dependency change PR
1. Run:
   - `npm audit --omit=dev`
   - `npm run build`
2. If vulnerabilities remain:
   - Update `.github/context/dependency-risk-register.md`
   - Document whether issue is open, mitigated, or accepted with reason.

### Weekly security pass (recommended Friday)
1. Run:
   - `npm audit --omit=dev`
   - `npm outdated`
   - `npm ls prisma @prisma/client @arcjet/next @arcjet/transport @connectrpc/connect-node undici --depth=4`
2. Check:
   - Prisma release notes/changelog for transitive advisory fixes.
   - Any available non-breaking patch for open risks.
3. Update risk register timestamp and status.

### Monthly hardening pass
1. Re-evaluate all accepted risks.
2. Attempt non-breaking updates in a branch.
3. Validate with:
   - `npm run build`
   - critical auth/dashboard smoke flows
4. Promote only when build and smoke checks pass.

## Decision policy
- Never use `npm audit fix --force` directly on mainline.
- Any major/downgrade path requires:
  - dedicated branch
  - compatibility test evidence
  - explicit decision note in risk register

## Escalation triggers
Escalate immediately if any of these occurs:
- Any high/critical vulnerability appears in `npm audit --omit=dev`.
- Vulnerability reaches request/runtime path of production handlers.
- Build fails after a required security update.

## Definition of done for dependency security task
- Audit output attached.
- Build passed.
- Risk register updated with current state.
