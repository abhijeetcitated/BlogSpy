// Settings Utility Functions

import type { PlanInfo } from "../types"

export function getCreditsPercentage(plan: PlanInfo): number {
  return Math.round((plan.creditsUsed / plan.creditsTotal) * 100)
}

export function getCreditsRemaining(plan: PlanInfo): number {
  return plan.creditsTotal - plan.creditsUsed
}

export function formatBillingCycle(cycle: "monthly" | "yearly"): string {
  return cycle === "monthly" ? "Billed monthly" : "Billed annually"
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
