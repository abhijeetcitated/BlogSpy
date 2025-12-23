// ============================================
// EXPORT SERVICE - Production Ready
// ============================================
// Handles content export in multiple formats
// Markdown, HTML, WordPress, JSON

// ============================================
// TYPES
// ============================================

export type ExportFormat = 'html' | 'markdown' | 'wordpress' | 'json' | 'docx'

export interface ExportOptions {
  format: ExportFormat
  includeMetadata: boolean
  includeFrontmatter: boolean
  includeSchema: boolean
  includeImages: boolean
  imagePlaceholders: 'url' | 'base64' | 'placeholder'
}

export interface ExportResult {
  success: boolean
  content: string
  filename: string
  mimeType: string
  size: number
  error?: string
}

export interface WordPressExport {
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'draft' | 'publish' | 'pending'
  categories: string[]
  tags: string[]
  featured_media?: string
  meta: {
    yoast_wpseo_title?: string
    yoast_wpseo_metadesc?: string
    yoast_wpseo_focuskw?: string
  }
}

export interface ContentMetadata {
  title: string
  metaTitle: string
  metaDescription: string
  slug: string
  focusKeyword: string
  secondaryKeywords: string[]
  author?: string
  publishDate?: string
  modifiedDate?: string
  categories?: string[]
  tags?: string[]
}

// ============================================
// DEFAULT OPTIONS
// ============================================

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'markdown',
  includeMetadata: true,
  includeFrontmatter: true,
  includeSchema: false,
  includeImages: true,
  imagePlaceholders: 'url'
}

// ============================================
// EXPORT SERVICE CLASS
// ============================================

class ExportService {
  // ============================================
  // MAIN EXPORT METHOD
  // ============================================

