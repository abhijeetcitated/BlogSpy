# 🧾 SPEC: INVOICE HISTORY
> **PARENT**: `billing/README.md`
> **UI**: `InvoiceList.tsx`
> **SOURCE**: Stripe API

## 1. 🧠 LOGIC & RULES
*   **List View**: Shows last 10 invoices.
*   **Status Badges**: `Paid` (Green), `Open` (Yellow), `Void` (Gray).
*   **Download**: Direct link to Stripe PDF Hosting.

## 2. 🔌 WIRING
*   `getInvoices()` Action:
    *   Calls `stripe.invoices.list({ customer })`.
    *   Returns generic DTO to frontend.
