/**
 * Credit Packages Hook
 * Provides package configuration and pricing utilities
 */

"use client"

import { useMemo, useCallback } from "react"
import { 
  CREDIT_PACKAGES, 
  PLATFORM_CREDIT_COSTS,
  calculateCustomPrice,
  formatPrice,
} from "../config/pricing.config"
import type { CreditPackage, PlatformCreditConfig } from "../types/credit.types"

export interface UseCreditPackagesReturn {
  packages: CreditPackage[]
  platformCosts: Record<string, PlatformCreditConfig>
  calculatePrice: (credits: number) => {
    pricePerCredit: number
    totalPrice: number
    discount: number
    savings: number
  }
  formatPrice: (amount: number) => string
  getPackageById: (id: string) => CreditPackage | undefined
}

export function useCreditPackages(): UseCreditPackagesReturn {
  // Memoize static data
  const packages = useMemo(() => CREDIT_PACKAGES, [])
  const platformCosts = useMemo(() => PLATFORM_CREDIT_COSTS, [])

  const getPackageById = useCallback((id: string): CreditPackage | undefined => {
    return packages.find(pkg => pkg.id === id)
  }, [packages])

  return {
    packages,
    platformCosts,
    calculatePrice: calculateCustomPrice,
    formatPrice,
    getPackageById,
  }
}
