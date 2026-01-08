"use client"

import { useMemo } from 'react'

export type ContentTargets = {
  wordCountTarget: number
  headingCountTarget: number
  imageCountTarget: number
}

export type ContentTargetsProgress = {
  wordCount: { current: number; target: number; progress: number }
  headings: { current: number; target: number; progress: number }
  images: { current: number; target: number; progress: number }
}

export type UseContentTargetsOptions = {
  content: string
  targets?: Partial<ContentTargets>
}

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.min(100, Math.max(0, v))
}

function estimateWords(htmlOrText: string): number {
  const text = htmlOrText
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return 0
  return text.split(' ').filter(Boolean).length
}

function countHeadings(html: string): number {
  const m = html.match(/<h[1-6][^>]*>/gi)
  return m ? m.length : 0
}

function countImages(html: string): number {
  const m = html.match(/<img\b[^>]*>/gi)
  return m ? m.length : 0
}

export function useContentTargets(options: UseContentTargetsOptions): ContentTargetsProgress {
  const { content, targets } = options

  return useMemo(() => {
    const effective: ContentTargets = {
      wordCountTarget: targets?.wordCountTarget ?? 1800,
      headingCountTarget: targets?.headingCountTarget ?? 10,
      imageCountTarget: targets?.imageCountTarget ?? 3
    }

    const wc = estimateWords(content)
    const hc = countHeadings(content)
    const ic = countImages(content)

    const wordProgress = clampPct((wc / Math.max(1, effective.wordCountTarget)) * 100)
    const headingProgress = clampPct((hc / Math.max(1, effective.headingCountTarget)) * 100)
    const imageProgress = clampPct((ic / Math.max(1, effective.imageCountTarget)) * 100)

    return {
      wordCount: { current: wc, target: effective.wordCountTarget, progress: wordProgress },
      headings: { current: hc, target: effective.headingCountTarget, progress: headingProgress },
      images: { current: ic, target: effective.imageCountTarget, progress: imageProgress }
    }
  }, [content, targets])
}
