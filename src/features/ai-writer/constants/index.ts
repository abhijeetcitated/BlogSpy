// ============================================
// AI WRITER - Constants
// ============================================

import type { NLPKeyword, CriticalIssue, EditorStats, CompetitorData, CreditPlan, SchemaType } from "../types"

// Initial NLP Keywords for SEO
export const INITIAL_NLP_KEYWORDS: NLPKeyword[] = [
  { text: "AI Agents", used: false },
  { text: "Generative AI", used: false },
  { text: "LLMs", used: false },
  { text: "Prompt Engineering", used: false },
  { text: "Machine Learning", used: false },
  { text: "Neural Networks", used: false },
  { text: "Natural Language", used: false },
  { text: "Automation", used: false },
  { text: "GPT Models", used: false },
  { text: "Fine-tuning", used: false },
  { text: "Embeddings", used: false },
  { text: "Vector Database", used: false },
  { text: "RAG", used: false },
  { text: "Chain of Thought", used: false },
  { text: "Zero-shot", used: false },
]

// Critical SEO issues configuration
export const CRITICAL_ISSUES_CONFIG: CriticalIssue[] = [
  {
    id: "h1",
    text: "Add keyword in H1",
    check: (stats: EditorStats) => stats.headingCount.h1 > 0,
  },
  {
    id: "meta",
    text: "Meta description length",
    check: () => true, // Always passes for demo
  },
  {
    id: "wordcount",
    text: "Word count > 1500",
    check: (stats: EditorStats) => stats.wordCount >= 1500,
  },
  {
    id: "links",
    text: "Internal links > 3",
    check: (stats: EditorStats) => stats.linkCount >= 3,
  },
  {
    id: "images",
    text: "Image alt text",
    check: (stats: EditorStats) => stats.imageCount > 0,
  },
  {
    id: "density",
    text: "Keyword density 1-2%",
    check: (stats: EditorStats) => stats.keywordDensity >= 1 && stats.keywordDensity <= 2,
  },
]

// Default editor stats
export const DEFAULT_EDITOR_STATS: EditorStats = {
  wordCount: 0,
  characterCount: 0,
  headingCount: { h1: 0, h2: 0, h3: 0 },
  paragraphCount: 0,
  imageCount: 0,
  linkCount: 0,
  keywordDensity: 0,
  keywordCount: 0,
  content: "",
}

// Mock competitor data
export const COMPETITOR_DATA: CompetitorData[] = [
  { rank: 1, title: "The Ultimate Guide to AI Agents", domain: "techcrunch.com", wordCount: 2200, headerCount: 11 },
  { rank: 2, title: "AI Agents Explained: A Complete Overview", domain: "openai.com", wordCount: 1900, headerCount: 10 },
  { rank: 3, title: "Building AI Agents from Scratch", domain: "medium.com", wordCount: 1600, headerCount: 9 },
]

