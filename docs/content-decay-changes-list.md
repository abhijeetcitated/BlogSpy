# Content Decay - Fix List (Accurate + Actionable) (Hindi)

Ye document repo ke actual code par based hai (not “imaginary limits”). Focus: **P0/P1 fixes** jo real UX/correctness/safety improve karte hain. File-splitting ko optional refactor (P2) rakha hai.

---

## ✅ Reality Check (Repo Facts)

### Line counts (verified)

- `src/features/content-decay/content-decay-content.tsx`: **550**
- `src/features/content-decay/components/export-dialog.tsx`: **331**
- `src/features/content-decay/components/revival-queue.tsx`: **236**
- `src/features/content-decay/components/watch-list.tsx`: **231**
- `src/features/content-decay/components/decay-matrix.tsx`: **189**

### “500-line limit” claim

- Is repo me ESLint config me `max-lines` enforce nahi ho raha. File size guideline ho sakti hai, but **rule-based “violation”** currently nahi.

---

## 🔴 P0 (Must Fix) — Correctness / Safety / Misleading UX

### 1) localStorage access: crash risk

**Where**: `src/features/content-decay/content-decay-content.tsx`

**Problem**: `localStorage.getItem/setItem` kuch environments me throw kar sakta (privacy mode, blocked storage, server render mismatch, iframe restrictions). Code me early effect me direct call hai.

**Fix (exact)**:

- `localStorage` reads/writes ko `try/catch` + `typeof window !== "undefined"` guard.
- Failure case me silent fallback (default state) + optional dev log.

**Refs**:

- GSC prompt dismissed state reads/writes: `useEffect` + `handleDismissGSCPrompt`
- Persisted ignored/fixed/filter/sort state loads/saves

### 2) Toasts claim “calendar/roadmap” integration but only local state changes

**Where**: `src/features/content-decay/content-decay-content.tsx`

**Problem**:

- `handleSchedule` sirf `scheduledIds` Set update karta hai, but toast bolta “content calendar 📅”.
- `handleAutoScheduleAll` bhi sirf `scheduledIds` update karta hai, but toast bolta “added to roadmap ✅”.

**Fix (exact)** (choose one):

- Option A (recommended for now): message change karo to be truthful: “Marked as scheduled” / “Queued for scheduling”.
- Option B: actual integration implement karo (Content Calendar / Roadmap store/service me write) — scope heavy.

### 3) setTimeout cleanup missing (unmount -> state update risk)

**Where**: `src/features/content-decay/content-decay-content.tsx`

**Problem**:

- `showNotification` me `setTimeout` without cleanup.
- `handleMatrixDotClick` me highlight removal `setTimeout` without cleanup.

**Fix (exact)**:

- Timeout IDs ko `useRef<number | null>` me store karo.
- Cleanup in `useEffect(() => () => clearTimeout(...), [])`.

### 4) AI Writer route ambiguity (potential wrong destination)

**Where**: `src/features/content-decay/content-decay-content.tsx`

**Problem**:

- `router.push('/ai-writer?...')` used.
- Repo me **both** pages exist: `app/ai-writer/page.tsx` and `app/dashboard/creation/ai-writer/page.tsx`.

**Fix (exact)**:

- Product decision: should this open dashboard AI Writer or public AI Writer?
- Once decided, route constant use karo to avoid scattered hardcodes.

---

## 🟡 P1 (Should Fix) — Maintainability / Cleanup / Minor UX correctness

### 1) Dead exports: `findArticleById`

**Where**: `src/features/content-decay/utils/decay-utils.ts` (and re-exported)

**Problem**: `findArticleById` export dikh raha, but feature codebase me usage nahi mil rahi (dead code risk).

**Fix (exact)**:

- If unused: remove function + remove re-exports.
- If needed: replace repeated `articles.find(...)` with this helper and keep export.

### 2) Refs map growth

**Where**: `src/features/content-decay/content-decay-content.tsx`

**Problem**: `articleRefs.current.set(articleId, el)` only sets when `el` exists; unmount pe delete nahi karta.

**Fix (exact)**:

- `setArticleRef` me `el === null` case handle: `articleRefs.current.delete(articleId)`.

### 3) Consistent “persisted state” hygiene

**Where**: `src/features/content-decay/content-decay-content.tsx`

**Fix (exact)**:

- All localStorage JSON parses in `try/catch` with fallback.
- Avoid writing on every render; write only when Sets change (already useEffect based, but keep strict).

---

## 🟢 P2 (Optional) — Refactors (only if you want cleaner code)

These are not “critical” by themselves. Do only if you want structure upgrades.

### 1) Split large file(s)

- `src/features/content-decay/content-decay-content.tsx` ko split karna can help readability.
- BUT: splitting alone performance fix nahi hota.

Suggested minimal split (low-risk):

- Extract small helpers: `usePersistedDecayState` hook for localStorage logic
- Extract `useDecayActions` hook for handlers

### 2) Split list components into Card components

- `revival-queue.tsx` -> `RevivalQueue` + `RevivalCard`
- `watch-list.tsx` -> `WatchList` + `WatchCard`

### 3) Export dialog: separate pure export utils

- `export-dialog.tsx` me CSV/JSON generation ko `utils/export-utils.ts` me move (testable).

---

## ✅ Revised Verdict (grounded)

- Feature generally solid for a demo/mock-driven UI, but **P0 issues exist** (storage safety, timeout cleanup, misleading schedule messaging, route ambiguity).
- “Only 5 files need changes” is not a good framing; changes are **risk-based**, not line-count-based.