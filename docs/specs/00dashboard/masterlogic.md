# SURGICAL SPEC: Dashboard & Project Context Engine (God Mode)

> **SCOPE**: The "Central Nervous System". Determines Active Context for all tools.
> **PHILOSOPHY**: "Project = Domain". No blank screens. Apple-Style Design.

---

## 1. 🎯 THE OBJECTIVE
To build the central command center of the SaaS where the **Active Project** determines what data is shown across Rank Tracker, Decay Alerts, and Dashboard.

**Core Rules:**
1.  **One Domain = One Project:** `shoes.com` is a project. Subdomains or pages are not separate projects.
2.  **Smart Empty States:** Never show a blank dashboard. If no project exists, cards become "Call to Action" buttons.
3.  **Strict Limits:** Free Plan users can strictly create only **1 Project**.
4.  **Isolation:** This module must NOT break Auth, Billing, or existing layouts.

---

## 2. 🗄️ DATABASE ARCHITECTURE (The Spine)

### A. Prisma Schema Update
**Table:** `userprojects` (Map to `userprojects`)

| Column | Type | Logic/Reason |
| :--- | :--- | :--- |
| `id` | UUID | **PK**. The Master Key for all Foreign Keys. |
| `userid` | UUID | **FK**. Links to `coreprofiles`. OnDelete: Cascade. |
| `projectname` | String | Friendly Name (e.g., "My Shoe Store"). Max 50 chars. |
| `domain` | String | **Critical.** Clean root domain (e.g., `shoes.com`). Unique Constraint per user. |
| `target_country`| Enum | `US`, `IN`, `UK`, `CA`, `AU`, `GLOBAL`. (Needed for Rank Tracker). |
| `icon` | String? | Favicon URL (Auto-fetched). |
| `gsc_property_id`| String? | (Nullable) Stores Google Search Console ID for future integration. |
| `createdat` | DateTime | Audit trail. |

**Constraints:**
- `@@unique([userid, domain])`: Prevents a user from adding the same site twice.
- `@@index([userid])`: For fast fetching.

---

## 3. 🧠 GLOBAL STATE & SYNC (The Brain)

**File:** `src/store/user-store.ts` (Zustand)

### A. State Variables
- `activeProject`: The currently selected project object.
- `projects`: Array of all user projects.
- `isLoading`: Boolean state for UI spinners.

### B. Synchronization Rules (Battle-Hardened)
1.  **Persistence:** Save `activeProjectId` in `localStorage`. On load, hydrate the store.
2.  **Tab Synchronization:** Use **Broadcast Channel API**.
    - *Scenario:* User deletes "Project A" in Tab 1.
    - *Action:* Tab 2 receives message -> Auto-switches to "Project B" or Empty State.
    - *Prevention:* Prevents app crash when clicking in a stale tab.
3.  **Auto-Select Logic:**
    - If `projects.length > 0` AND `activeProject == null` -> Select `projects[0]`.

---

## 4. ⚙️ BACKEND LOGIC (The Worker)

**File:** `src/features/dashboard/actions/create-project.ts`

### A. Input Validation (Zod)
- **Name:** Min 1, Max 50 chars.
- **Domain:** Regex check. Must be a valid hostname.
- **Country:** Must be a valid Enum value.

### B. Business Logic (Strict Mode)
1.  **Auth Check:** Ensure `userId` exists.
2.  **Plan Limit Enforcer:**
    - Fetch `billingtier` from `coreprofiles`.
    - Count existing projects.
    - **Rule:** `IF (tier == 'FREE' && count >= 1) THEN Throw Error("LIMIT_REACHED")`.
3.  **Smart Sanitization:**
    - Input: `https://www.MySite.com/blog/article`
    - Logic: Strip protocol, `www`, and paths.
    - Output: `mysite.com`.
4.  **Favicon Fetching:**
    - Source: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`.
    - Store the URL string directly.
5.  **Race Condition Protection:**
    - Use `Idempotency` logic (via unique DB constraint) to prevent double-clicks creating duplicate rows.

---

## 5. 🎨 UI COMPONENTS (The Interface)

### A. Sidebar Project Switcher (`ProjectSwitcher.tsx`)
**Design:** Premium Shadcn Dropdown.
- **Visuals:** `[Favicon] [Project Name] [Chevron]`.
- **Empty State:** If 0 projects, show "➕ Create Project" text.
- **Dropdown Items:**
  - List of Projects.
  - **Separator.**
  - **"+ Add New Project"** (Opens Modal).

### B. Add Project Modal (`AddProjectDialog.tsx`)
**Inputs:** Name, Domain, Country.
**UX Rules:**
- **Loading State:** Disable "Save" button & show spinner while creating.
- **Optimistic UI:** Don't wait for server. Close modal & show success toast immediately if validation passes.
- **Error Handling:** If server throws `LIMIT_REACHED`, open the "Upgrade Plan" modal.

---

## 6. 📊 DASHBOARD SMART LAYOUT (The Display)

The Dashboard adapts based on `activeProject`. It has two modes: **Active** and **Empty**.

### 🟢 Section 1: The "Pulse" Cards (Top Row)

| Card | Data Source | Logic (Active Project) | Empty State (No Project) |
| :--- | :--- | :--- | :--- |
| **Trend Spotter** | `trend_watchlist` | Shows saved trends with highest movement. | **Global Mode:** Shows "Global Hot Trends" (e.g. ChatGPT). *Never Empty.* |
| **Opportunities** | `contentperformance` | Shows count of Decaying Articles. | **CTA Mode:** Text: "Find Traffic Drops". Button: `[Connect Site]`. |
| **Credit Health** | `billing` | Shows Credits Used/Total. | **Global Mode:** Always visible. User specific, not project specific. |
| **Rank Tracker** | `rankhistory` | Shows "Keywords in Top 10". | **CTA Mode:** Text: "Track Rankings". Button: `[+ Add Website]`. |

### 🟢 Section 2: Quick Actions (Middle Left)
- **Logic:** Direct Links to Feature Pages.
- **Constraint:** If No Project exists, clicking "Check Rank" or "Gap Analysis" MUST open the **Add Project Modal** instead of navigating to a blank page.

### 🟢 Section 3: AI Suggestions (Bottom Feed)
- **Query:** `SELECT * FROM suggestions WHERE project_id = activeProject.id`.
- **Empty State:** If No Project, show "Onboarding Checklist":
  1.  Create First Project.
  2.  Add Keywords to Track.
  3.  Connect Google Search Console.

---

## 7. 🛡️ SECURITY & SAFETY (The Shield)

1.  **Row Level Security (RLS):**
    - Users can ONLY access projects where `userprojects.userid == auth.uid()`.
    - Prevents Tenant Leak (Hacker trying to access other users' data).
2.  **Cascade Delete:**
    - If a Project is deleted, ALL associated Keywords, Ranks, and Decay Data must be auto-deleted by the Database.
3.  **Punycode Handling:**
    - Backend must handle international domains (e.g., `café.com` -> `xn--caf-dma.com`) to avoid API breakages.