// ============================================
// COMPETITOR SERVICE - Production Ready
// ============================================
// Handles SERP and competitor data fetching
// Currently uses mock data, ready for real API integration

import { CompetitorData } from '../types'

// ============================================
// TYPES
// ============================================

export interface SERPResult {
  position: number
  title: string
  url: string
  domain: string
  snippet: string
  
  // Content metrics
  wordCount: number
  headerCount: number
  imageCount: number
  
  // SEO metrics
  domainAuthority?: number
  pageAuthority?: number
  backlinks?: number
  
  // Features
  hasFAQ: boolean
  hasVideo: boolean
  hasTable: boolean
  hasSchema: boolean
}

export interface SERPAnalysis {
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  
  // SERP features
  features: {
    featuredSnippet: boolean
    peopleAlsoAsk: boolean
    videoCarousel: boolean
    imagesPack: boolean
    localPack: boolean
    knowledgePanel: boolean
  }
  
  // Results
  results: SERPResult[]
  
  // Aggregated metrics
  avgWordCount: number
  avgHeaderCount: number
  avgImageCount: number
  topDomains: string[]
  
  // Recommendations
  recommendedWordCount: number
  recommendedHeaderCount: number
  recommendedImageCount: number
  
  // Timestamp
  fetchedAt: string
}

export interface CompetitorContentAnalysis {
  url: string
  
  // Structure
  headings: { level: string; text: string }[]
  paragraphs: number
  lists: number
  tables: number
  
  // Media
  images: { alt: string; src: string }[]
  videos: number
  
  // Keywords
  topKeywords: { word: string; count: number }[]
  keywordDensity: number
  
  // Schema
  schemaTypes: string[]
  
  // Internal/External links
  internalLinks: number
  externalLinks: number
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  SERP_CACHE: 'blogspy_competitor_serp_cache',
  ANALYSIS_CACHE: 'blogspy_competitor_analysis_cache'
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// ============================================
// MOCK DATA
// ============================================

const MOCK_SERP_RESULTS: SERPResult[] = [
  {
    position: 1,
    title: "Complete Guide to AI Agents: Everything You Need to Know",
    url: "https://openai.com/blog/ai-agents-guide",
    domain: "openai.com",
    snippet: "Learn everything about AI agents, from fundamentals to advanced implementations...",
    wordCount: 4500,
    headerCount: 18,
    imageCount: 12,
    domainAuthority: 92,
    pageAuthority: 78,
    backlinks: 1250,
    hasFAQ: true,
    hasVideo: true,
    hasTable: true,
    hasSchema: true
  },
  {
    position: 2,
    title: "What Are AI Agents? A Beginner's Guide - TechCrunch",
    url: "https://techcrunch.com/ai-agents-beginners-guide",
    domain: "techcrunch.com",
    snippet: "AI agents are revolutionizing how we interact with technology...",
    wordCount: 3200,
    headerCount: 14,
    imageCount: 8,
    domainAuthority: 89,
    pageAuthority: 72,
    backlinks: 890,
    hasFAQ: true,
    hasVideo: false,
    hasTable: true,
    hasSchema: true
  },
  {
    position: 3,
    title: "Building AI Agents: Step-by-Step Tutorial",
    url: "https://blog.langchain.dev/building-ai-agents",
    domain: "blog.langchain.dev",
    snippet: "A comprehensive tutorial on building production-ready AI agents...",
    wordCount: 5200,
    headerCount: 22,
    imageCount: 15,
    domainAuthority: 75,
    pageAuthority: 68,
    backlinks: 650,
    hasFAQ: false,
    hasVideo: true,
    hasTable: false,
    hasSchema: true
  },
  {
    position: 4,
    title: "AI Agents vs Chatbots: What's the Difference?",
    url: "https://www.forbes.com/ai-agents-vs-chatbots",
    domain: "forbes.com",
    snippet: "Understanding the key differences between AI agents and traditional chatbots...",
    wordCount: 2800,
    headerCount: 10,
    imageCount: 6,
    domainAuthority: 94,
    pageAuthority: 65,
    backlinks: 420,
    hasFAQ: true,
    hasVideo: false,
    hasTable: true,
    hasSchema: true
  },
  {
    position: 5,
    title: "The Future of AI Agents in Enterprise - Gartner",
    url: "https://www.gartner.com/ai-agents-enterprise",
    domain: "gartner.com",
    snippet: "Gartner predicts AI agents will transform enterprise operations...",
    wordCount: 3800,
    headerCount: 16,
    imageCount: 10,
    domainAuthority: 91,
    pageAuthority: 70,
    backlinks: 780,
    hasFAQ: false,
    hasVideo: false,
    hasTable: true,
    hasSchema: true
  }
]

// ============================================
// COMPETITOR SERVICE CLASS
// ============================================

class CompetitorService {
  // ============================================
  // SERP DATA
  // ============================================

