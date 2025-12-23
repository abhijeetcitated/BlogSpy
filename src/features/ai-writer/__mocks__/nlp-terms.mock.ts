// ============================================
// AI WRITER - NLP Terms Mock Data
// ============================================
// Production-ready mock data for NLP term suggestions
// Based on keyword: "AI Agents" (example)
// ============================================

import type { NLPTerm, NLPOptimizationScore } from '../types/nlp-terms.types'

/**
 * Generate mock NLP terms for a given keyword
 * In production, this would come from an API (DataForSEO, Surfer, etc.)
 */
export function generateMockNLPTerms(primaryKeyword: string): NLPTerm[] {
  // Simulate terms based on keyword - these would come from:
  // 1. SERP analysis (competitor content)
  // 2. Google NLP API
  // 3. Related searches
  // 4. PAA questions
  
  const mockTerms: NLPTerm[] = [
    // PRIMARY - Must use (target keyword + close variants)
    {
      id: 'nlp-1',
      term: primaryKeyword,
      priority: 'primary',
      targetCount: 5,
      maxCount: 10,
      currentCount: 0,
      status: 'missing',
      volume: 12500,
      difficulty: 65,
      relevance: 100,
      source: 'target-keyword'
    },
    {
      id: 'nlp-2',
      term: `${primaryKeyword.toLowerCase()} guide`,
      priority: 'primary',
      targetCount: 2,
      maxCount: 5,
      currentCount: 0,
      status: 'missing',
      volume: 2400,
      difficulty: 45,
      relevance: 95,
      source: 'related-search'
    },
    {
      id: 'nlp-3',
      term: `what are ${primaryKeyword.toLowerCase()}`,
      priority: 'primary',
      targetCount: 1,
      maxCount: 3,
      currentCount: 0,
      status: 'missing',
      volume: 5200,
      difficulty: 35,
      relevance: 92,
      source: 'paa'
    },
    
    // SECONDARY - Recommended for topical coverage
    {
      id: 'nlp-4',
      term: 'autonomous agents',
      priority: 'secondary',
      targetCount: 2,
      maxCount: 5,
      currentCount: 0,
      status: 'missing',
      volume: 3800,
      difficulty: 55,
      relevance: 88,
      source: 'competitor-serp'
    },
    {
      id: 'nlp-5',
      term: 'machine learning',
      priority: 'secondary',
      targetCount: 2,
      maxCount: 4,
      currentCount: 0,
      status: 'missing',
      volume: 110000,
      difficulty: 85,
      relevance: 82,
      source: 'lsi'
    },
    {
      id: 'nlp-6',
      term: 'large language models',
      priority: 'secondary',
      targetCount: 2,
      maxCount: 4,
      currentCount: 0,
      status: 'missing',
      volume: 27000,
      difficulty: 72,
      relevance: 85,
      source: 'lsi'
    },
    {
      id: 'nlp-7',
      term: 'natural language processing',
      priority: 'secondary',
      targetCount: 1,
      maxCount: 3,
      currentCount: 0,
      status: 'missing',
      volume: 33000,
      difficulty: 78,
      relevance: 80,
      source: 'lsi'
    },
    {
      id: 'nlp-8',
      term: 'automation',
      priority: 'secondary',
      targetCount: 2,
      maxCount: 5,
      currentCount: 0,
      status: 'missing',
      volume: 165000,
      difficulty: 68,
      relevance: 75,
      source: 'competitor-serp'
    },
    
    // SUPPORTING - LSI keywords for depth
    {
      id: 'nlp-9',
      term: 'GPT-4',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 3,
      currentCount: 0,
      status: 'missing',
      volume: 550000,
      difficulty: 90,
      relevance: 78,
      source: 'entity'
    },
    {
      id: 'nlp-10',
      term: 'prompt engineering',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 3,
      currentCount: 0,
      status: 'missing',
      volume: 22000,
      difficulty: 62,
      relevance: 72,
      source: 'lsi'
    },
    {
      id: 'nlp-11',
      term: 'ChatGPT',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 3,
      currentCount: 0,
      status: 'missing',
      volume: 1200000,
      difficulty: 95,
      relevance: 75,
      source: 'entity'
    },
    {
      id: 'nlp-12',
      term: 'workflow automation',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 2,
      currentCount: 0,
      status: 'missing',
      volume: 12000,
      difficulty: 58,
      relevance: 68,
      source: 'competitor-serp'
    },
    {
      id: 'nlp-13',
      term: 'decision making',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 2,
      currentCount: 0,
      status: 'missing',
      volume: 40000,
      difficulty: 55,
      relevance: 65,
      source: 'lsi'
    },
    {
      id: 'nlp-14',
      term: 'task execution',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 2,
      currentCount: 0,
      status: 'missing',
      volume: 1200,
      difficulty: 32,
      relevance: 70,
      source: 'competitor-serp'
    },
    {
      id: 'nlp-15',
      term: 'API integration',
      priority: 'supporting',
      targetCount: 1,
      maxCount: 2,
      currentCount: 0,
      status: 'missing',
      volume: 8500,
      difficulty: 48,
      relevance: 62,
      source: 'lsi'
    },
    
    // AVOID - Overused/spammy terms
    {
      id: 'nlp-16',
      term: 'revolutionary',
      priority: 'avoid',
      targetCount: 0,
      maxCount: 1,
      currentCount: 0,
      status: 'optimal',
      relevance: 0,
      source: 'manual'
    },
    {
      id: 'nlp-17',
      term: 'game-changer',
      priority: 'avoid',
      targetCount: 0,
      maxCount: 1,
      currentCount: 0,
      status: 'optimal',
      relevance: 0,
      source: 'manual'
    },
    {
      id: 'nlp-18',
      term: 'cutting-edge',
      priority: 'avoid',
      targetCount: 0,
      maxCount: 1,
      currentCount: 0,
      status: 'optimal',
      relevance: 0,
      source: 'manual'
    }
  ]
  
  return mockTerms
}

