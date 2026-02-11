# 🔑 SPEC: API KEY MANAGEMENT
> **PARENT**: `api_keys/README.md`
> **UI**: `ApiKeysTab.tsx`
> **DB**: `api_keys` table

## 1. 🧠 LOGIC & RULES
*   **Generation**:
    *   Keys start with `sk_live_...`.
    *   Show ONCE upon creation. Never readable again.
*   **Revocation**:
    *   Immediate invalidation.
    *   Logs the event.
*   **Scopes** (V2): Read-only vs Write access.

## 2. 🔌 WIRING
*   `generateApiKey()` Action:
    *   Generates `crypto.randomUUID`.
    *   Hashes it (bcrypt/argon2) -> Stores Hash in DB.
    *   Returns Plain Text to User (Ephemeral).
