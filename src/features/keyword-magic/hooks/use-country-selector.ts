"use client"

// ============================================
// KEYWORD MAGIC - Country Selector Hook
// ============================================
// Manages country selection state
// ============================================

import { useState } from "react"
import type { Country } from "../types"

// ============================================
// TYPES
// ============================================

export interface UseCountrySelectorReturn {
  selectedCountry: Country | null
  setSelectedCountry: (country: Country | null) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

// ============================================
// HOOK
// ============================================

export function useCountrySelector(): UseCountrySelectorReturn {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  return {
    selectedCountry,
    setSelectedCountry,
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
  }
}
