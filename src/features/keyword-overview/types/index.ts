// Keyword Overview Types

export type DeviceView = "desktop" | "mobile"

export interface Country {
  id: string
  name: string
  x: number
  y: number
  volume?: string
  glow?: boolean
}

export interface RadarAxis {
  label: string
  value: number
  angle: number
}

export interface SeasonalityData {
  months: string[]
  values: number[]
}

export interface SERPResult {
  rank: number
  title: string
  domain: string
  da: number
  backlinks: number
  wordCount: number
  type: "Blog" | "Forum" | "E-commerce" | "News" | "Other"
  isWeak: boolean
}

export interface GlobalVolumeData {
  country: string
  flag: string
  volume: string
}

export interface KeywordMetrics {
  keyword: string
  volume: string
  kd: number
  kdLabel: string
  cpc: string
  geoScore: number
}
