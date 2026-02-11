# 📇 SPEC: PROFILE MANAGER
> **PARENT**: `general/README.md`
> **UI**: `ProfileCard.tsx` / `AvatarUpload.tsx`
> **DB**: `core_profiles`, `auth.users`

## 1. 🧠 LOGIC & RULES
*   **Identity Lock**: If `auth_provider == 'google'`, Email is **READ-ONLY**.
*   **Name Sync**: UI defaults to `core_profiles.full_name`.
*   **Avatar Logic**:
    *   Uploads go to Supabase Storage bucket `avatars`.
    *   Max size: 2MB.
    *   Optimistic UI update on upload.

## 2. 🔌 WIRING
*   `updateProfileName()` Action -> Updates `core_profiles`.
*   `initiateEmailChange()` Action -> Triggers Supabase Email Confirmation.
