/**
 * ============================================
 * CREDITS MODULE - PUBLIC API
 * ============================================
 * 
 * Central export for all credit-related functionality.
 * Import from this file in all features.
 * 
 * @example
 * import { creditService, useCredits, CREDIT_COSTS } from "@/lib/credits"
 */

export {
  creditService,
  CreditService,
  checkCredits,
  useCredits,
  CREDIT_COSTS,
  PLAN_LIMITS,
  type CreditBalance,
  type CreditTransaction,
  type UseCreditsResult,
  type CreditCosts,
} from "./credit.service"
