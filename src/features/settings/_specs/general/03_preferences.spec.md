# 🌍 SPEC: PREFERENCES & LOCALIZATION
> **PARENT**: `general/README.md`
> **UI**: `GeneralTab.tsx` (Preferences Section)
> **DB**: `core_profiles.timezone`, `core_profiles.date_format`

## 1. 🧠 LOGIC & RULES
*   **Timezone**: Used for scheduling Reports.
    *   **Validation**: Must be valid IANA string (e.g. `Asia/Kolkata`).
    *   **Auto-Detect**: On first load, guess from `Intl.DateTimeFormat`.
*   **Date Format**: Controls display across App (`DD/MM/YYYY` vs `MM/DD/YYYY`).

## 2. 🔌 WIRING
*   `updatePreferences()` Action:
    *   Updates `core_profiles`.
    *   Triggers Sidebar refresh to apply new format globally.