  /**
   * Export content in specified format
   */
  async export(
    content: string,
    metadata: ContentMetadata,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    try {
      let result: string
      let mimeType: string
      let extension: string

      switch (opts.format) {
        case 'markdown':
          result = this.toMarkdown(content, metadata, opts)
          mimeType = 'text/markdown'
          extension = 'md'
          break
        
        case 'html':
          result = this.toHTML(content, metadata, opts)
          mimeType = 'text/html'
          extension = 'html'
          break
        
        case 'wordpress':
          result = JSON.stringify(this.toWordPress(content, metadata, opts), null, 2)
          mimeType = 'application/json'
          extension = 'json'
          break
        
        case 'json':
          result = this.toJSON(content, metadata, opts)
          mimeType = 'application/json'
          extension = 'json'
          break
        
        case 'docx':
          result = this.toDocxPlaceholder(content, metadata)
          mimeType = 'text/plain' // Would be application/vnd.openxmlformats-officedocument.wordprocessingml.document
          extension = 'txt' // Would be docx
          break
        
        default:
          throw new Error(`Unsupported format: ${opts.format}`)
      }

      const filename = this.generateFilename(metadata.slug || metadata.title, extension)

      return {
        success: true,
        content: result,
        filename,
        mimeType,
        size: new Blob([result]).size
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        filename: '',
        mimeType: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  /**
   * Download exported content as file
   */
  async download(
    content: string,
    metadata: ContentMetadata,
    options: Partial<ExportOptions> = {}
  ): Promise<boolean> {
    const result = await this.export(content, metadata, options)
    
    if (!result.success) {
      console.error('Export failed:', result.error)
      return false
    }

    // Create and trigger download
    const blob = new Blob([result.content], { type: result.mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  }

  // ============================================
  // FORMAT CONVERTERS
  // ============================================

  /**
   * Convert HTML content to Markdown
   */
  private toMarkdown(
    content: string,
    metadata: ContentMetadata,
    options: ExportOptions
  ): string {
    const parts: string[] = []

    // Add frontmatter
    if (options.includeFrontmatter) {
      parts.push('---')
      parts.push(`title: "${metadata.title}"`)
      parts.push(`slug: "${metadata.slug}"`)
      parts.push(`description: "${metadata.metaDescription}"`)
      parts.push(`keywords: ${JSON.stringify([metadata.focusKeyword, ...metadata.secondaryKeywords])}`)
      if (metadata.author) parts.push(`author: "${metadata.author}"`)
      parts.push(`date: "${metadata.publishDate || new Date().toISOString()}"`)
      if (metadata.categories?.length) {
        parts.push(`categories: ${JSON.stringify(metadata.categories)}`)
      }
      if (metadata.tags?.length) {
        parts.push(`tags: ${JSON.stringify(metadata.tags)}`)
      }
      parts.push('---')
      parts.push('')
    }

    // Convert HTML to Markdown
    const markdown = this.htmlToMarkdown(content)
    parts.push(markdown)

    return parts.join('\n')
  }

  /**
   * Generate full HTML document
   */
  private toHTML(
    content: string,
    metadata: ContentMetadata,
    options: ExportOptions
  ): string {
    const schemaScript = options.includeSchema 
      ? this.generateSchemaScript(metadata, content)
      : ''

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.metaTitle || metadata.title}</title>
  <meta name="description" content="${metadata.metaDescription}">
  <meta name="keywords" content="${[metadata.focusKeyword, ...metadata.secondaryKeywords].join(', ')}">
  <meta name="author" content="${metadata.author || 'BlogSpy'}">
  <link rel="canonical" href="/${metadata.slug}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${metadata.metaTitle || metadata.title}">
  <meta property="og:description" content="${metadata.metaDescription}">
  <meta property="og:type" content="article">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metadata.metaTitle || metadata.title}">
  <meta name="twitter:description" content="${metadata.metaDescription}">
  
  ${schemaScript}
</head>
<body>
  <article>
    ${content}
  </article>
</body>
</html>`
  }

  /**
   * Generate WordPress-compatible export
   */
  private toWordPress(
    content: string,
    metadata: ContentMetadata,
    _options: ExportOptions
  ): WordPressExport {
    // Extract excerpt from content (first paragraph)
    // Using [\s\S]* instead of .* with s flag for compatibility
    const excerptMatch = content.match(/<p>([\s\S]*?)<\/p>/)
    const excerpt = excerptMatch 
      ? excerptMatch[1].replace(/<[^>]*>/g, '').slice(0, 160) 
      : metadata.metaDescription

    return {
      title: metadata.title,
      content: content,
      excerpt: excerpt,
      slug: metadata.slug,
      status: 'draft',
      categories: metadata.categories || [],
      tags: metadata.tags || [],
      meta: {
        yoast_wpseo_title: metadata.metaTitle,
        yoast_wpseo_metadesc: metadata.metaDescription,
        yoast_wpseo_focuskw: metadata.focusKeyword
      }
    }
  }

  /**
   * Export as structured JSON
   */
  private toJSON(
    content: string,
    metadata: ContentMetadata,
    options: ExportOptions
  ): string {
    const data = {
      metadata: options.includeMetadata ? metadata : undefined,
      content: {
        html: content,
        markdown: this.htmlToMarkdown(content),
        plainText: content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      },
      stats: {
        wordCount: this.countWords(content),
        characterCount: content.replace(/<[^>]*>/g, '').length,
        headingCount: (content.match(/<h[1-6]/g) || []).length,
        paragraphCount: (content.match(/<p/g) || []).length,
        imageCount: (content.match(/<img/g) || []).length,
        linkCount: (content.match(/<a /g) || []).length
      },
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * Placeholder for DOCX export (would need docx library)
   */
  private toDocxPlaceholder(content: string, metadata: ContentMetadata): string {
    return `[DOCX Export Placeholder]
    
Title: ${metadata.title}
Description: ${metadata.metaDescription}

Content would be converted to DOCX format using a library like 'docx'.

Plain text content:
${content.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n\n').trim()}
`
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Convert HTML to Markdown
   */
  private htmlToMarkdown(html: string): string {
    let md = html

    // Headers
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')

    // Bold and italic
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**')
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*')
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*')

    // Links
    md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

    // Images
    md = md.replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    md = md.replace(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)')
    md = md.replace(/<img[^>]+src="([^"]*)"[^>]*\/?>/gi, '![]($1)')

    // Lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n'
    })
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
      let counter = 1
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n'
    })

    // Paragraphs
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')

    // Line breaks
    md = md.replace(/<br\s*\/?>/gi, '\n')

    // Blockquotes
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
      return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n\n'
    })

    // Code blocks
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, '')

    // Decode HTML entities
    md = md.replace(/&nbsp;/g, ' ')
    md = md.replace(/&amp;/g, '&')
    md = md.replace(/&lt;/g, '<')
    md = md.replace(/&gt;/g, '>')
    md = md.replace(/&quot;/g, '"')

    // Clean up whitespace
    md = md.replace(/\n{3,}/g, '\n\n')

    return md.trim()
  }

  /**
   * Generate JSON-LD schema script
   */
  private generateSchemaScript(metadata: ContentMetadata, content: string): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': metadata.title,
      'description': metadata.metaDescription,
      'keywords': [metadata.focusKeyword, ...metadata.secondaryKeywords].join(', '),
      'author': {
        '@type': 'Person',
        'name': metadata.author || 'BlogSpy'
      },
      'datePublished': metadata.publishDate || new Date().toISOString(),
      'dateModified': metadata.modifiedDate || new Date().toISOString(),
      'wordCount': this.countWords(content)
    }

    return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`
  }

  /**
   * Generate filename from slug/title
   */
  private generateFilename(base: string, extension: string): string {
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)
    
    const timestamp = new Date().toISOString().split('T')[0]
    return `${slug}-${timestamp}.${extension}`
  }

  /**
   * Count words in HTML content
   */
  private countWords(html: string): number {
    const text = html.replace(/<[^>]*>/g, ' ')
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  // ============================================
  // BATCH EXPORT
  // ============================================

  /**
   * Export multiple articles (for cluster mode)
   */
  async exportBatch(
    articles: Array<{ content: string; metadata: ContentMetadata }>,
    options: Partial<ExportOptions> = {}
  ): Promise<{
    success: boolean
    results: ExportResult[]
    zipContent?: string
  }> {
    const results: ExportResult[] = []

    for (const article of articles) {
      const result = await this.export(article.content, article.metadata, options)
      results.push(result)
    }

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    // In production: Create actual ZIP file
    // const zip = new JSZip()
    // successful.forEach(r => zip.file(r.filename, r.content))
    // const zipContent = await zip.generateAsync({ type: 'base64' })

    return {
      success: failed.length === 0,
      results,
      // zipContent
    }
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): { format: ExportFormat; name: string; description: string }[] {
    return [
      { format: 'markdown', name: 'Markdown', description: 'Plain text with formatting (.md)' },
      { format: 'html', name: 'HTML', description: 'Complete HTML document (.html)' },
      { format: 'wordpress', name: 'WordPress', description: 'WordPress-compatible JSON (.json)' },
      { format: 'json', name: 'JSON', description: 'Structured data format (.json)' },
      { format: 'docx', name: 'Word Document', description: 'Microsoft Word format (.docx) - Coming Soon' }
    ]
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const exportService = new ExportService()

// Export class for testing
export { ExportService }
