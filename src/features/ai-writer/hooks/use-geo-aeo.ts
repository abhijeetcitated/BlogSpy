"use client"

import { useMemo } from 'react'

export type GeoAeoSignals = {
  geo?: {
    locale?: string
    country?: string
    city?: string
  }
  aeo?: {
    questionCoverage?: number
    snippetReadiness?: number
  }
}

export type GeoAeoScore = {
  score: number
  label: 'poor' | 'ok' | 'good'
}

export type UseGEOAEOOptions = {
  content: string
  signals?: GeoAeoSignals
}

export type UseGEOAEOReturn = {
  geo: GeoAeoScore
  aeo: GeoAeoScore
  combined: GeoAeoScore
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

function scoreToLabel(score: number): GeoAeoScore['label'] {
  return score < 35 ? 'poor' : score < 70 ? 'ok' : 'good'
}

function computeGeoScore(content: string, signals?: GeoAeoSignals): number {
  // Heuristic: if a locale/country is provided, reward mentioning it.
  const txt = content.toLowerCase()
  const country = signals?.geo?.country?.toLowerCase().trim()
  const city = signals?.geo?.city?.toLowerCase().trim()

  let hits = 0
  let total = 0

  if (country) {
    total += 1
    if (txt.includes(country)) hits += 1
  }
  if (city) {
    total += 1
    if (txt.includes(city)) hits += 1
  }

  if (total === 0) {
    // Fall back: longer content gets a slightly better baseline.
    const lenScore = clamp01(content.length / 1800)
    return Math.round(lenScore * 80)
  }

  return Math.round((hits / total) * 100)
}

function computeAeoScore(content: string, signals?: GeoAeoSignals): number {
  // Heuristic: reward presence of questions + short answers.
  const questionCount = (content.match(/\?/g) ?? []).length
  const hasBullets = /\n\s*[-*]\s+/m.test(content)

  const coverageHint = signals?.aeo?.questionCoverage
  const readinessHint = signals?.aeo?.snippetReadiness

  const q = clamp01(questionCount / 8)
  const b = hasBullets ? 0.15 : 0
  const hints = clamp01(((coverageHint ?? 0) + (readinessHint ?? 0)) / 200)

  const score = clamp01(0.55 * q + 0.2 * hints + b)
  return Math.round(score * 100)
}

export function useGEOAEO(options: UseGEOAEOOptions): UseGEOAEOReturn {
  const { content, signals } = options

  return useMemo(() => {
    const geoScore = computeGeoScore(content, signals)
    const aeoScore = computeAeoScore(content, signals)
    const combined = Math.round(0.5 * geoScore + 0.5 * aeoScore)

    return {
      geo: { score: geoScore, label: scoreToLabel(geoScore) },
      aeo: { score: aeoScore, label: scoreToLabel(aeoScore) },
      combined: { score: combined, label: scoreToLabel(combined) }
    }
  }, [content, signals])
}

export function useGEO(options: UseGEOAEOOptions): GeoAeoScore {
  const res = useGEOAEO(options)
  return res.geo
}

export function useAEO(options: UseGEOAEOOptions): GeoAeoScore {
  const res = useGEOAEO(options)
  return res.aeo
}
