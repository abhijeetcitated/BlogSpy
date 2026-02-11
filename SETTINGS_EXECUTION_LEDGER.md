# 📒 SETTINGS MODULE: EXECUTION LEDGER (THE KHATA)
> **PURPOSE**: Zero-Ambiguity Coding Specifications for AI Agent
> **STATUS**: READY FOR EXECUTION
> **SCOPE**: General Tab & Security

---

## 1. 🟢 UI COMPONENT SPECIFICATIONS
**Goal**: Make the UI "Smart" about Auth Providers (Google vs Email).

### A. File: `src/features/settings/components/GeneralTab.tsx`
**Current Issue**: Allows interaction with Email/Password fields even if Google Auth is used.
**Changes Required**:

#### 1. Logic Injection (Inside Component)
```typescript
// [INSERT at start of GeneralTab]
const isGoogleAuth = profile?.auth_provider === 'google' || user?.app_metadata?.provider === 'google';
const isEmailAuth = !isGoogleAuth;
```

#### 2. Email Field Logic (Render Section)
- **Target**: `<Input ... name="email" ... />`
- **Change**: Add `disabled={true}` and `readOnly={true}`.
- **Visual**: Add a "Lock" icon or Badge if `isGoogleAuth`.
- **Code Snippet**:
  ```tsx
  <div className="relative">
    <Input value={email} disabled={isGoogleAuth} className={isGoogleAuth ? "bg-muted text-muted-foreground" : ""} />
    {isGoogleAuth && (
      <Badge variant="outline" className="absolute right-2 top-2 gap-1">
        <GoogleIcon className="w-3 h-3" /> Managed by Google
      </Badge>
    )}
  </div>
  ```

#### 3. Change Password Section (AccountSecurityCard)
- **Target**: Parsing `canChangePassword` prop.
- **Logic**: Pass `canChangePassword={isEmailAuth}` to `AccountSecurityCard`.

---

## 2. 🔌 SERVER ACTION SPECIFICATIONS
**Goal**: Ensure backend rejects valid-looking requests if security rules are violated.

### A. File: `src/features/settings/actions/profile-actions.ts`
**Function**: `initiateEmailChange`
**Logic Hardening**:

```typescript
// [VALIDATION STEP]
export const initiateEmailChange = authenticatedAction
  .schema(...)
  .action(async ({ ctx }) => {
    // 1. Fetch User
    const user = await getUser(ctx.userId);
    
    // 2. [NEW] Security Guard
    const provider = user.app_metadata.provider;
    if (provider === 'google') {
       throw new Error("ACTION_FORBIDDEN: Google accounts cannot change email.");
    }

    // ... proceed
  });
```

---

## 3. 🗄️ DATABASE SCHEMA & CASCADES (Manual SQL)
**Goal**: Fix the "Zombie Data" risk when deleting accounts.
**Execution**: Run this in Supabase SQL Editor.

```sql
-- 1. BILLING SAFEGUARD
-- Drops existing constraint if any, re-adds with CASCADE
ALTER TABLE public.billing_subscriptions
DROP CONSTRAINT IF EXISTS fk_user_billing,
ADD CONSTRAINT fk_user_billing 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. CREDITS SAFEGUARD
ALTER TABLE public.user_credits
DROP CONSTRAINT IF EXISTS fk_user_credits,
ADD CONSTRAINT fk_user_credits 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. LOGS SAFEGUARD
ALTER TABLE public.activity_logs
DROP CONSTRAINT IF EXISTS fk_user_logs,
ADD CONSTRAINT fk_user_logs 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

## 4. 🧠 WIRING DIAGRAM (The Brain Connection)

### Feature: **Update Timezone**
1.  **User Action**: Selects "Asia/Kolkata" in `GeneralTab`.
2.  **Frontend Logic**:
    - `onChange` -> `form.setValue('timezone', val)`.
    - Auto-save debouncer calls `updatePreferences(val)`.
3.  **Server Action** (`update-preferences.ts`):
    - **Input**: `{ timezone: "Asia/Kolkata" }`.
    - **Validation**: Check if string is valid IANA timezone (using `Intl` check).
    - **DB Write**: `UPDATE core_profiles SET timezone = $1 WHERE id = $2`.
4.  **Side Effect**: None immediate.
5.  **Future Impact**: Cron jobs for "Daily Reports" will read this column to calculate local 9:00 AM.

---

## 5. ⚠️ EXCEPTION HANDLING LEDGER
**What if...**

| Scenario | System Reaction | Code Logic |
| :--- | :--- | :--- |
| **User deletes Google Account?** | `deleteAccount` calls `admin.deleteUser`. | Does NOT revoke Google Access Token (Supabase limitation). User must revoke in Google Security Dashboard. |
| **User changes Google Name?** | We do NOT auto-sync after signup. | `updateProfileName` allows them to set a custom "Display Name" different from Google. |

---

**READY FOR ACTION:**
Command "EXECUTE STEP 1" will apply **Section 1 (UI)** code changes immediately.
