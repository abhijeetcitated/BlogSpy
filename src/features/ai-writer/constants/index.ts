// ============================================
// AI WRITER - Constants
// ============================================

import type { NLPKeyword, CriticalIssue, EditorStats, CompetitorData } from "../types"

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
