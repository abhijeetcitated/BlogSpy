# 🏛️ SETTINGS & AUTH: GOD LEVEL BLUEPRINT
> **STATUS**: PRODUCTION READY
> **ARCHITECT**: Antigravity
> **LAST AUDIT**: 2026-02-03

---

## 1. 🔌 SYSTEM WIRING DIAGRAM (The Nervous System)

```mermaid
graph TD
    User[User Interface] -->|Update Prefs| ServerAction1[update-preferences.ts]
    User -->|Change Password| ServerAction2[user-actions.ts]
    User -->|Delete Account| ServerAction3[delete-account.ts]

    subgraph "Server Actions Layer"
        ServerAction1
        ServerAction2
        ServerAction3
    end

    subgraph "Database Layer (Supabase)"
        AuthUsers[auth.users (Supabase Managed)]
        PublicUsers[public.users (core_profiles)]
        Billing[billing_subscriptions]
        Logs[activity_logs]
    end

    ServerAction1 -->|Update| PublicUsers
    ServerAction2 -->|Update| AuthUsers
    ServerAction3 -->|Delete| AuthUsers
    
    AuthUsers -->|Trigger/Cascade| PublicUsers
    PublicUsers -->|Cascade| Billing
    PublicUsers -->|Cascade| Logs
```

---

## 2. 🔐 AUTH PROVIDER MATRIX (The Rules)

Authentication method dictates available features. **Code must check `profile.auth_provider`**.

| Feature | Google OAuth (`provider='google'`) | Email/Pass (`provider='email'`) | Logic Handler |
| :--- | :--- | :--- | :--- |
| **Change Email** | ❌ **Disabled** (Managed by Google) | ✅ **Enabled** | `profile-actions.ts` |
| **Change Password** | ❌ **Hidden** ("Managed by Google") | ✅ **Enabled** | `user-actions.ts` |
| **Delete Account** | ✅ **Enabled** | ✅ **Enabled** | `delete-account.ts` |
| **2FA Setup** | ❌ (Future: Google Handles) | ✅ (Future: TOTP) | `security-actions.ts` |
| **Profile Photo** | ⚠️ Auto-synced from Google | ✅ Manual Upload | `Avatar` Component |

**⚠️ Critical Risk**: If a user signs up with Google `john@gmail.com` and then tries to "Link" a password, Supabase allows this (Multiple Identities).
**Architect Recommendation**: Treat `provider` as **Primary Identity**. If `identities` array contains 'google', treat as Google Account.

---

## 3. 💣 "DELETE ACCOUNT" PROTOCOL (Surgical Strike)

When `deleteAccountAction` is triggered:

1.  **Permission Check**:
    - `userId` must match `ctx.userId` (Session).
    - Re-verify session validity.
2.  **Execution Order**:
    - **Step 1**: Delete from `core_profiles` (App Data).
    - **Step 2**: Delete from `auth.users` (Supabase Auth).
    - **Step 3**: Sign Out.

**💥 Cascade Risks (Manual Verification Required):**
You MUST verify these Foreign Keys in Supabase SQL Editor to prevent "Orphaned Data":

```sql
-- USER DATA CASCADE CHECK
ALTER TABLE public.billing_subscriptions
DROP CONSTRAINT fk_user,
ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ACTIVITY LOGS
ALTER TABLE public.activity_logs
DROP CONSTRAINT fk_user,
ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```
*If these are missing, `deleteUser` will FAIL or leave junk data.*

---

## 4. 🧠 BUSINESS LOGIC & MATH

### A. Timezone & Localization
- **Input**: User selects "Asia/Kolkata".
- **Storage**: `timezone` column (String: IANA Standard).
- **Display Logic**:
  - Frontend: `Intl.DateTimeFormat` uses this timezone.
  - Server (Cron Jobs): Must convert `UTC` -> `User Timezone` before sending emails.
- **Fallbacks**: If `timezone` is NULL, default to `UTC`.

### B. Credits & Usage
- **Logic**: Credits are stored in `user_credits` table.
- **Reset Logic**: Occurs on `billing_cycle_anchor` date.
- **Wiring**: `settings/billing` reads from `stripe_subscriptions` sync.

---

## 5. 🛠️ YOUR MANUAL TASKS (The Human Element)

These tasks cannot be automated by code. You must do them:

1.  **Supabase Console**:
    - Go to **Authentication > Providers**.
    - Enable **Google**.
    - Paste `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
    - Set Redirect URL: `https://your-domain.com/auth/callback`.

2.  **Environment Variables (`.env.local`)**:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    SUPABASE_SERVICE_ROLE_KEY=... (Critical for Delete Account)
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    ```

3.  **SQL Triggers**:
    - Ensure `on_auth_user_created` trigger exists to create `core_profiles` row automatically.

---

## 6. 🔮 FUTURE PROOFING (The Roadmap)

To reach **Industry Standard (Level 5)**:

1.  **Audit Logs**: Add `audit_logs` table to track WHO changed WHAT (for security).
    - *Wiring*: Every `server action` must insert into `audit_logs`.
2.  **Session Kill Switch**: When "Change Password" happens, invalidate ALL other sessions.
    - *Code*: `supabase.auth.admin.signOut(userId, 'global')`.
3.  **Export Data (GDPR)**: Add "Download My Data" button.
    - *Wiring*: JSON dump of all tables filtered by `user_id`.

---
**STATUS**: Blueprint Generated.
**READY FOR**: Coding Execution.
