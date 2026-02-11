# Dependency Security Risk Register

Last updated: 2026-02-06
Scope: `npm audit --omit=dev`

## Current baseline
- Total vulnerabilities: 8
- Severity: 8 moderate, 0 high, 0 critical
- Operational status: deployable with documented risk acceptance and active monitoring

## Open risks

### R-001: Prisma toolchain transitive `hono` advisories
- Audit path: `prisma -> @prisma/dev -> hono`
- Advisories:
  - `GHSA-9r54-q6cx-xmh5`
  - `GHSA-6wqw-2p9w-4vw4`
  - `GHSA-r354-f388-2fhh`
  - `GHSA-w332-q679-j88p`
- Current status: Open (moderate)
- Why not force-fix: `npm audit fix --force` suggests Prisma downgrade (`6.19.2`) and can break current stack (`prisma@7.3.0`).
- Current compensating controls:
  - No forced Prisma downgrade.
  - Runtime app path uses `@prisma/client`; affected packages are in Prisma tooling chain.
  - Mandatory build gate remains enforced after dependency changes.
- Exit criteria:
  - Prisma releases a compatible version where this chain is patched.
  - Upgrade path verified with `npm run build` and smoke checks.

### R-002: Prisma toolchain transitive `lodash` advisory
- Audit path: `prisma -> @prisma/dev -> @mrleebo/prisma-ast -> chevrotain -> lodash`
- Advisory:
  - `GHSA-xxjr-mmjv-4gpg`
- Current status: Open (moderate)
- Why not force-fix: same Prisma downgrade risk as R-001.
- Current compensating controls:
  - No force-fix/downgrade.
  - Monitor upstream Prisma and transitive dependency patches.
  - Keep lockfile changes controlled and reviewed.
- Exit criteria:
  - Compatible dependency graph removes vulnerable `lodash` path without breaking Prisma 7.x workflow.

## Recently reduced risks
- Arcjet/Undici chain reduced by upgrading:
  - `@arcjet/next` -> `1.1.0`
  - `@arcjet/inspect` -> `1.1.0`
  - Resulting chain:
    - `@arcjet/transport@1.1.0`
    - `@connectrpc/connect-node@2.1.1`
    - `undici@7.21.0`

## Required proof commands
Run and attach outputs in dependency/security change work:

```bash
npm audit --omit=dev
npm ls prisma @prisma/client @arcjet/next @arcjet/transport @connectrpc/connect-node undici --depth=4
npm run build
```
