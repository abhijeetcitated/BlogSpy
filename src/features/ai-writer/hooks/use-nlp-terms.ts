"use client"

import { useCallback, useMemo } from 'react'

export type NLPTerm = {
  term: string
  count: number
  score: number
}

export type UseNLPTermsOptions = {
  content: string
  maxTerms?: number
  minTermLength?: number
  stopwords?: Set<string>
}

export type UseNLPTermsReturn = {
  terms: NLPTerm[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

const DEFAULT_STOPWORDS = new Set<string>([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'has',
  'have',
  'he',
  'her',
  'his',
  'i',
  'in',
  'is',
  'it',
  'its',
  'me',
  'my',
  'not',
  'of',
  'on',
  'or',
  'our',
  'she',
  'that',
  'the',
  'their',
  'them',
  'there',
  'they',
  'this',
  'to',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'will',
  'with',
  'you',
  'your'
])

function tokenize(text: string): string[] {
  // Cheap tokenizer: ASCII-ish words; lowercased.
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function scoreTerm(count: number, maxCount: number): number {
  if (maxCount <= 0) return 0
  // Normalize 0..1 with a small bias toward higher frequency.
  const v = count / maxCount
  return Math.min(1, Math.max(0, Math.pow(v, 0.75)))
}

export function useNLPTerms(options: UseNLPTermsOptions): UseNLPTermsReturn {
  const { content, maxTerms = 25, minTermLength = 3, stopwords } = options

  const terms = useMemo<NLPTerm[]>(() => {
    const sw = stopwords ?? DEFAULT_STOPWORDS
    const tokens = tokenize(content)

    const freq = new Map<string, number>()
    for (const t of tokens) {
      if (t.length < minTermLength) continue
      if (sw.has(t)) continue
      freq.set(t, (freq.get(t) ?? 0) + 1)
    }

    let maxCount = 0
    for (const c of freq.values()) maxCount = Math.max(maxCount, c)

    const scored: NLPTerm[] = []
    for (const [term, count] of freq.entries()) {
      scored.push({ term, count, score: scoreTerm(count, maxCount) })
    }

    scored.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    return scored.slice(0, Math.max(0, maxTerms))
  }, [content, maxTerms, minTermLength, stopwords])

  const refresh = useCallback(() => {
    // Pure derivation; no fetch. Kept for API compatibility.
  }, [])

  return {
    terms,
    isLoading: false,
    error: null,
    refresh
  }
}

export type UseNLPScoreOptions = {
  content: string
}

export type NLPScore = {
  score: number
  label: 'poor' | 'ok' | 'good'
}

export function useNLPScore(options: UseNLPScoreOptions): NLPScore {
  const { content } = options

  const { score, label } = useMemo<NLPScore>(() => {
    // Heuristic: penalize extremely low unique token counts.
    const tokens = tokenize(content)
    const unique = new Set(tokens.filter((t) => t.length >= 3))
    const density = unique.size / Math.max(1, tokens.length)

    // Map density into 0..100-ish score.
    const raw = Math.round(Math.min(100, Math.max(0, density * 300)))
    const lbl: NLPScore['label'] = raw < 35 ? 'poor' : raw < 70 ? 'ok' : 'good'
    return { score: raw, label: lbl }
  }, [content])

  return { score, label }
}
