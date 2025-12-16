// Keyword Overview Constants
import type { Country, RadarAxis, SeasonalityData, GlobalVolumeData } from "../types"

export const MAP_COUNTRIES: Country[] = [
  { id: "us", name: "US", x: 85, y: 55, volume: "45K", glow: true },
  { id: "uk", name: "UK", x: 195, y: 42, glow: true },
  { id: "in", name: "IN", x: 280, y: 70, volume: "20K", glow: true },
]

export const RADAR_AXES: RadarAxis[] = [
  { label: "Informational", value: 0.85, angle: -90 },
  { label: "Transactional", value: 0.3, angle: 0 },
  { label: "Video", value: 0.7, angle: 90 },
  { label: "News", value: 0.4, angle: 180 },
]

export const SEASONALITY_DATA: SeasonalityData = {
  months: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  values: [40, 45, 50, 60, 95, 85, 70, 65, 55, 50, 45, 42],
}

export const TREND_DATA = [30, 35, 40, 38, 45, 50, 55, 60, 58, 65, 70, 75, 80, 85, 90]

export const GLOBAL_VOLUMES: GlobalVolumeData[] = [
  { country: "US", flag: "🇺🇸", volume: "45K" },
  { country: "IN", flag: "🇮🇳", volume: "20K" },
  { country: "UK", flag: "🇬🇧", volume: "10K" },
]

export const CHART_DIMENSIONS = {
  radar: { centerX: 80, centerY: 80, maxRadius: 60 },
  trend: { width: 300, height: 120 },
} as const

export const KD_THRESHOLDS = {
  easy: 30,
  medium: 60,
  hard: 80,
} as const

export const DA_THRESHOLDS = {
  high: 90,
  medium: 80,
} as const
