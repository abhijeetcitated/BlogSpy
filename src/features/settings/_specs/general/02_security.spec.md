# 🛡️ SPEC: SECURITY & AUTH
> **PARENT**: `general/README.md`
> **UI**: `AccountSecurityCard.tsx`
> **DB**: `auth.users`

## 1. 🧠 LOGIC & RULES
*   **Password Change**:
    *   **HIDDEN** for Google Users.
    *   **VISIBLE** for Email Users -> Triggers `ChangePasswordModal`.
*   **Re-Authentication**: Critical actions (Pass change) REQUIRE current password verification.
*   **2FA (Future)**: Toggle triggers `mfa` enrollment flow.

## 2. 🔌 WIRING
*   `updatePassword()` Action:
    1.  `signInWithPassword(current)` (Verify).
    2.  `updateUser(new)` (Execute).
    3.  `signOut(others)` (Security).
