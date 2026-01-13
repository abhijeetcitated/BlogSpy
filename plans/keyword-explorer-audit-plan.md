# Keyword Explorer Audit Plan (Demo + Dashboard)

> Goal: Identify and fix end-to-end UX/functionality breakpoints (including “Refresh button does nothing”), then harden security/credits flow without introducing hydration errors or server-only leaks.

## 0) Scope

**In scope**
- Keyword Explorer Demo route: `/keyword-magic`
- Keyword Explorer Dashboard route: `/dashboard/research/keyword-magic` (and any linked variants)
- Results table (`KeywordTable`) and drawer (`KeywordDrawer`) + tabs (Overview, Social, Commerce)
- Server Actions used by Keyword Explorer
- Credits display + deduction semantics for keyword refresh + drawer insights

**Out of scope (for this audit)**
- Global product pricing/billing flows
- Non-keyword features (rank tracker, topic clusters) except where Keyword Explorer exports into them

## 1) Current observed issues (from runtime probing)

### 1.1 Demo page doesn’t surface a working results+refresh flow
- `/keyword-magic` loads in **Demo Mode** and shows the search input and an **Explore** button.
- The results area shows the empty state “Ready to explore keywords”.
- If a user expects “Refresh” to do something here, they likely expect:
  1) seed search loads mock/demo results into the table
  2) each row shows Refresh affordance
  3) clicking refresh triggers guest guard message (or mock refresh)

**Suspicion:** in demo mode, Explore can be disabled until input has value; in our automation we could not type due to snapshot-ref targeting (Playwright MCP limitation). But the actual user issue is “Refresh click does nothing” — which implies they are seeing a Refresh UI somewhere (probably after results load).

## 2) Entry points & routing map

### 2.1 Demo route
- [`app/keyword-magic/page.tsx`](app/keyword-magic/page.tsx:1)
  - renders [`KeywordResearchContent()`](src/features/keyword-research/keyword-research-content.tsx:74) inside `DemoWrapper`

### 2.2 Results table
- [`KeywordResearchResults()`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:24)
  - renders [`<KeywordTable />`](src/features/keyword-research/components/table/KeywordTable.tsx:70)

### 2.3 Refresh implementation (table)
- Row refresh button implementation:
  - [`RefreshColumn()`](src/features/keyword-research/components/table/columns/refresh/refresh-column.tsx:84)
  - calls [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:225)

- Bulk refresh (header) implementation:
  - [`RefreshCreditsHeader()`](src/features/keyword-research/components/table/columns/refresh/RefreshCreditsHeader.tsx:31)
  - also calls [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:225)

## 3) Audit checklist (what to verify)

### 3.1 UI flow correctness (demo)
- Seed input typing works.
- Explore triggers fetch and populates store keywords.
- Table renders rows.
- Refresh button is visible per row.
- Clicking Refresh in guest mode:
  - should show a sign-up toast (guard) OR mock refresh response.

### 3.2 Actions + service correctness
- Fetch keywords action:
  - [`fetchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:42) uses `publicAction` (demo).
- Refresh keyword action:
  - [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:225) uses `authAction`.

**Key mismatch to validate:** In demo/guest mode, Refresh currently calls an auth-only action. If the UI doesn’t guard it, this can look like “click does nothing” (silent auth failure).

### 3.3 Store selection vs table selection mismatch
- Table uses TanStack internal `rowSelection` state.
- Bulk refresh header reads store selection:
  - `selectedIds` from Zustand store (not TanStack).

**Risk:** bulk refresh count always 0 in the header because store selection never updates (table selection not wired to `useKeywordStore.selectedIds`).

### 3.4 Toast plumbing
- Many components call `toast` from `sonner`.
- Must verify the app actually mounts a `Toaster` somewhere globally.

**Suspicion:** No `Toaster` component is currently mounted (search didn’t find `Toaster` usage). If true, user perceives “nothing happens” even when click triggers toast.

### 3.5 Security/abuse basics (for later phases)
- `authAction` currently has **no rate limiting** (per decision log).
- Need to add rate limiting/Turnstile/quotas only after UI flow is correct.

## 4) Phased implementation roadmap

### P0 (Fix “nothing happens”)
1) Add global Sonner toaster in Root Layout (single source of UI feedback)
2) In demo mode, guard refresh actions to show sign-up toast (or disable with tooltip)
3) Wire TanStack row selection → Zustand `selectedIds` so bulk refresh header works

### P1 (Credits correctness)
1) Ensure refresh uses 1 credit atomically (RPC) for authenticated users
2) Align Social/Commerce drawer credit deduction behavior with UX labels

### P2 (Abuse hardening)
1) Add rate limit per IP + per user for keyword actions
2) Turnstile challenge for suspicious traffic
3) Strict quotas for demo mode (guest)

## 5) Success criteria
- Demo page: Explore loads demo results reliably; refresh interactions produce visible feedback (toast/tooltip).
- Authenticated dashboard: refresh works, updates row data, and credits decrement consistently.
- Bulk refresh: selecting rows changes header count and bulk refresh uses selected rows.
- No new hydration errors.
- Build passes.
