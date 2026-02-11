# � THE MISSION: Project Context Engine
> **PATH**: `docs/specs/00dashboard/01projectselector.md`
> **SCOPE**: The "Central Nervous System". Determines Active Context for all tools.
> **PHILOSOPHY**: "Project = Domain". No blank screens. Apple-Style Design.

---

## 1. 🎯 THE OBJECTIVE
To build the central nervous system of the app. The "Active Project" determines what data is shown across Rank Tracker, Decay Alerts, and Dashboard.
*   **Core Rule**: `1 Domain = 1 Project`.
*   **Quality Standard**: "Apple-Style" Design. Premium Dropdown, instant feedback, no page reloads.
*   **Constraint**: This module must be isolated. It should NOT break Auth or Billing.

---

## 2. 🗄️ DATABASE ARCHITECTURE (The Spine)
We need a robust schema that prevents duplicates and supports future GSC integration.

### Prisma Schema Update
```prisma
// Enums for strict typing
enum TargetCountry {
  US
  IN
  UK
  CA
  AU
  GLOBAL
}

model UserProject {
  id            String   @id @default(uuid())
  userid        String   // Links to Auth User
  
  // Core Identity
  projectname   String   @db.VarChar(50) // Limit name length
  domain        String   // Clean Root Domain (e.g. "shoes.com")
  
  // SEO Configuration
  targetcountry TargetCountry @default(US)
  icon          String?  // Favicon URL
  
  // Future Integration (Nullable for now)
  gscpropertyid String?  
  
  // Meta
  createdat     DateTime @default(now())
  updatedat     DateTime @updatedAt

  // 🛡️ Security Constraints
  @@unique([userid, domain]) // Prevent same user adding "shoes.com" twice
  @@index([userid])
  @@map("userprojects")
}
```

---

## 3. 🛡️ SECURITY & VALIDATION (The Guard)
Before any data touches the database, it must pass these checks.

### A. Zod Schema (Input Validation)
File: `create-project.ts`
```typescript
const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  domain: z.string()
    .min(3, "Domain invalid")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Invalid Domain Format (e.g., use google.com)"),
  country: z.nativeEnum(TargetCountry)
});
```

### B. Business Logic Constraints (Strict Mode)
*   **Plan Limit Check**:
    *   Before creating, count `userprojects` for `userid`.
    *   `IF count >= 1 AND billing_tier == 'FREE'` -> Throw Error: "Upgrade to Pro to add more sites."
*   **Deduplication**:
    *   Prisma `@@unique([userid, domain])` will automatically block duplicate domains. Handle this error gracefully in UI.

---

## 4. 🧠 GLOBAL STATE & HYDRATION (The Memory)
**File**: `src/store/user-store.ts` (Zustand)
Next.js Server Components and Client State need to sync perfectly.

### Rules:
1.  **Persistence**: Save `activeProjectId` in `localStorage`.
2.  **Hydration Fix**: Use persist middleware properly to avoid "Text content does not match" errors.
3.  **Auto-Select Logic**:
    *   **On App Load**: Read `localStorage`.
    *   If `activeProjectId` exists in the loaded list -> Set it as Active.
    *   If NOT exists (or user deleted it) -> Set `projects[0]` as Active.
    *   If `projects.length === 0` -> Set `null` (Trigger Empty State).

---

## 5. ⚙️ BACKEND EXECUTION FLOW (The Worker)
**File**: `src/features/dashboard/actions/create-project.ts`

### Step-by-Step Algorithm:
1.  **Authenticate**: Get `userId`. If null, throw "Unauthorized".
2.  **Validate Inputs**: Run Zod Schema. If fail, return field errors.
3.  **Smart Domain Cleaning**:
    *   Input: `https://www.google.com/search` OR `www.google.com`
    *   Logic: Strip `https://`, `http://`, `www.`, and trailing paths.
    *   Output: `google.com`
4.  **Favicon Fetching** (Reliable Method):
    *   URL: `https://www.google.com/s2/favicons?domain=${cleanedDomain}&sz=64`
    *   No need to "download" image. Store URL string.
