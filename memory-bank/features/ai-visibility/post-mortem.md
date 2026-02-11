# AI Visibility Feature — Comprehensive Post-Mortem Report

> **Date:** 2026-07-15
> **Feature:** AI Visibility Tracker
> **Scope:** Security, Wiring, DB, API, Architecture, Code Quality
> **Brains Used:** Claude (Host) + gpt-5.2 (Research) + gpt-5.2-codex (Code Audit) + o3-pro (Architecture Review)
> **Verdict:** ❌ **NOT production-ready** — 5 blockers must be fixed before next deploy

---

## Executive Summary

The AI Visibility feature is **functionally complete** (scans work, data is stored, dashboard renders) but has **critical security vulnerabilities**, **API parsing errors**, and **architectural debt** that block safe production deployment. Key issues:

1. **SSRF vulnerability** in audit service (fetches user-supplied domains without IP denylist)
2. **Credit race condition** (non-atomic deduction enables double-spend)
3. **Stored XSS risk** (DataForSEO payloads stored unsanitized)
4. **API response mismatch** (code checks wrong type name → undercounting visibility)
5. **Platform coverage overclaim** (marketing says 6 platforms, API covers 2 confirmed)

**Technical Debt Score: 8/10** (high risk, architecture drift)

---

## Table of Contents

