// ============================================
// READABILITY SERVICE - Production Ready
// ============================================
// Calculates readability scores and metrics
// Flesch-Kincaid, reading time, grade level, etc.

// ============================================
// TYPES
// ============================================

export interface ReadabilityScore {
  // Main scores
  fleschReadingEase: number
  fleschKincaidGrade: number
  gunningFog: number
  smog: number
  colemanLiau: number
  automatedReadabilityIndex: number
  
  // Average
  averageGradeLevel: number
  
  // Interpretation
  readingLevel: 'very-easy' | 'easy' | 'fairly-easy' | 'standard' | 'fairly-difficult' | 'difficult' | 'very-difficult'
  targetAudience: string
  
  // Recommendations
  isGood: boolean
  recommendations: string[]
}

export interface ContentStats {
  // Text metrics
  characterCount: number
  wordCount: number
  sentenceCount: number
  paragraphCount: number
  
  // Averages
  avgWordsPerSentence: number
  avgSyllablesPerWord: number
  avgCharactersPerWord: number
  
  // Reading time
  readingTimeMinutes: number
  speakingTimeMinutes: number
  
  // Complexity
  complexWordCount: number
  complexWordPercentage: number
  longSentenceCount: number
  longSentencePercentage: number
}

export interface ReadabilityAnalysis {
  score: ReadabilityScore
  stats: ContentStats
  issues: ReadabilityIssue[]
  suggestions: string[]
}

export interface ReadabilityIssue {
  type: 'long-sentence' | 'complex-word' | 'passive-voice' | 'adverb-overuse' | 'repetition'
  text: string
  position: { start: number; end: number }
  suggestion: string
}

// ============================================
// CONSTANTS
// ============================================

const WORDS_PER_MINUTE = 238 // Average adult reading speed
const SPEAKING_WORDS_PER_MINUTE = 150

// Grade level thresholds
const GRADE_LEVELS = {
  'very-easy': { max: 5, label: 'Very Easy', audience: '5th grade or younger' },
  'easy': { max: 7, label: 'Easy', audience: '6th-7th grade' },
  'fairly-easy': { max: 9, label: 'Fairly Easy', audience: '8th-9th grade' },
  'standard': { max: 11, label: 'Standard', audience: '10th-11th grade' },
  'fairly-difficult': { max: 13, label: 'Fairly Difficult', audience: '12th grade to college' },
  'difficult': { max: 16, label: 'Difficult', audience: 'College level' },
  'very-difficult': { max: 100, label: 'Very Difficult', audience: 'Graduate level or above' }
}

// Common complex words to flag
const COMPLEX_WORDS_THRESHOLD = 3 // Syllables

// ============================================
// READABILITY SERVICE CLASS
// ============================================

class ReadabilityService {
  // ============================================
  // MAIN ANALYSIS
  // ============================================

  /**
   * Perform full readability analysis
   */
  analyze(content: string): ReadabilityAnalysis {
    // Clean content
    const text = this.stripHtml(content)
    
    // Get stats
    const stats = this.calculateStats(text)
    
    // Calculate scores
    const score = this.calculateScores(stats)
    
    // Find issues
    const issues = this.findIssues(text)
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(score, stats, issues)

    return {
      score,
      stats,
      issues,
      suggestions
    }
  }

  /**
   * Quick score calculation (for real-time feedback)
   */
  quickScore(content: string): { grade: number; level: string; readingTime: number } {
    const text = this.stripHtml(content)
    const stats = this.calculateStats(text)
    const grade = this.calculateFleschKincaidGrade(stats)
    
    return {
      grade: Math.round(grade * 10) / 10,
      level: this.getReadingLevelLabel(grade),
      readingTime: Math.ceil(stats.wordCount / WORDS_PER_MINUTE)
    }
  }

  // ============================================
  // STATISTICS CALCULATION
  // ============================================

  /**
   * Calculate all content statistics
   */
  calculateStats(text: string): ContentStats {
    const words = this.getWords(text)
    const sentences = this.getSentences(text)
    const paragraphs = this.getParagraphs(text)
    
    const wordCount = words.length
    const sentenceCount = Math.max(sentences.length, 1)
    const paragraphCount = Math.max(paragraphs.length, 1)
    
    // Calculate syllables
    const totalSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0)
    const totalCharacters = words.reduce((sum, word) => sum + word.length, 0)
    
    // Complex words (3+ syllables)
    const complexWords = words.filter(w => this.countSyllables(w) >= COMPLEX_WORDS_THRESHOLD)
    
    // Long sentences (20+ words)
    const longSentences = sentences.filter(s => this.getWords(s).length > 20)
    
