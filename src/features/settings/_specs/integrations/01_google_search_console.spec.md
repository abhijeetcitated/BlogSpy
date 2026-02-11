# 🔌 SPEC: GOOGLE SEARCH CONSOLE INTEGRATION
> **PARENT**: `integrations/README.md`
> **UI**: `IntegrationsTab.tsx`
> **Auth**: OAuth 2.0 (Google)

## 1. 🧠 LOGIC & RULES
*   **Connection**:
    *   User clicks "Connect GSC".
    *   Redirect to Google OAuth Selection.
    *   Scope: `readonly` access to Search Data.
*   **Token Storage**:
    *   Store `refresh_token` in `integration_tokens` table (Encrypted).
    *   NEVER expose tokens to Frontend.

## 2. 🔌 WIRING
*   `connectIntegration(provider)` Action.
*   `api/integrations/google/callback` Route Handler.