1. [Feature Architecture](#1-feature-architecture)
2. [API Analysis — DataForSEO](#2-api-analysis--dataforseo)
3. [Security Audit (OWASP)](#3-security-audit-owasp)
4. [Database & Schema Analysis](#4-database--schema-analysis)
5. [Code Quality & Wiring](#5-code-quality--wiring)
6. [Performance Analysis](#6-performance-analysis)
7. [Business & Product Risks](#7-business--product-risks)
8. [Threat Model — Top 3 Attacks](#8-threat-model--top-3-attacks)
9. [Prioritized Risk Matrix](#9-prioritized-risk-matrix)
10. [Phased Remediation Plan](#10-phased-remediation-plan)

---

## 1. Feature Architecture

### File Map (44 files total)
```
src/features/ai-visibility/
├── types/index.ts                          (520 lines) — Full type system
├── services/
│   ├── dataforseo-visibility.service.ts    (790 lines) — Core scan engine
│   ├── audit.service.ts                    (606 lines) — Tech audit (robots.txt, llms.txt, schema)
│   ├── tracker.service.ts                  (425 lines) — Google AIO + ranking tracking
│   └── index.ts                            — Barrel exports
├── actions/
│   ├── run-scan.ts                         (378 lines) — Full scan orchestrator
│   ├── run-audit.ts                        — Tech audit action
│   ├── run-tracker.ts                      — Tracker action
│   ├── save-config.ts                      — Config CRUD
│   ├── save-keyword.ts                     — Keyword CRUD
│   ├── run-citation.ts                     — Citation checks
│   ├── get-dashboard-data.ts               (~200 lines) — Dashboard aggregation
│   └── index.ts                            — Barrel exports
├── components/                             — Dashboard, PlatformBreakdown, etc.
├── sql/                                    — RLS policies
└── _INTEGRATION_GUIDE.ts                   (215 lines) — Architecture documentation
```

### Data Flow
```
User → page.tsx (client) → Server Action (authAction + Zod)
  → CreditBanker.deduct()
  → runVisibilityScan() → 3 parallel DataForSEO API calls
    ├── fetchLLMMentions()     → $0.10/req
    ├── fetchGoogleAIMode()    → $0.004/req
    └── fetchGoogleOrganic()   → $0.004/req
  → Transform & detect brand mentions
  → Save: scans + citations + snapshot (Supabase)
  → Return FullScanResult to client
```

### Key Dependencies
- **DataForSEO**: Sole external paid API (~$0.11/scan)
- **Supabase**: Auth + DB + RLS (5 tables, NOT in Prisma)
- **CreditBanker**: Atomic credit deduct/refund via Supabase RPC
- **robots-parser**: RFC 9309 robots.txt parsing
- **cheerio**: Schema.org JSON-LD extraction

---

## 2. API Analysis — DataForSEO

### What We Use (1 of 5 LLM Mentions endpoints)

| Endpoint | Cost | Used? | Status |
|----------|------|-------|--------|
| Search Mentions (live) | $0.10/req + $0.001/row | ✅ Yes | Only one we use |
| Aggregated Metrics | $0.10/req | ❌ No | Enables trendlines, KPIs |
| Cross Aggregated Metrics | $0.10/req | ❌ No | Side-by-side brand vs competitor |
| Top Domains | $0.10/req | ❌ No | "Where AI gets answers" intelligence |
| Top Pages | $0.10/req | ❌ No | Content strategy recommendations |

### API Parsing Issues Found

**CRITICAL — AI Mode Response Type Mismatch:**
- Our code checks `item.type === "ai_mode_response"` 
- DataForSEO API actually returns `item.type === "ai_overview"` with sub-items
- We also miss the `references[]` array (source, domain, url, title, text) and `markdown` field
- **Impact:** Likely undercounting AI Mode visibility for every scan

**MEDIUM — LLM Mentions Response Structure:**
- We map `item.source` to platform but the API now returns richer data
- Missing: monthly_searches, aggregated scores, domain-level data
- Our `LLMMentionItem` interface doesn't match current API response shape

**LOW — Google Organic handles all SERP types correctly:**
- ai_overview, featured_snippet, knowledge_graph, organic — all handled
- Good use of priority ordering (AI overview first, then featured, then organic)

### $100/month Commitment Risk
- DataForSEO LLM Mentions requires **$100/month minimum subscription** (not a fee — stays as balance)
- We don't check subscription status before scans
- We don't surface this cost in pricing/plan decisions
- **Business impact:** COGS floor risk for low-volume plans

### Platform Coverage Reality

| Platform | Data Source | Confidence |
|----------|-----------|------------|
| Google AIO | DataForSEO Organic SERP | ✅ High |
| Google AI Mode | DataForSEO AI Mode SERP | ⚠️ Medium (parsing issues) |
| ChatGPT | DataForSEO LLM Mentions | ✅ High (GPT-5 confirmed) |
| Perplexity | DataForSEO LLM Mentions | ❓ Uncertain |
| Claude | DataForSEO LLM Mentions | ❓ Uncertain |
| Gemini | DataForSEO LLM Mentions | ❓ Uncertain |

**Issue:** Marketing claims "6 platforms" but only Google AIO + ChatGPT are confirmed data sources. Claude/Gemini/Perplexity coverage is unverified.

---

## 3. Security Audit (OWASP)

### CRITICAL Findings

#### C1. SSRF in Audit Service
- **File:** `audit.service.ts` — `AuditService(domain)` constructor
- **Issue:** User-supplied domain used directly in `fetch()` calls to robots.txt, llms.txt, homepage
- **Attack:** User passes `169.254.169.254`, `localhost`, `10.0.0.1` → server fetches internal resources
- **Impact:** Cloud metadata theft, internal network scanning, credential exposure
- **Fix:** DNS resolution + IP range denylist (RFC1918, link-local, metadata IPs) + egress proxy

#### C2. Credit Race Condition / Double-Spend
- **File:** `run-scan.ts` — `runFullScan` action
- **Issue:** Cooldown check → credit deduction → scan execution are NOT atomic. Concurrent requests bypass cooldown.
- **Idempotency key uses `Date.now()`** making every call unique (provides zero idempotency)
- **Impact:** Users can drain credits rapidly; operator faces unexpected DataForSEO bills
- **Fix:** PostgreSQL stored procedure with `SELECT FOR UPDATE` + advisory lock + deterministic idempotency key

#### C3. Stored XSS via DataForSEO Payloads
- **Files:** `run-scan.ts`, `dataforseo-visibility.service.ts`
- **Issue:** Snippets, contexts, URLs from DataForSEO responses stored directly to DB without sanitization
- **Attack:** If DataForSEO returns `<script>` in snippet or malicious URL, it renders in client
- **Impact:** Session hijack, privilege escalation via persistent XSS
- **Fix:** DOMPurify server-side before persistence + retroactive cleanup migration

### HIGH Findings

#### H1. Cooldown Bypass (Race)
- Two concurrent requests can both read "no recent scan" → both proceed
- **Fix:** DB-level uniqueness constraint or advisory lock in stored procedure

#### H2. Client-Side Data Exposure
- **File:** `page.tsx` — 745-line `"use client"` component
- Creates `createBrowserClient()` directly, does auth checks client-side
- All data fetching happens in `useEffect` hooks
- **Fix:** Move to server components for data loading; client only for interactivity

#### H3. Unsanitized URLs Stored
- `citedUrl`, `cited_title` fields from external API stored without validation
- Malicious URLs could enable phishing via UI rendering
- **Fix:** URL validation + sanitization before persistence

### MEDIUM Findings

| ID | Issue | File | Fix |
|----|-------|------|-----|
| M1 | Missing RLS UPDATE policy | SQL migration | Add UPDATE policy for ai_visibility_scans |
| M2 | Unsafe `as Type` casts on external data | Multiple services | Add Zod runtime validation |
| M3 | Weak domain normalization | run-scan.ts | Use `new URL()` + strict hostname extraction |
| M4 | UNIQUE(config_id, date) with NULL config_id | snapshots table | COALESCE or partial index |
| M5 | Incomplete DataForSEO error handling | All fetch functions | Check per-task status_code |
| M6 | `Promise.allSettled` hides API outages | visibility service | Log/surface partial failures |

---

## 4. Database & Schema Analysis

### Tables (Supabase-only, NOT in Prisma)

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Issues |
|-------|-----|--------|--------|--------|--------|--------|
| ai_visibility_configs | ✅ | ✅ | ✅ | ✅ | ✅ | None |
| ai_visibility_scans | ✅ | ✅ | ✅ | ❌ MISSING | ✅ | Upsert may fail |
| ai_visibility_citations | ✅ | ✅ | ✅ | ? | ✅ | OK |
| ai_visibility_keywords | ✅ | ✅ | ✅ | ? | ✅ | OK |
| ai_visibility_snapshots | ✅ | ✅ | ✅ | ? | ✅ | NULL unique issue |

### Schema Issues

1. **Prisma/Supabase Split**: Rest of the app uses Prisma. These 5 tables exist only as raw SQL migrations. Creates dual migration path and no TypeScript type generation from Prisma.

2. **UNIQUE(config_id, date) NULL problem**: PostgreSQL treats `NULL != NULL`, so multiple rows with `config_id = NULL` and same date can exist. Violates intended uniqueness.

3. **scan_result JSONB**: Full scan result stored as JSONB blob. No queryable columns for individual platform results. Dashboard queries must parse JSONB.

4. **No indexes on query patterns**: Dashboard queries filter by `config_id + created_at` but only `config_id` and `created_at` are individually indexed, not as compound.

### Architecture Decision (o3-pro verdict):
> Keep Supabase Postgres as database of record. Use `prisma db pull` to generate Prisma schema from existing tables. Maintain SQL migration files. Never let Prisma alter structure directly.

---

## 5. Code Quality & Wiring

### Wiring Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Inconsistent HTTP client | MEDIUM | `tracker.service.ts` uses raw `fetch()` with manual Basic auth; `dataforseo-visibility.service.ts` uses shared `getDataForSEOClient()` Axios singleton |
| Delete old services | INFO | scan.service, citation.service, defense.service deleted (OpenRouter-dependent). Clean removal. |
| Barrel exports correct | ✅ | `actions/index.ts` exports all needed functions |
| No circular dependencies | ✅ | Clean import graph |

### Code Quality Concerns

1. **Page component too large**: 745 lines, 20+ useState, 5 useEffect — violates SRP
2. **Brand detection flawed**: Substring matching (`includes()`) creates false positives. "blog" matches "blogspy"
3. **DRY violations**: Domain normalization repeated in 3 places (service, action, page)
4. **Sentiment heuristic duplicated**: Both service and citation generator call `detectSentiment()` with same word lists
5. **checkSinglePlatform waste**: Calls full LLM Mentions API ($0.10) to check one platform, discards rest

### Type Safety

- Multiple `as LLMMentionsResult` / `as SERPResult` casts without runtime guards
- External API shapes assumed stable — no Zod validation on responses
- `RunScanInput` interface duplicates Zod schema — potential drift

---

## 6. Performance Analysis

### API Cost Per Scan
| Call | Cost | Notes |
|------|------|-------|
| LLM Mentions | $0.10 + $0.001/row | Most expensive |
| Google AI Mode | $0.004 | Cheap |
| Google Organic | $0.004 | Cheap |
| **Total** | **~$0.11** | Per keyword scan |

### Performance Issues

1. **checkSinglePlatform**: Calls full LLM API ($0.10) for one platform check — 75% waste for non-LLM platforms
2. **No caching**: Same keyword scanned twice = two full API calls. No memoization or TTL cache.
3. **Sequential page data loading**: Dashboard loads configs → then keywords → then scan history → then dashboard data. No parallel loading.
4. **Full client render**: 745-line component hydrates on client. No SSR = slow TTFB.
5. **No pagination on citations/history**: Could grow unbounded in queries.

---

## 7. Business & Product Risks

### Revenue/Pricing

| Risk | Severity | Details |
|------|----------|---------|
| COGS floor | HIGH | $100/month DataForSEO commitment regardless of usage |
| Credit underpricing | MEDIUM | 5 credits = $0.11 cost. If 1 credit = $0.01 revenue, we lose money |
| No usage caps | MEDIUM | No per-user daily scan limits beyond cooldown |

### Product Claims vs Reality

| Claim | Reality | Risk |
|-------|---------|------|
| "Track 6 AI platforms" | Only 2 confirmed (Google AIO, ChatGPT) | Reputation/legal |
| "Real-time visibility" | Single-point-in-time scan, no continuous monitoring | Misleading |
| "Competitor analysis" | Collected but unused | Feature gap |

### Missing Features (vs competitors)

1. No historical trend visualization (need Aggregated Metrics endpoint)
2. No "where to get cited" recommendations (need Top Domains/Pages)
3. No automated scheduled scans
4. No email/webhook alerts on visibility changes
5. No multi-language/multi-region support (hardcoded US/en)

---

## 8. Threat Model — Top 3 Attacks

### Attack 1: SSRF → Internal Network Pivot
```
Attacker → Tech Audit → domain=169.254.169.254 → Server fetches AWS metadata
→ Attacker gets IAM credentials → Full cloud compromise
```
**Likelihood:** HIGH (no protection exists)
**Impact:** CRITICAL (full infrastructure compromise)

### Attack 2: Stored XSS → Session Hijack
```
DataForSEO returns malicious snippet → Stored in ai_visibility_citations
→ User views dashboard → Script executes → Session token stolen
→ Account takeover
```
**Likelihood:** MEDIUM (depends on DataForSEO data integrity)
**Impact:** HIGH (persistent, affects all users who view tainted data)

### Attack 3: Credit Race → Denial of Wallet
```
Attacker sends 50 concurrent scan requests → All pass cooldown check
→ 250 credits deducted → 50 DataForSEO API calls = $5.50 cost
→ Repeat at scale → COGS explosion
```
**Likelihood:** HIGH (no protection exists)
**Impact:** HIGH (financial loss, service degradation)

---

## 9. Prioritized Risk Matrix

### BLOCKERS (must fix before next deploy)
| ID | Issue | Brain | Fix Estimate |
|----|-------|-------|--------------|
| B1 | SSRF in AuditService | Codex | 4-6 hours |
| B2 | Stored XSS from DataForSEO | Codex | 3-4 hours |
| B3 | Credit race condition | Codex + o3-pro | 6-8 hours |
| B4 | Client-side data exposure | o3-pro | 8-12 hours |
| B5 | AI Mode response type mismatch | gpt-5.2 | 2-3 hours |

### HIGH (< 2 weeks)
| ID | Issue | Brain | Fix Estimate |
|----|-------|-------|--------------|
| H1 | Prisma/Supabase schema consolidation | o3-pro | 4-6 hours |
| H2 | $100/month COGS floor surfacing | gpt-5.2 | 2-3 hours |
| H3 | Platform coverage marketing correction | gpt-5.2 | 1-2 hours |
| H4 | DataForSEO error handling expansion | Codex | 3-4 hours |
| H5 | Historical row sanitization migration | Codex | 2-3 hours |

### MEDIUM (< 1 quarter)
| ID | Issue | Brain | Fix Estimate |
|----|-------|-------|--------------|
| M1 | Aggregated Metrics + Top Domains adoption | gpt-5.2 | 2-3 days |
| M2 | Provider sentiment adoption | gpt-5.2 | 4-6 hours |
| M3 | Domain validator hardening | Codex | 2-3 hours |
| M4 | UNIQUE(NULL) fix | Codex | 1-2 hours |
| M5 | RLS UPDATE policy | Codex | 1 hour |
| M6 | Page component decomposition | o3-pro | 1-2 days |

---

## 10. Phased Remediation Plan

### Phase 0 — 48 hours — Deployment Blockers
1. **SSRF protection**: DNS resolution + IP denylist in audit service
2. **Credit atomicity**: PostgreSQL stored procedure with SELECT FOR UPDATE + deterministic idempotency key
3. **XSS sanitization**: DOMPurify on DataForSEO payloads before DB insert
4. **Server component migration**: Move auth/data loading to server components
5. **Fix AI Mode parser**: Handle `ai_overview` type + extract `references[]`

### Phase 1 — 2 weeks — High Severity
1. Prisma schema consolidation (db pull + unified migrations)
2. Pricing/ToS update for DataForSEO COGS floor
3. Marketing copy correction on platform coverage
4. Per-task error handling + retry logic for DataForSEO
5. Retroactive sanitization migration for existing rows
6. Cooldown logic moved to stored procedure

### Phase 2 — 4 weeks — Product Expansion
1. Implement Aggregated Metrics + Top Domains endpoints
2. Switch sentiment to DataForSEO provider field
3. Harden domain validation (public-suffix, punycode)
4. Fix UNIQUE(NULL) with COALESCE or partial index
5. Add RLS UPDATE policy
6. Competitor benchmarking with Cross Aggregated Metrics

### Phase 3 — 1 quarter — Tech Debt Paydown
1. Full page decomposition into server + client modules
2. Zod validation on ALL external API responses
3. Server-side caching layer for expensive endpoints
4. Automated scan scheduling
5. External penetration test
6. Multi-language/region support

---

## Appendix: Brain Status Dashboard

| Brain | Role | Status | Key Contribution |
|-------|------|--------|------------------|
| Claude (Host) | Primary executor, context gatherer | ✅ | Read 44 files, gathered external research, compiled report |
| gpt-5.2 | Research synthesis | ✅ | API gap analysis, endpoint discovery, pricing research, competitor feature gaps |
| gpt-5.2-codex | Code-level audit | ✅ | OWASP findings, SSRF/XSS/race conditions, type safety, wiring integrity |
| o3-pro | Architecture review | ✅ | Priority matrix, architecture decisions, phased remediation, threat model, tech debt score |

---

## Final Verdict

**Technical Debt Score: 8/10 → Must reduce to 4/10 before scaling**

The AI Visibility feature has strong product concepts (smart API selection, credit system, multi-platform tracking) but was shipped with critical security gaps. The SSRF vulnerability alone could lead to infrastructure compromise. The credit race condition exposes financial risk. The API parsing mismatch means our core value proposition (accurate visibility tracking) is unreliable.

**Fix the 5 blockers. Ship nothing until they're resolved.**

---

*Report generated by 4-Brain Post-Mortem Pipeline*
*Claude (Host) + gpt-5.2 (Research) + gpt-5.2-codex (Code Audit) + o3-pro (Architecture)*
