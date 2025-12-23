// ============================================
// SCHEMA SERVICE - Production Ready
// ============================================
// Generates JSON-LD structured data for SEO
// Supports Article, FAQ, HowTo, Review, Breadcrumb

// ============================================
// TYPES
// ============================================

export type SchemaType = 
  | 'Article' 
  | 'FAQPage' 
  | 'HowTo' 
  | 'Review' 
  | 'BreadcrumbList'
  | 'Product'
  | 'LocalBusiness'
  | 'Organization'
  | 'Person'

export interface SchemaConfig {
  type: SchemaType
  enabled: boolean
  data?: Record<string, unknown>
}

export interface ArticleSchemaData {
  headline: string
  description: string
  image?: string
  author: {
    name: string
    url?: string
  }
  publisher: {
    name: string
    logo?: string
  }
  datePublished: string
  dateModified?: string
  wordCount?: number
  keywords?: string[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}

export interface HowToSchemaData {
  name: string
  description: string
  totalTime?: string // ISO 8601 duration format
  estimatedCost?: { currency: string; value: number }
  supply?: string[]
  tool?: string[]
  steps: HowToStep[]
  image?: string
}

export interface ReviewSchemaData {
  itemReviewed: {
    type: 'Product' | 'LocalBusiness' | 'Organization' | 'Book' | 'Movie'
    name: string
  }
  reviewRating: {
    ratingValue: number
    bestRating?: number
    worstRating?: number
  }
  author: string
  reviewBody: string
  datePublished?: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface GeneratedSchema {
  type: SchemaType
  script: string
  json: Record<string, unknown>
  isValid: boolean
  warnings: string[]
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

const DEFAULT_PUBLISHER = {
  name: 'BlogSpy',
  logo: 'https://blogspy.io/logo.png'
}

const DEFAULT_AUTHOR = {
  name: 'BlogSpy Team',
  url: 'https://blogspy.io'
}

// ============================================
// SCHEMA SERVICE CLASS
// ============================================

class SchemaService {
  // ============================================
  // ARTICLE SCHEMA
  // ============================================

  /**
   * Generate Article schema
   */
  generateArticleSchema(data: ArticleSchemaData): GeneratedSchema {
    const warnings: string[] = []

    // Validate data
    if (!data.headline) warnings.push('Headline is required')
    if (data.headline && data.headline.length > 110) {
      warnings.push('Headline should be under 110 characters')
    }
    if (!data.description) warnings.push('Description is recommended')
    if (!data.image) warnings.push('Image is recommended for rich results')

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': data.headline,
      'description': data.description,
      'image': data.image,
      'author': {
        '@type': 'Person',
        'name': data.author?.name || DEFAULT_AUTHOR.name,
        'url': data.author?.url || DEFAULT_AUTHOR.url
      },
      'publisher': {
        '@type': 'Organization',
        'name': data.publisher?.name || DEFAULT_PUBLISHER.name,
        'logo': {
          '@type': 'ImageObject',
          'url': data.publisher?.logo || DEFAULT_PUBLISHER.logo
        }
      },
      'datePublished': data.datePublished,
      'dateModified': data.dateModified || data.datePublished,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': '#article'
      }
    }

    // Add optional fields
    if (data.wordCount) {
      Object.assign(schema, { wordCount: data.wordCount })
    }
    if (data.keywords?.length) {
      Object.assign(schema, { keywords: data.keywords.join(', ') })
    }

    return {
      type: 'Article',
      script: this.toScript(schema),
      json: schema,
      isValid: warnings.length === 0,
      warnings
    }
  }

  // ============================================
  // FAQ SCHEMA
  // ============================================

  /**
   * Generate FAQPage schema
   */
  generateFAQSchema(faqs: FAQItem[]): GeneratedSchema {
    const warnings: string[] = []

    if (faqs.length === 0) {
      warnings.push('At least one FAQ item is required')
    }
    if (faqs.length < 3) {
      warnings.push('Recommended to have at least 3 FAQ items')
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }

    return {
      type: 'FAQPage',
      script: this.toScript(schema),
      json: schema,
      isValid: warnings.length === 0,
      warnings
    }
  }

  /**
   * Extract FAQ items from HTML content
   */
  extractFAQsFromContent(content: string): FAQItem[] {
    const faqs: FAQItem[] = []
    
    // Pattern 1: h3 questions followed by p answers
    const h3Pattern = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi
    let match
    
    while ((match = h3Pattern.exec(content)) !== null) {
      const question = this.stripHtml(match[1])
      const answer = this.stripHtml(match[2])
      
      if (question.includes('?') || question.toLowerCase().startsWith('what') ||
          question.toLowerCase().startsWith('how') || question.toLowerCase().startsWith('why') ||
          question.toLowerCase().startsWith('when') || question.toLowerCase().startsWith('where')) {
        faqs.push({ question, answer })
      }
    }

    // Pattern 2: Look for FAQ section
    const faqSectionMatch = content.match(/<h2[^>]*>.*?FAQ.*?<\/h2>([\s\S]*?)(?=<h2|$)/i)
    if (faqSectionMatch) {
      const faqContent = faqSectionMatch[1]
      const faqPattern = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi
      
      while ((match = faqPattern.exec(faqContent)) !== null) {
        const question = this.stripHtml(match[1])
        const answer = this.stripHtml(match[2])
        
        // Avoid duplicates
        if (!faqs.some(f => f.question === question)) {
          faqs.push({ question, answer })
        }
      }
    }

    return faqs
  }

