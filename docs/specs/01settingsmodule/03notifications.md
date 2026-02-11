# SURGICAL SPEC: Notification Settings Module

## 1. 🎯 The Objective
Implement a robust "Permission Engine" with 6 specific toggles.
- **Strict Separation:** NO math logic here. Only ON/OFF switches.
- **Self-Healing:** If DB row is missing, auto-create it without crashing UI.

## 2. 🗄️ Database Schema (The Vault)
**File:** `prisma/schema.prisma`
**Table:** `notificationsettings` (Mapped to `notificationsettings` in Postgres)

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `userid` | UUID (PK) | - | FK to `auth.users` / `coreprofiles`. OnDelete: Cascade. |
| `weeklyreport` | Boolean | true | Controls Monday morning Cron Jobs. |
| `rankalerts` | Boolean | true | Controls Rank Tracker event dispatcher. |
| `decayalerts` | Boolean | true | Controls Decay detection engine emails. |
| `competitoralerts`| Boolean | false | **Pro Feature.** Backend must verify Plan before enabling. |
| `productupdates` | Boolean | true | Marketing emails. |
| `unsubscribeall` | Boolean | false | **Master Switch.** If True, overrides all above. |
| `updatedat` | DateTime | now() | Audit trail. |

## 3. 🧠 The Brain (Business Logic)

### A. The "Master Switch" Rule
- **Frontend:** If `unsubscribeall` is toggled ON -> Visualy disable (opacity 50%) all other switches.
- **Backend:** If `unsubscribeall` is saved as TRUE -> Force update all other columns to FALSE in the same transaction.
- **Reversion:** If user toggles any specific alert ON -> Automatically set `unsubscribeall` to FALSE.

### B. The "Ghost User" Fallback
- **Problem:** User signs up, but Trigger fails to create `notificationsettings` row.
- **Fix:** In `getNotificationSettings` server action:
  - Attempt to fetch row.
  - IF NULL -> Run `prisma.notificationSettings.create({ data: { userid } })` immediately -> Return default object.
  - DO NOT show loading spinner forever. Fix it silently.

### C. Security (Plan Gating)
- If user tries to toggle `competitoralerts` to TRUE:
  - Check `coreprofiles.billingtier`.
  - IF `free` -> Throw Error "Upgrade Required". (Frontend should show Upgrade Modal).

## 4. 🔌 Wiring & Connections

### Frontend (`NotificationsTab.tsx`)
- **State:** Use `useOptimistic` for instant feedback.
- **Loading:** Use `<Skeleton className="h-8 w-12 rounded-full" />` while fetching.
- **Toast:** Use `sonner` (`toast.success("Preferences updated")`).

### Backend (`update-notifications.ts`)
- **Input:** Validate using Zod:
  ```ts
  z.object({
    key: z.enum(['weeklyreport', 'rankalerts', ...]),
    value: z.boolean()
  })