5.  **DB Transaction**: Insert into `userprojects`.
6.  **Revalidate**: Call `revalidatePath('/dashboard')` to refresh server data.
7.  **Return**: Success Status + The New Project Object.

---

## 6. 🎨 UI/UX BEHAVIOR (The Experience)

### A. The Sidebar Dropdown (`ProjectSwitcher.tsx`)
*   **Visuals**: Active Project shows: `[Icon] [Project Name] [ChevronDown]`.
*   **Fallback Icon**: If icon fails, show rounded square with first letter.
*   **Dropdown Menu**:
    *   Header: "My Projects".
    *   List: Scrollable list.
    *   Footer: Separator + `[+ Add Project]` button (Highlighted).

### B. The Modal (`AddProjectDialog.tsx`)
*   **Behavior**: Close automatically on success.
*   **State**: Show "Spinner/Loading" on Save button.
*   **Toast Notification**:
    *   Success: "✅ Project 'My Blog' created!"
    *   Error: "❌ Domain already exists" or "❌ Upgrade Plan".

### C. The "Empty State" (First Time User)
*   If `projects.length === 0`:
    *   Dropdown reads: "➕ Create Project".
    *   Clicking opens Modal immediately.
    *   Dashboard shows "Setup Mode".

---

## 7. 🧪 QUALITY ASSURANCE (QA Checklist)
Before marking "Done", code must pass:
*   [ ] **The "www" Test**: Adding `www.abc.com` and `abc.com` should be same.
*   [ ] **The "Free Plan" Test**: User on Free plan cannot add 2nd project.
*   [ ] **The "Refresh" Test**: Select "Project B" -> Refresh -> "Project B" stays active.
*   [ ] **The "Logout" Test**: Clear `activeProjectId` on logout.

---

# 🛡️ SKILL 8: BATTLE-HARDENED SAAS PATTERNS (USER INJECTED)

## 1. Race Conditions (The "Race Condition" Attack)
- **Scenario**: User clicks "Create Project" 10 times in 1 second.
- **Fix**: 
  - **Frontend**: Disable button on click + Strict Debounce (300ms).
  - **Backend**: Use `Idempotency-Key` header & `@@unique` DB constraint.
  - **State**: Set `isSubmitting = true` immediately.

## 2. Tab Synchronization (The "Ghost Project" Problem)
- **Scenario**: User deletes Project A in Tab 1. Tab 2 is still open on Project A.
- **Problem**: User clicks in Tab 2 -> App Crashes (404).
- **Fix**: Use **Broadcast Channel API**.
  - When Tab 1 deletes: `channel.postMessage({ type: 'PROJECT_DELETED', id: '...' })`.
  - Tab 2 listens: `channel.onmessage` -> Redirects to Dashboard immediately.

## 3. Smart Domain Parsing & Hardening (The "Punycode" Nightmare)
- **Scenario A (Subdomain)**: Input `https://www.store.co.uk/blog` -> Output `store.co.uk` (Use `psl` library).
- **Scenario B (Punycode)**: Input `café.com` -> Store `xn--caf-dma.com`.
- **Reason**: SEO tools fail with raw UTF-8. Backend must normalize.

## 4. Optimistic UI & Hydration (Visual Speed)
- **Hydration Flash Fix**: Show **Skeleton Loaders** (Gray Boxes) specifically matching UI layout to prevent "flicker".
- **Optimistic Updates**: Server ke jawab ka wait mat karo.
  - Action: Rename Project.
  - UI: Update text *immediately*.
  - Background: Send API. If fail, revert & toast error.

## 5. Security: Tenant Leak Protection
- **Scenario**: Hacker sends API req with valid Token but different `project_id`.
- **Fix**: **Strict RLS**. NEVER trust Frontend ID. Always check `user_id == auth.uid()`.

## 6. Error Codes Strategy
- **Don't just say "Error"**.
- Send specific codes: `LIMIT_REACHED`, `DUPLICATE_DOMAIN`, `INVALID_PUNYCODE`.
- **Frontend Action**: If `LIMIT_REACHED` -> Auto-open Pricing Modal.
