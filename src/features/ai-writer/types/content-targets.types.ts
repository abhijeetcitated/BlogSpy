// ============================================
// AI WRITER - CONTENT TARGETS TYPES
// ============================================
// Feature #5 & #6: Word count and heading count
// targets based on competitor analysis
// ============================================

/**
 * Word count target configuration
 */
export interface WordCountTarget {
  min: number
  optimal: number
  max: number
  current: number
  competitorAvg?: number
  competitorRange?: { min: number; max: number }
  source: 'competitor' | 'keyword' | 'manual' | 'default'
}

/**
 * Heading count target for specific level
 */
export interface HeadingTarget {
  level: 'h1' | 'h2' | 'h3' | 'h4'
  min: number
  optimal: number
  max: number
  current: number
  competitorAvg?: number
}

/**
 * All heading targets
 */
export interface HeadingTargets {
  h1: HeadingTarget
  h2: HeadingTarget
  h3: HeadingTarget
  h4?: HeadingTarget
}

/**
 * Paragraph target configuration
 */
export interface ParagraphTarget {
  minCount: number
  optimalCount: number
  maxCount: number
  currentCount: number
  avgLengthTarget: number  // Words per paragraph
  currentAvgLength: number
}

/**
 * Image target configuration
 */
export interface ImageTarget {
  min: number
  optimal: number
  max: number
  current: number
  ratioPerWords: number  // 1 image per X words
}

/**
 * Link target configuration
 */
export interface LinkTarget {
  internal: {
    min: number
    optimal: number
    current: number
  }
  external: {
    min: number
    optimal: number
    current: number
  }
}

/**
 * Complete content targets
 */
export interface ContentTargets {
  wordCount: WordCountTarget
  headings: HeadingTargets
  paragraphs: ParagraphTarget
  images: ImageTarget
  links: LinkTarget
  
  // Metadata
  targetKeyword?: string
  basedOnCompetitors?: number
  lastUpdated: Date
}

/**
 * Target status for visual indicators
 */
export type TargetStatus = 'under' | 'approaching' | 'optimal' | 'over'

/**
 * Progress towards target
 */
export interface TargetProgress {
  percentage: number  // 0-100+
  status: TargetStatus
  message: string
  delta: number  // How many more/less needed
}

/**
 * Default targets when no competitor data
 */
export const DEFAULT_CONTENT_TARGETS: ContentTargets = {
  wordCount: {
    min: 1000,
    optimal: 1500,
    max: 3000,
    current: 0,
    source: 'default'
  },
  headings: {
    h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
    h2: { level: 'h2', min: 3, optimal: 5, max: 10, current: 0 },
    h3: { level: 'h3', min: 3, optimal: 8, max: 15, current: 0 }
  },
  paragraphs: {
    minCount: 8,
    optimalCount: 15,
    maxCount: 30,
    currentCount: 0,
    avgLengthTarget: 80,
    currentAvgLength: 0
  },
  images: {
    min: 1,
    optimal: 3,
    max: 10,
    current: 0,
    ratioPerWords: 350
  },
  links: {
    internal: { min: 2, optimal: 5, current: 0 },
    external: { min: 2, optimal: 4, current: 0 }
  },
  lastUpdated: new Date()
}

/**
 * Target presets by content type
 */
export const CONTENT_TYPE_TARGETS: Record<string, Partial<ContentTargets>> = {
  'blog-post': {
    wordCount: { min: 1200, optimal: 2000, max: 3500, current: 0, source: 'default' },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { level: 'h2', min: 4, optimal: 6, max: 12, current: 0 },
      h3: { level: 'h3', min: 4, optimal: 10, max: 20, current: 0 }
    }
  },
  'pillar-content': {
    wordCount: { min: 3000, optimal: 4500, max: 7000, current: 0, source: 'default' },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { level: 'h2', min: 8, optimal: 12, max: 20, current: 0 },
      h3: { level: 'h3', min: 10, optimal: 20, max: 40, current: 0 }
    }
  },
  'product-review': {
    wordCount: { min: 1500, optimal: 2500, max: 4000, current: 0, source: 'default' },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { level: 'h2', min: 5, optimal: 8, max: 15, current: 0 },
      h3: { level: 'h3', min: 3, optimal: 6, max: 12, current: 0 }
    }
  },
  'how-to-guide': {
    wordCount: { min: 1000, optimal: 1800, max: 3000, current: 0, source: 'default' },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { level: 'h2', min: 5, optimal: 10, max: 15, current: 0 },
      h3: { level: 'h3', min: 5, optimal: 12, max: 25, current: 0 }
    }
  },
  'listicle': {
    wordCount: { min: 1500, optimal: 2500, max: 4000, current: 0, source: 'default' },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { level: 'h2', min: 10, optimal: 15, max: 30, current: 0 },
      h3: { level: 'h3', min: 5, optimal: 10, max: 20, current: 0 }
    }
  },
  'landing-page': {
    wordCount: { min: 500, optimal: 1000, max: 2000, current: 0, source: 'default' },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { level: 'h2', min: 3, optimal: 5, max: 8, current: 0 },
      h3: { level: 'h3', min: 2, optimal: 4, max: 8, current: 0 }
    }
  }
}