    return {
      characterCount: text.length,
      wordCount,
      sentenceCount,
      paragraphCount,
      avgWordsPerSentence: wordCount / sentenceCount,
      avgSyllablesPerWord: totalSyllables / Math.max(wordCount, 1),
      avgCharactersPerWord: totalCharacters / Math.max(wordCount, 1),
      readingTimeMinutes: Math.ceil(wordCount / WORDS_PER_MINUTE),
      speakingTimeMinutes: Math.ceil(wordCount / SPEAKING_WORDS_PER_MINUTE),
      complexWordCount: complexWords.length,
      complexWordPercentage: (complexWords.length / Math.max(wordCount, 1)) * 100,
      longSentenceCount: longSentences.length,
      longSentencePercentage: (longSentences.length / Math.max(sentenceCount, 1)) * 100
    }
  }

  // ============================================
  // READABILITY FORMULAS
  // ============================================

  /**
   * Calculate all readability scores
   */
  calculateScores(stats: ContentStats): ReadabilityScore {
    const fleschReadingEase = this.calculateFleschReadingEase(stats)
    const fleschKincaidGrade = this.calculateFleschKincaidGrade(stats)
    const gunningFog = this.calculateGunningFog(stats)
    const smog = this.calculateSMOG(stats)
    const colemanLiau = this.calculateColemanLiau(stats)
    const ari = this.calculateARI(stats)
    
    // Average grade level (excluding Flesch Reading Ease which uses different scale)
    const averageGradeLevel = (fleschKincaidGrade + gunningFog + smog + colemanLiau + ari) / 5
    
    // Determine reading level
    const readingLevel = this.getReadingLevel(averageGradeLevel)
    const levelInfo = GRADE_LEVELS[readingLevel]
    
    // Check if good for web content (target: 7-9 grade level)
    const isGood = averageGradeLevel >= 6 && averageGradeLevel <= 10
    
    // Generate recommendations
    const recommendations: string[] = []
    if (averageGradeLevel > 10) {
      recommendations.push('Content may be too complex for general audiences')
      recommendations.push('Consider breaking long sentences into shorter ones')
      recommendations.push('Replace complex words with simpler alternatives')
    } else if (averageGradeLevel < 6) {
      recommendations.push('Content may be too simple for professional audiences')
      recommendations.push('Consider adding more detailed explanations')
    }
    if (stats.longSentencePercentage > 25) {
      recommendations.push('Too many long sentences - aim for under 20 words per sentence')
    }
    if (stats.complexWordPercentage > 15) {
      recommendations.push('High percentage of complex words - simplify where possible')
    }

    return {
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      gunningFog: Math.round(gunningFog * 10) / 10,
      smog: Math.round(smog * 10) / 10,
      colemanLiau: Math.round(colemanLiau * 10) / 10,
      automatedReadabilityIndex: Math.round(ari * 10) / 10,
      averageGradeLevel: Math.round(averageGradeLevel * 10) / 10,
      readingLevel,
      targetAudience: levelInfo.audience,
      isGood,
      recommendations
    }
  }

  /**
   * Flesch Reading Ease
   * 0-30: Very difficult, 30-50: Difficult, 50-60: Fairly difficult
   * 60-70: Standard, 70-80: Fairly easy, 80-90: Easy, 90-100: Very easy
   */
  private calculateFleschReadingEase(stats: ContentStats): number {
    return 206.835 - (1.015 * stats.avgWordsPerSentence) - (84.6 * stats.avgSyllablesPerWord)
  }

  /**
   * Flesch-Kincaid Grade Level
   * Returns US grade level (e.g., 8 = 8th grade)
   */
  private calculateFleschKincaidGrade(stats: ContentStats): number {
    return (0.39 * stats.avgWordsPerSentence) + (11.8 * stats.avgSyllablesPerWord) - 15.59
  }

  /**
   * Gunning Fog Index
   */
  private calculateGunningFog(stats: ContentStats): number {
    return 0.4 * (stats.avgWordsPerSentence + stats.complexWordPercentage)
  }

  /**
   * SMOG Index (Simple Measure of Gobbledygook)
   */
  private calculateSMOG(stats: ContentStats): number {
    if (stats.sentenceCount < 30) {
      // Adjusted formula for shorter texts
      return 1.0430 * Math.sqrt(stats.complexWordCount * (30 / stats.sentenceCount)) + 3.1291
    }
    return 1.0430 * Math.sqrt(stats.complexWordCount) + 3.1291
  }

  /**
   * Coleman-Liau Index
   */
  private calculateColemanLiau(stats: ContentStats): number {
    const L = (stats.avgCharactersPerWord * 100) // Letters per 100 words
    const S = (stats.sentenceCount / stats.wordCount) * 100 // Sentences per 100 words
    return (0.0588 * L) - (0.296 * S) - 15.8
  }

  /**
   * Automated Readability Index
   */
  private calculateARI(stats: ContentStats): number {
    return (4.71 * stats.avgCharactersPerWord) + (0.5 * stats.avgWordsPerSentence) - 21.43
  }

  // ============================================
  // ISSUE DETECTION
  // ============================================

  /**
   * Find readability issues in text
   */
  findIssues(text: string): ReadabilityIssue[] {
    const issues: ReadabilityIssue[] = []
    
    // Find long sentences
    const sentences = this.getSentences(text)
    let position = 0
    
    sentences.forEach(sentence => {
      const wordCount = this.getWords(sentence).length
      const start = text.indexOf(sentence, position)
      const end = start + sentence.length
      
      if (wordCount > 25) {
        issues.push({
          type: 'long-sentence',
          text: sentence.slice(0, 100) + (sentence.length > 100 ? '...' : ''),
          position: { start, end },
          suggestion: 'Consider breaking this sentence into shorter ones'
        })
      }
      
      position = end
    })

    // Find complex words
    const words = this.getWords(text)
    position = 0
    
    words.forEach(word => {
      const syllables = this.countSyllables(word)
      const start = text.indexOf(word, position)
      const end = start + word.length
      
      if (syllables >= 4 && word.length > 8) {
        issues.push({
          type: 'complex-word',
          text: word,
          position: { start, end },
          suggestion: `Consider simpler alternative for "${word}"`
        })
      }
      
      position = end
    })

    // Find passive voice patterns
    const passivePatterns = [
      /\b(was|were|is|are|been|being)\s+\w+ed\b/gi,
      /\b(was|were|is|are|been|being)\s+\w+en\b/gi
    ]
    
    passivePatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        issues.push({
          type: 'passive-voice',
          text: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          suggestion: 'Consider using active voice for more engaging writing'
        })
      }
    })

    // Limit issues to top 10
    return issues.slice(0, 10)
  }

  // ============================================
  // SUGGESTIONS
  // ============================================

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    score: ReadabilityScore,
    stats: ContentStats,
    issues: ReadabilityIssue[]
  ): string[] {
    const suggestions: string[] = []

    // Grade level suggestions
    if (score.averageGradeLevel > 12) {
      suggestions.push('🎓 Your content reads at a college level. For wider reach, aim for 8th-10th grade.')
    }

    // Sentence length
    if (stats.avgWordsPerSentence > 20) {
      suggestions.push(`📝 Average sentence length is ${Math.round(stats.avgWordsPerSentence)} words. Aim for 15-20 words.`)
    }

    // Complex words
    if (stats.complexWordPercentage > 10) {
      suggestions.push(`🔤 ${Math.round(stats.complexWordPercentage)}% of words are complex. Use simpler alternatives where possible.`)
    }

    // Passive voice
    const passiveCount = issues.filter(i => i.type === 'passive-voice').length
    if (passiveCount > 3) {
      suggestions.push(`✍️ Found ${passiveCount} passive voice instances. Active voice is more engaging.`)
    }

    // Long sentences
    if (stats.longSentencePercentage > 20) {
      suggestions.push(`📏 ${Math.round(stats.longSentencePercentage)}% of sentences are too long. Break them up for easier reading.`)
    }

    // Reading time
    if (stats.readingTimeMinutes > 10) {
      suggestions.push(`⏱️ Reading time is ${stats.readingTimeMinutes} minutes. Consider breaking into sections with headings.`)
    }

    // Positive feedback
    if (score.isGood && suggestions.length === 0) {
      suggestions.push('✅ Great job! Your content has good readability for web audiences.')
    }

    return suggestions
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Get words from text
   */
  private getWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0)
  }

  /**
   * Get sentences from text
   */
  private getSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  /**
   * Get paragraphs from text
   */
  private getParagraphs(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }

  /**
   * Count syllables in a word
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().trim()
    if (word.length <= 3) return 1

    // Remove silent e
    word = word.replace(/(?:[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')

    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
  }

  /**
   * Get reading level from grade
   */
  private getReadingLevel(grade: number): ReadabilityScore['readingLevel'] {
    for (const [level, info] of Object.entries(GRADE_LEVELS)) {
      if (grade <= info.max) {
        return level as ReadabilityScore['readingLevel']
      }
    }
    return 'very-difficult'
  }

  /**
   * Get reading level label
   */
  private getReadingLevelLabel(grade: number): string {
    const level = this.getReadingLevel(grade)
    return GRADE_LEVELS[level].label
  }

  /**
   * Get target reading level for different content types
   */
  getRecommendedLevel(contentType: 'blog' | 'technical' | 'academic' | 'marketing'): { grade: number; description: string } {
    const recommendations = {
      blog: { grade: 8, description: '8th grade level - accessible to most readers' },
      technical: { grade: 12, description: '12th grade level - appropriate for technical audiences' },
      academic: { grade: 14, description: 'College level - suitable for academic papers' },
      marketing: { grade: 6, description: '6th grade level - maximum accessibility' }
    }
    return recommendations[contentType]
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const readabilityService = new ReadabilityService()

// Export class for testing
export { ReadabilityService }
