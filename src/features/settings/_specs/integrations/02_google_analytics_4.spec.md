# 📊 SPEC: GOOGLE ANALYTICS 4 (GA4)
> **PARENT**: `integrations/README.md`
> **UI**: `IntegrationsTab.tsx`
> **PURPOSE**: Traffic-based decay detection.

## 1. 🧠 LOGIC & RULES
*   **Connection Flow**:
    1.  OAuth Consent (Scope: `analytics.readonly`).
    2.  **Property Selector Modal**: User must pick 1 GA4 Property (Website) to track.
*   **Data Sync**:
    1.  Fetch `user_engagement` and `sessions` metrics.
    2.  Store `property_id` in DB.

## 2. 🔌 WIRING
*   `listGa4Properties()` Action -> Returns list after OAuth.
*   `saveGa4Property(id)` Action -> Persists choice.