// ============================================
// CREDIT SYSTEM CONSTANTS
// ============================================

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'free',
    name: 'Free',
    credits: 50,
    price: 0,
    features: [
      '50 AI credits/month',
      'Basic AI writing',
      '5 drafts storage',
      'Standard export'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    credits: 500,
    price: 19,
    features: [
      '500 AI credits/month',
      'All AI features',
      'Unlimited drafts',
      'Version history',
      'Priority support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 2000,
    price: 49,
    isPopular: true,
    features: [
      '2,000 AI credits/month',
      'All AI features',
      'Unlimited everything',
      'Team collaboration',
      'API access',
      'Custom templates'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 10000,
    price: 199,
    features: [
      '10,000 AI credits/month',
      'Unlimited everything',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
]

export const OPERATION_COSTS = {
  'generate-faq': { baseCost: 3, description: 'Generate FAQ section' },
  'generate-conclusion': { baseCost: 2, description: 'Generate conclusion' },
  'generate-intro': { baseCost: 2, description: 'Generate introduction' },
  'generate-outline': { baseCost: 2, description: 'Generate article outline' },
  'generate-full-article': { baseCost: 10, description: 'Generate full article' },
  'expand-text': { baseCost: 2, description: 'Expand selected text' },
  'rewrite-text': { baseCost: 2, description: 'Rewrite selected text' },
  'shorten-text': { baseCost: 1, description: 'Shorten selected text' },
  'fix-grammar': { baseCost: 1, description: 'Fix grammar issues' },
  'draft-definition': { baseCost: 1, description: 'Draft a definition' },
  'serp-analysis': { baseCost: 5, description: 'Analyze SERP competitors' },
  'content-analysis': { baseCost: 3, description: 'Analyze competitor content' }
} as const

// ============================================
// EXPORT CONSTANTS
// ============================================

export const EXPORT_FORMATS = [
  { id: 'markdown', name: 'Markdown', extension: 'md', description: 'Plain text with formatting' },
  { id: 'html', name: 'HTML', extension: 'html', description: 'Complete HTML document' },
  { id: 'wordpress', name: 'WordPress', extension: 'json', description: 'WordPress-compatible JSON' },
  { id: 'json', name: 'JSON', extension: 'json', description: 'Structured data format' },
  { id: 'docx', name: 'Word', extension: 'docx', description: 'Microsoft Word (Coming Soon)', disabled: true }
] as const

// ============================================
// SCHEMA CONSTANTS
// ============================================

export const SCHEMA_TYPES: { type: SchemaType; name: string; description: string; benefit: string }[] = [
  {
    type: 'Article',
    name: 'Article',
    description: 'Standard article markup',
    benefit: 'Enhanced search appearance with author info'
  },
  {
    type: 'FAQPage',
    name: 'FAQ',
    description: 'Frequently Asked Questions',
    benefit: 'FAQ rich snippets in search results'
  },
  {
    type: 'HowTo',
    name: 'How-To',
    description: 'Step-by-step instructions',
    benefit: 'Step-by-step rich results'
  },
  {
    type: 'Review',
    name: 'Review',
    description: 'Product/service review with rating',
    benefit: 'Star ratings in search results'
  },
  {
    type: 'BreadcrumbList',
    name: 'Breadcrumb',
    description: 'Navigation path hierarchy',
    benefit: 'Breadcrumb trail in search'
  }
]

// ============================================
// READABILITY CONSTANTS
// ============================================

export const READABILITY_LEVELS = {
  'very-easy': { maxGrade: 5, label: 'Very Easy', audience: '5th grade or younger', color: 'text-green-500' },
  'easy': { maxGrade: 7, label: 'Easy', audience: '6th-7th grade', color: 'text-green-400' },
  'fairly-easy': { maxGrade: 9, label: 'Fairly Easy', audience: '8th-9th grade', color: 'text-blue-500' },
  'standard': { maxGrade: 11, label: 'Standard', audience: '10th-11th grade', color: 'text-blue-400' },
  'fairly-difficult': { maxGrade: 13, label: 'Fairly Difficult', audience: 'College', color: 'text-yellow-500' },
  'difficult': { maxGrade: 16, label: 'Difficult', audience: 'College level', color: 'text-orange-500' },
  'very-difficult': { maxGrade: 100, label: 'Very Difficult', audience: 'Graduate+', color: 'text-red-500' }
} as const

export const RECOMMENDED_READING_LEVEL = {
  blog: 8,
  technical: 12,
  academic: 14,
  marketing: 6
} as const

// ============================================
// EDITOR CONSTANTS
// ============================================

export const EDITOR_CONFIG = {
  minWordCount: 300,
  recommendedWordCount: 1500,
  maxWordCount: 10000,
  autoSaveInterval: 30000, // 30 seconds
  maxDrafts: 100,
  maxVersionsPerDraft: 50
} as const

export const META_LIMITS = {
  title: { min: 30, max: 60, recommended: 50 },
  description: { min: 120, max: 160, recommended: 150 },
  slug: { maxLength: 75 }
} as const

// ============================================
// AI WRITING PROMPTS (Templates for real API)
// ============================================

export const AI_PROMPTS = {
  faq: `Generate a comprehensive FAQ section for an article about "{keyword}". 
Include 4-6 common questions that users might ask about this topic.
Format as HTML with h3 for questions and p for answers.`,

  conclusion: `Write a compelling conclusion paragraph for an article about "{keyword}".
Summarize key points and include a call-to-action.
Format as HTML with h2 heading and p paragraphs.`,

  expand: `Expand on the following text with more details, examples, and explanations:
"{content}"
Maintain the same tone and style.`,

  rewrite: `Rewrite the following text to be clearer and more engaging:
"{content}"
Keep the same meaning but improve readability.`,

  shorten: `Condense the following text while keeping the main points:
"{content}"
Make it 50% shorter.`,

  grammar: `Fix any grammar, spelling, and punctuation errors in the following text:
"{content}"
Return only the corrected text.`,

  definition: `Write a clear, concise definition for "{keyword}".
Format as a single paragraph starting with "Definition:"`,

  intro: `Write an engaging introduction for an article about "{keyword}".
Hook the reader, preview the content, and establish credibility.
Format as HTML with 2 paragraphs.`,

  outline: `Generate an SEO-optimized article outline for "{keyword}".
Include h2 and h3 headings.
Return as JSON array with: id, level, text, hasImage.`
} as const

