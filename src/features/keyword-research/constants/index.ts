// ============================================
// KEYWORD MAGIC - Constants
// ============================================

import type { Country, KDLevel, IntentOption, VolumePreset } from "../types"

export const POPULAR_COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
]

export const ALL_COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
]

export const KD_LEVELS: KDLevel[] = [
  { label: "Very Easy", range: "0-14", min: 0, max: 14, color: "bg-green-500" },
  { label: "Easy", range: "15-29", min: 15, max: 29, color: "bg-green-400" },
  { label: "Moderate", range: "30-49", min: 30, max: 49, color: "bg-yellow-500" },
  { label: "Hard", range: "50-69", min: 50, max: 69, color: "bg-orange-500" },
  { label: "Very Hard", range: "70-84", min: 70, max: 84, color: "bg-red-400" },
  { label: "Extreme", range: "85-100", min: 85, max: 100, color: "bg-red-600" },
]

export const INTENT_OPTIONS: IntentOption[] = [
  { value: "I", label: "Informational", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "C", label: "Commercial", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { value: "T", label: "Transactional", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  { value: "N", label: "Navigational", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
]

export const VOLUME_PRESETS: VolumePreset[] = [
  { label: "High (10K+)", min: 10000, max: 500000 },
  { label: "Medium (1K-10K)", min: 1000, max: 10000 },
  { label: "Low (0-1K)", min: 0, max: 1000 },
]

export const DEFAULT_VOLUME_RANGE: [number, number] = [0, 500000]
export const DEFAULT_KD_RANGE: [number, number] = [0, 100]
export const DEFAULT_CPC_RANGE: [number, number] = [0, 50]

export const MAX_BULK_KEYWORDS = 100