  /**
   * Get SERP data for a keyword
   */
  async getSERPData(keyword: string): Promise<SERPAnalysis> {
    // Check cache first
    const cached = this.getFromCache<SERPAnalysis>(STORAGE_KEYS.SERP_CACHE, keyword)
    if (cached) {
      return cached
    }

    // Simulate API delay
    await this.simulateDelay(800, 1500)

    // In production: Call real SERP API (DataForSEO, Ahrefs, etc.)
    // const response = await fetch(`/api/serp?keyword=${encodeURIComponent(keyword)}`)
    // const data = await response.json()

    // Generate mock data based on keyword
    const results = this.generateMockResults(keyword)
    
    const analysis: SERPAnalysis = {
      keyword,
      searchVolume: this.generateMockVolume(keyword),
      difficulty: Math.floor(Math.random() * 40) + 30, // 30-70
      cpc: Math.random() * 5 + 0.5, // $0.50-$5.50
      
      features: {
        featuredSnippet: Math.random() > 0.4,
        peopleAlsoAsk: Math.random() > 0.2,
        videoCarousel: Math.random() > 0.6,
        imagesPack: Math.random() > 0.5,
        localPack: Math.random() > 0.8,
        knowledgePanel: Math.random() > 0.7
      },
      
      results,
      
      // Calculate averages
      avgWordCount: Math.round(results.reduce((sum, r) => sum + r.wordCount, 0) / results.length),
      avgHeaderCount: Math.round(results.reduce((sum, r) => sum + r.headerCount, 0) / results.length),
      avgImageCount: Math.round(results.reduce((sum, r) => sum + r.imageCount, 0) / results.length),
      topDomains: results.slice(0, 3).map(r => r.domain),
      
      // Recommendations (beat the average by 20%)
      recommendedWordCount: Math.round(results.reduce((sum, r) => sum + r.wordCount, 0) / results.length * 1.2),
      recommendedHeaderCount: Math.round(results.reduce((sum, r) => sum + r.headerCount, 0) / results.length * 1.2),
      recommendedImageCount: Math.round(results.reduce((sum, r) => sum + r.imageCount, 0) / results.length * 1.2),
      
      fetchedAt: new Date().toISOString()
    }

    // Cache the result
    this.saveToCache(STORAGE_KEYS.SERP_CACHE, keyword, analysis)

    return analysis
  }

  /**
   * Get competitor data in legacy format (for existing components)
   */
  async getCompetitorData(keyword: string): Promise<CompetitorData[]> {
    const serp = await this.getSERPData(keyword)
    
    return serp.results.slice(0, 5).map(r => ({
      rank: r.position,
      title: r.title,
      domain: r.domain,
      wordCount: r.wordCount,
      headerCount: r.headerCount
    }))
  }

  // ============================================
  // CONTENT ANALYSIS
  // ============================================