/**
 * Generate initial empty score
 */
export function getInitialNLPScore(): NLPOptimizationScore {
  return {
    score: 0,
    grade: 'F',
    primaryCompletion: 0,
    secondaryCompletion: 0,
    supportingCompletion: 0,
    overusedCount: 0,
    missingCritical: [],
    recommendations: []
  }
}

/**
 * Mock NLP terms for "AI Agents" keyword
 */
export const MOCK_NLP_TERMS_AI_AGENTS = generateMockNLPTerms('AI Agents')

/**
 * Mock NLP terms for "Content Marketing" keyword
 */
export const MOCK_NLP_TERMS_CONTENT_MARKETING: NLPTerm[] = [
  // PRIMARY
  {
    id: 'cm-1',
    term: 'content marketing',
    priority: 'primary',
    targetCount: 5,
    maxCount: 12,
    currentCount: 0,
    status: 'missing',
    volume: 110000,
    difficulty: 82,
    relevance: 100,
    source: 'target-keyword'
  },
  {
    id: 'cm-2',
    term: 'content strategy',
    priority: 'primary',
    targetCount: 3,
    maxCount: 7,
    currentCount: 0,
    status: 'missing',
    volume: 27000,
    difficulty: 75,
    relevance: 95,
    source: 'related-search'
  },
  {
    id: 'cm-3',
    term: 'content creation',
    priority: 'primary',
    targetCount: 2,
    maxCount: 5,
    currentCount: 0,
    status: 'missing',
    volume: 22000,
    difficulty: 68,
    relevance: 90,
    source: 'lsi'
  },
  
  // SECONDARY
  {
    id: 'cm-4',
    term: 'SEO',
    priority: 'secondary',
    targetCount: 2,
    maxCount: 5,
    currentCount: 0,
    status: 'missing',
    volume: 550000,
    difficulty: 92,
    relevance: 85,
    source: 'lsi'
  },
  {
    id: 'cm-5',
    term: 'blog posts',
    priority: 'secondary',
    targetCount: 2,
    maxCount: 4,
    currentCount: 0,
    status: 'missing',
    volume: 33000,
    difficulty: 55,
    relevance: 82,
    source: 'competitor-serp'
  },
  {
    id: 'cm-6',
    term: 'target audience',
    priority: 'secondary',
    targetCount: 2,
    maxCount: 4,
    currentCount: 0,
    status: 'missing',
    volume: 18000,
    difficulty: 45,
    relevance: 80,
    source: 'lsi'
  },
  {
    id: 'cm-7',
    term: 'brand awareness',
    priority: 'secondary',
    targetCount: 1,
    maxCount: 3,
    currentCount: 0,
    status: 'missing',
    volume: 27000,
    difficulty: 62,
    relevance: 78,
    source: 'competitor-serp'
  },
  
  // SUPPORTING
  {
    id: 'cm-8',
    term: 'social media',
    priority: 'supporting',
    targetCount: 1,
    maxCount: 3,
    currentCount: 0,
    status: 'missing',
    volume: 450000,
    difficulty: 88,
    relevance: 72,
    source: 'lsi'
  },
  {
    id: 'cm-9',
    term: 'conversion rate',
    priority: 'supporting',
    targetCount: 1,
    maxCount: 2,
    currentCount: 0,
    status: 'missing',
    volume: 33000,
    difficulty: 72,
    relevance: 68,
    source: 'lsi'
  },
  {
    id: 'cm-10',
    term: 'engagement',
    priority: 'supporting',
    targetCount: 1,
    maxCount: 3,
    currentCount: 0,
    status: 'missing',
    volume: 90000,
    difficulty: 65,
    relevance: 70,
    source: 'competitor-serp'
  },
  
  // AVOID
  {
    id: 'cm-11',
    term: 'synergy',
    priority: 'avoid',
    targetCount: 0,
    maxCount: 0,
    currentCount: 0,
    status: 'optimal',
    relevance: 0,
    source: 'manual'
  },
  {
    id: 'cm-12',
    term: 'leverage',
    priority: 'avoid',
    targetCount: 0,
    maxCount: 1,
    currentCount: 0,
    status: 'optimal',
    relevance: 0,
    source: 'manual'
  }
]

/**
 * Get mock NLP terms by keyword
 */
export function getMockNLPTermsByKeyword(keyword: string): NLPTerm[] {
  const keywordLower = keyword.toLowerCase()
  
  if (keywordLower.includes('content') || keywordLower.includes('marketing')) {
    return MOCK_NLP_TERMS_CONTENT_MARKETING
  }
  
  if (keywordLower.includes('ai') || keywordLower.includes('agent')) {
    return MOCK_NLP_TERMS_AI_AGENTS
  }
  
  // Generate generic terms for unknown keywords
  return generateMockNLPTerms(keyword)
}