  // ============================================
  // HOW-TO SCHEMA
  // ============================================

  /**
   * Generate HowTo schema
   */
  generateHowToSchema(data: HowToSchemaData): GeneratedSchema {
    const warnings: string[] = []

    if (!data.name) warnings.push('Name is required')
    if (data.steps.length === 0) warnings.push('At least one step is required')
    if (data.steps.length < 2) warnings.push('Recommended to have multiple steps')
    if (!data.image) warnings.push('Image is recommended for rich results')

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': data.name,
      'description': data.description,
      'step': data.steps.map((step, index) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text,
        ...(step.image && { 'image': step.image }),
        ...(step.url && { 'url': step.url })
      }))
    }

    // Optional fields
    if (data.image) schema['image'] = data.image
    if (data.totalTime) schema['totalTime'] = data.totalTime
    if (data.estimatedCost) {
      schema['estimatedCost'] = {
        '@type': 'MonetaryAmount',
        'currency': data.estimatedCost.currency,
        'value': data.estimatedCost.value
      }
    }
    if (data.supply?.length) {
      schema['supply'] = data.supply.map(s => ({
        '@type': 'HowToSupply',
        'name': s
      }))
    }
    if (data.tool?.length) {
      schema['tool'] = data.tool.map(t => ({
        '@type': 'HowToTool',
        'name': t
      }))
    }

    return {
      type: 'HowTo',
      script: this.toScript(schema),
      json: schema,
      isValid: warnings.length === 0,
      warnings
    }
  }

  /**
   * Extract HowTo steps from HTML content
   */
  extractHowToFromContent(content: string): HowToStep[] {
    const steps: HowToStep[] = []
    
    // Look for numbered lists or step patterns
    const olPattern = /<ol[^>]*>([\s\S]*?)<\/ol>/gi
    let olMatch
    
    while ((olMatch = olPattern.exec(content)) !== null) {
      const listContent = olMatch[1]
      const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let liMatch
      let stepNum = 1
      
      while ((liMatch = liPattern.exec(listContent)) !== null) {
        const text = this.stripHtml(liMatch[1])
        steps.push({
          name: `Step ${stepNum}`,
          text: text
        })
        stepNum++
      }
    }

    // Look for "Step X:" patterns
    const stepPattern = /(?:step\s*(\d+)[:\s-]*)(.*?)(?=step\s*\d+|<h[2-3]|$)/gi
    let stepMatch
    
    while ((stepMatch = stepPattern.exec(content)) !== null) {
      const stepNum = stepMatch[1]
      const text = this.stripHtml(stepMatch[2])
      
      if (!steps.some(s => s.name === `Step ${stepNum}`)) {
        steps.push({
          name: `Step ${stepNum}`,
          text: text.slice(0, 500) // Limit text length
        })
      }
    }

    return steps.sort((a, b) => {
      const numA = parseInt(a.name.replace('Step ', ''))
      const numB = parseInt(b.name.replace('Step ', ''))
      return numA - numB
    })
  }

  // ============================================
  // REVIEW SCHEMA
  // ============================================

  /**
   * Generate Review schema
   */
  generateReviewSchema(data: ReviewSchemaData): GeneratedSchema {
    const warnings: string[] = []

    if (!data.itemReviewed.name) warnings.push('Item name is required')
    if (!data.reviewRating.ratingValue) warnings.push('Rating value is required')
    if (data.reviewRating.ratingValue > 5) warnings.push('Rating should be 1-5')
    if (!data.reviewBody) warnings.push('Review body is required')

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      'itemReviewed': {
        '@type': data.itemReviewed.type,
        'name': data.itemReviewed.name
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': data.reviewRating.ratingValue,
        'bestRating': data.reviewRating.bestRating || 5,
        'worstRating': data.reviewRating.worstRating || 1
      },
      'author': {
        '@type': 'Person',
        'name': data.author
      },
      'reviewBody': data.reviewBody,
      ...(data.datePublished && { 'datePublished': data.datePublished })
    }

    return {
      type: 'Review',
      script: this.toScript(schema),
      json: schema,
      isValid: warnings.length === 0,
      warnings
    }
  }

  // ============================================
  // BREADCRUMB SCHEMA
  // ============================================

  /**
   * Generate BreadcrumbList schema
   */
  generateBreadcrumbSchema(items: BreadcrumbItem[]): GeneratedSchema {
    const warnings: string[] = []

    if (items.length === 0) warnings.push('At least one breadcrumb item is required')

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    }

    return {
      type: 'BreadcrumbList',
      script: this.toScript(schema),
      json: schema,
      isValid: warnings.length === 0,
      warnings
    }
  }

  // ============================================
  // COMBINED SCHEMA
  // ============================================

  /**
   * Generate all applicable schemas for content
   */
  generateAllSchemas(params: {
    article?: ArticleSchemaData
    faqs?: FAQItem[]
    howTo?: HowToSchemaData
    review?: ReviewSchemaData
    breadcrumbs?: BreadcrumbItem[]
  }): { schemas: GeneratedSchema[]; combinedScript: string } {
    const schemas: GeneratedSchema[] = []

    if (params.article) {
      schemas.push(this.generateArticleSchema(params.article))
    }
    if (params.faqs && params.faqs.length > 0) {
      schemas.push(this.generateFAQSchema(params.faqs))
    }
    if (params.howTo) {
      schemas.push(this.generateHowToSchema(params.howTo))
    }
    if (params.review) {
      schemas.push(this.generateReviewSchema(params.review))
    }
    if (params.breadcrumbs && params.breadcrumbs.length > 0) {
      schemas.push(this.generateBreadcrumbSchema(params.breadcrumbs))
    }

    // Combine all schemas into one script
    const allSchemas = schemas.map(s => s.json)
    const combinedScript = allSchemas.length > 1
      ? `<script type="application/ld+json">\n${JSON.stringify(allSchemas, null, 2)}\n</script>`
      : schemas[0]?.script || ''

    return { schemas, combinedScript }
  }

  // ============================================
  // AUTO-DETECTION
  // ============================================

  /**
   * Auto-detect which schemas are applicable for content
   */
  detectApplicableSchemas(content: string): SchemaType[] {
    const types: SchemaType[] = ['Article'] // Always applicable

    // Check for FAQ content
    const hasFAQ = /<h[2-3][^>]*>.*?(?:FAQ|Frequently Asked|Questions).*?<\/h[2-3]>/i.test(content) ||
                   (content.match(/<h3[^>]*>.*?\?.*?<\/h3>/g) || []).length >= 2

    if (hasFAQ) types.push('FAQPage')

    // Check for HowTo content
    const hasHowTo = /<h[1-2][^>]*>.*?(?:How to|Guide|Tutorial|Steps).*?<\/h[1-2]>/i.test(content) ||
                     (content.match(/<li/g) || []).length >= 3 ||
                     /step\s*\d+/i.test(content)

    if (hasHowTo) types.push('HowTo')

    // Check for Review content
    const hasReview = /(?:rating|stars|score|review|verdict)/i.test(content) &&
                      /\d+(?:\.\d+)?(?:\s*\/\s*\d+|\s*out of\s*\d+|\s*stars?)/i.test(content)

    if (hasReview) types.push('Review')

    return types
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate a schema against Google's requirements
   */
  validateSchema(schema: GeneratedSchema): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = [...schema.warnings]

    // Common validations
    if (!schema.json['@context']) {
      errors.push('@context is required')
    }
    if (!schema.json['@type']) {
      errors.push('@type is required')
    }

    // Type-specific validations
    switch (schema.type) {
      case 'Article':
        if (!schema.json['headline']) errors.push('headline is required')
        if (!schema.json['author']) errors.push('author is required')
        if (!schema.json['datePublished']) errors.push('datePublished is required')
        break

      case 'FAQPage':
        const mainEntity = schema.json['mainEntity'] as unknown[]
        if (!mainEntity || mainEntity.length === 0) {
          errors.push('At least one question/answer is required')
        }
        break

      case 'HowTo':
        const steps = schema.json['step'] as unknown[]
        if (!steps || steps.length === 0) {
          errors.push('At least one step is required')
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Convert schema object to script tag
   */
  private toScript(schema: Record<string, unknown>): string {
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Get schema type descriptions
   */
  getSchemaTypeInfo(): { type: SchemaType; name: string; description: string; benefit: string }[] {
    return [
      {
        type: 'Article',
        name: 'Article',
        description: 'Standard article markup for news, blog posts, and content',
        benefit: 'Enhanced search appearance with author and date info'
      },
      {
        type: 'FAQPage',
        name: 'FAQ',
        description: 'Frequently Asked Questions with expandable answers',
        benefit: 'FAQ rich snippets in search results, more SERP real estate'
      },
      {
        type: 'HowTo',
        name: 'How-To',
        description: 'Step-by-step instructions for completing a task',
        benefit: 'Step-by-step rich results, voice assistant compatibility'
      },
      {
        type: 'Review',
        name: 'Review',
        description: 'Product or service review with rating',
        benefit: 'Star ratings in search results'
      },
      {
        type: 'BreadcrumbList',
        name: 'Breadcrumb',
        description: 'Navigation path showing page hierarchy',
        benefit: 'Breadcrumb trail in search results'
      }
    ]
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const schemaService = new SchemaService()

// Export class for testing
export { SchemaService }
