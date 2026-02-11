# 💳 SPEC: BILLING & PLANS
> **PARENT**: `billing/README.md`
> **UI**: `BillingTab.tsx`
> **DB**: `billing_subscriptions`, `stripe_products`

## 1. 🧠 LOGIC & RULES
*   **Plan Display**: Syncs from `billing_subscriptions`.
    *   If `status === 'active'`: Show Plan Name + Renewal Date.
    *   If `status === 'past_due'`: Show Warning Banner.
*   **Upgrade/Downgrade**:
    *   Clicking upgrade redirects to Stripe Checkout Session.
*   **Customer Portal**:
    *   Link to Stripe Portal for card updates.

## 2. 🔌 WIRING
*   **Stripe Webhooks**: The Source of Truth.
    *   `customer.subscription.updated` -> Updates `billing_subscriptions`.
*   `createCheckoutSession()` Action -> Returns Stripe URL.
