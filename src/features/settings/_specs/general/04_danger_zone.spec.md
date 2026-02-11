# 💣 SPEC: DANGER ZONE
> **PARENT**: `general/README.md`
> **UI**: `DangerZone.tsx`
> **DB**: `auth.users`, `core_profiles`

## 1. 🧠 LOGIC & RULES
*   **Delete Account**:
    *   **Double Confirm**: Must type "DELETE" to confirm.
    *   **Re-Auth**: If Email user, request Password.
*   **Cascade**: MUST delete `credits`, `billing`, `projects` associated with user.

## 2. 🔌 WIRING
*   `deleteAccount()` Action:
    1.  `admin.auth.deleteUser(uid)` -> Triggers DB Cascades.
    2.  `signOut()` -> Redirect to Goodbye page.
