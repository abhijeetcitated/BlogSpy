# 🛠️ SETTINGS MODULE MASTER PLAN
> **ROLE**: Lead Product Architect
> **DATE**: 2026-02-03
> **SCOPE**: End-to-End Settings Architecture

---

## 1. 📋 OVERVIEW & SECTIONS (The Menu)
We will tackle the Settings Module section-by-section. This is the official breakdown:

| Section | Status | Purpose |
| :--- | :--- | :--- |
| **1. General** | 🟡 **Needs Polish** | Profile (Name, Email), Preferences (Timezone), Security (Password), Danger Zone. |
| **2. Billing** | 🟢 **Stable** | Plan details, Credit usage, Invoice history (Stripe sync). |
| **3. Usage** | 🟢 **Stable** | Granular credit breakdown (Keywords vs AI vs Scans). |
| **4. Notifications** | 🔴 **Pending** | Email preferences, Alert toggles. |
| **5. Integrations** | 🔴 **Pending** | Google Search Console, WordPress connect. |
| **6. API Keys** | 🟡 **Feature Flag** | Developer API access management. |
| **7. Decay Alerts** | 🔴 **To Add** | Specific configuration for Decay tracking (Frequency/Thresholds). |

---

## 2. ⚡ DEEP DIVE: GENERAL SETTINGS (The Foundation)
**Recommendation**: We start here. This controls the user's "Identity" & "Security".

### A. UX/UI Analysis (What to Keep/Remove)
1.  **Profile Avatar**:
    - *Keep*. Allow upload if `email` user. Sync from Google if `google` user.
2.  **Display Name**:
    - *Keep*. Editable.
3.  **Email Address**:
    - *Keep*. **LOCKED** for Google Users (Security Risk if changed).
    - *Action*: `initiateEmailChange` (Send magic link to new email).
4.  **Timezone & Date Format**:
    - *Keep*. Critical for "Decay Alerts" timing.
5.  **Account Security Card**:
    - *Keep*. Shows "Last Password Change".
    - **Logic**: Hide "Change Password" button if `provider === 'google'`.
6.  **Danger Zone**:
    - *Keep*. "Delete Account".

### B. The Google Auth Workflow (Manual Setup Guide)
You asked for this. Here is the step-by-step to enable "Continue with Google".

**Step 1: Google Cloud Console**
1.  Go to [console.cloud.google.com](https://console.cloud.google.com).
2.  Create New Project -> Name: "BlogSpy SaaS".
3.  Go to **APIs & Services** -> **OAuth consent screen**.
    - User Type: **External**.
    - App Name: "BlogSpy".
    - Support Email: Your email.
    - Developer Email: Your email.
    - Save.
4.  Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID**.
    - Application Type: **Web application**.
    - Name: "Supabase Auth".
    - **Authorized Redirect URIs** (CRITICAL):
      `https://<YOUR-SUPABASE-REF>.supabase.co/auth/v1/callback`
5.  Copy **Client ID** and **Client Secret**.

**Step 2: Supabase Dashboard**
1.  Go to **Authentication** -> **Providers**.
2.  Expand **Google**.
3.  Paste **Client ID** and **Client Secret**.
4.  Toggle **Enable Sign in with Google**.
5.  Save.

**Step 3: Env Variables (Local Dev)**
Add this to `.env.local` to allow Google Login in local `localhost:3000`.
_(Note: You must also add `http://localhost:3000/auth/callback` to Google Console Redirect URIs for dev)._

---

## 3. 🧩 THE WIRING MAP (Detailed Code Connection)

This is how the **General Tab** connects to your brain/codebase.

### 1. Visualization
`GeneralTab.tsx` is the **Brain Stick** that connects UI to Server Actions.

| UI Element | State/Hook | Server Action | DB Table |
| :--- | :--- | :--- | :--- |
| **Full Name Input** | `useProfile()` | `updateProfileName` | `core_profiles` |
| **Email Input** | `useUser()` | `initiateEmailChange` | `auth.users` |
| **Timezone Select** | `useForm()` | `updatePreferences` | `core_profiles` |
| **Password Btn** | `useAuth()` | `supabase.auth.updateUser` | `auth.users` |
| **Delete Btn** | `useAction()` | `deleteAccountAction` | `auth.users` + Cascade |

### 2. Logic Files ("The Brain")
- **`src/features/settings/components/GeneralTab.tsx`**: The orchestrator.
- **`src/features/settings/actions/profile-actions.ts`**: Handles Name/Email logic.
- **`src/features/settings/actions/update-preferences.ts`**: Handles Timezone/Date logic.
- **`src/hooks/use-user.ts`**: The "Sync" hook that keeps UI fresh.

### 3. Security Rules
- **Rule 1**: If `profile.auth_provider === 'google'`, `Password` & `Email` fields are **Read Only**.
- **Rule 2**: `deleteAccount` must verify `ctx.userId === input.userId` (Prevent Admin spoofing).
- **Rule 3**: Timezone update must perform `Intl` validation (prevent crashing reports).

---

## 4. 🚀 ACTION PLAN (Where to Start?)
I recommend tackling in this order:

1.  **Refine GeneralTab UI**: Disable Email/Password for Google Users (Visual Polish).
2.  **Fix Delete Cascade**: Ensure `deleteAccount` wipes everything clean.
3.  **Add 2FA Placeholder**: Add "Two-Factor Auth" toggle in Security Card (marked "Coming Soon").

**Your Call:** Shall I execute **Step 1 (Refine UI & Logic)** now?