  /**
   * Analyze a competitor's page content
   */
  async analyzeCompetitorContent(url: string): Promise<CompetitorContentAnalysis> {
    // Check cache
    const cached = this.getFromCache<CompetitorContentAnalysis>(STORAGE_KEYS.ANALYSIS_CACHE, url)
    if (cached) {
      return cached
    }

    // Simulate API delay
    await this.simulateDelay(1000, 2000)

    // In production: Scrape and analyze the URL
    // const response = await fetch(`/api/analyze-content?url=${encodeURIComponent(url)}`)
    // const data = await response.json()

    // Mock analysis
    const analysis: CompetitorContentAnalysis = {
      url,
      headings: [
        { level: 'h1', text: 'Main Title' },
        { level: 'h2', text: 'Introduction' },
        { level: 'h2', text: 'Key Concepts' },
        { level: 'h3', text: 'Concept 1' },
        { level: 'h3', text: 'Concept 2' },
        { level: 'h2', text: 'Implementation' },
        { level: 'h2', text: 'Best Practices' },
        { level: 'h2', text: 'Conclusion' }
      ],
      paragraphs: Math.floor(Math.random() * 15) + 10,
      lists: Math.floor(Math.random() * 5) + 2,
      tables: Math.floor(Math.random() * 3),
      images: [
        { alt: 'Hero image', src: 'https://example.com/hero.jpg' },
        { alt: 'Diagram', src: 'https://example.com/diagram.jpg' },
        { alt: 'Screenshot', src: 'https://example.com/screenshot.jpg' }
      ],
      videos: Math.floor(Math.random() * 2),
      topKeywords: [
        { word: 'AI', count: 25 },
        { word: 'agent', count: 18 },
        { word: 'automation', count: 12 },
        { word: 'workflow', count: 10 },
        { word: 'integration', count: 8 }
      ],
      keywordDensity: Math.random() * 2 + 1, // 1-3%
      schemaTypes: ['Article', 'FAQPage', 'BreadcrumbList'],
      internalLinks: Math.floor(Math.random() * 15) + 5,
      externalLinks: Math.floor(Math.random() * 8) + 2
    }

    // Cache
    this.saveToCache(STORAGE_KEYS.ANALYSIS_CACHE, url, analysis)

    return analysis
  }

  // ============================================
  // CONTENT GAP ANALYSIS
  // ============================================

  /**
   * Find content gaps compared to competitors
   */
  async findContentGaps(
    yourContent: string,
    competitorUrls: string[]
  ): Promise<{
    missingTopics: string[]
    missingKeywords: string[]
    structureGaps: string[]
    recommendations: string[]
  }> {
    // Analyze competitors
    const analyses = await Promise.all(
      competitorUrls.map(url => this.analyzeCompetitorContent(url))
    )

    // In production: Use AI to compare content
    // For mock: Return predefined gaps
    
    return {
      missingTopics: [
        'Use cases and examples',
        'Comparison with alternatives',
        'Step-by-step tutorial',
        'Common mistakes to avoid',
        'Future trends'
      ],
      missingKeywords: [
        'automation',
        'workflow',
        'integration',
        'API',
        'best practices'
      ],
      structureGaps: [
        'Add FAQ section',
        'Include comparison table',
        'Add video content',
        'More visual examples'
      ],
      recommendations: [
        `Increase word count to ${Math.round(analyses.reduce((sum, a) => sum + a.paragraphs * 80, 0) / analyses.length)}+`,
        'Add more internal links',
        'Include structured data markup',
        'Add expert quotes or citations'
      ]
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private generateMockResults(keyword: string): SERPResult[] {
    // Customize mock data based on keyword
    return MOCK_SERP_RESULTS.map((result, index) => ({
      ...result,
      title: result.title.replace('AI Agents', keyword),
      snippet: result.snippet.replace('AI agents', keyword.toLowerCase()),
      wordCount: result.wordCount + Math.floor(Math.random() * 500) - 250
    }))
  }

  private generateMockVolume(keyword: string): number {
    // Generate realistic-looking search volume based on keyword length
    const baseVolume = keyword.length < 20 ? 5000 : 1000
    return Math.floor(baseVolume + Math.random() * baseVolume)
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  // ============================================
  // CACHING
  // ============================================

  private getFromCache<T>(storageKey: string, cacheKey: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const cache = localStorage.getItem(storageKey)
      if (!cache) return null

      const parsed = JSON.parse(cache)
      const entry = parsed[cacheKey]
      
      if (!entry) return null
      
      // Check expiration
      if (Date.now() - entry.timestamp > CACHE_DURATION) {
        delete parsed[cacheKey]
        localStorage.setItem(storageKey, JSON.stringify(parsed))
        return null
      }

      return entry.data as T
    } catch {
      return null
    }
  }

  private saveToCache<T>(storageKey: string, cacheKey: string, data: T): void {
    if (typeof window === 'undefined') return

    try {
      const cache = localStorage.getItem(storageKey)
      const parsed = cache ? JSON.parse(cache) : {}
      
      parsed[cacheKey] = {
        data,
        timestamp: Date.now()
      }
      
      localStorage.setItem(storageKey, JSON.stringify(parsed))
    } catch (error) {
      console.warn('Failed to save to cache:', error)
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.SERP_CACHE)
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS_CACHE)
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const competitorService = new CompetitorService()

// Export class for testing
export { CompetitorService }
