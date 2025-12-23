// ============================================
// VERSION HISTORY SERVICE - Production Ready
// ============================================
// Tracks content changes with full diff support
// Ready for API integration

// ============================================
// TYPES
// ============================================

export interface ContentVersion {
  id: string
  draftId: string
  version: number
  
  // Content snapshot
  content: string
  wordCount: number
  
  // Metadata
  title: string
  metaTitle: string
  metaDescription: string
  
  // Change info
  changeType: 'manual' | 'auto-save' | 'ai-generated' | 'restore'
  changeDescription?: string
  changedSections?: string[]
  
  // Timestamps
  createdAt: string
  createdBy?: string
}

export interface VersionDiff {
  added: number
  removed: number
  unchanged: number
  changes: DiffChange[]
}

export interface DiffChange {
  type: 'add' | 'remove' | 'unchanged'
  value: string
  lineNumber?: number
}

export interface VersionCompareResult {
  versionA: ContentVersion
  versionB: ContentVersion
  diff: VersionDiff
  summary: string
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  VERSIONS: 'blogspy_ai_writer_versions',
  VERSION_CONFIG: 'blogspy_ai_writer_version_config'
}

// ============================================
// CONFIGURATION
// ============================================

interface VersionConfig {
  maxVersionsPerDraft: number
  autoVersionOnWordCountChange: number
  enableAutoVersioning: boolean
}

const DEFAULT_CONFIG: VersionConfig = {
  maxVersionsPerDraft: 50,
  autoVersionOnWordCountChange: 100, // Create version every 100 words changed
  enableAutoVersioning: true
}

// ============================================
// VERSION HISTORY SERVICE CLASS
// ============================================

class VersionHistoryService {
  private config: VersionConfig = DEFAULT_CONFIG

  constructor() {
    this.loadConfig()
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private loadConfig(): void {
    if (typeof window === 'undefined') return
    
    try {
      const config = localStorage.getItem(STORAGE_KEYS.VERSION_CONFIG)
      if (config) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(config) }
      }
    } catch (error) {
      console.warn('Failed to load version config:', error)
    }
  }

  // ============================================
  // VERSION CRUD
  // ============================================

  /**
   * Create a new version
   */
  async createVersion(params: {
    draftId: string
    content: string
    title: string
    metaTitle?: string
    metaDescription?: string
    changeType: ContentVersion['changeType']
    changeDescription?: string
    changedSections?: string[]
  }): Promise<ContentVersion> {
    const versions = this.getAllVersionsFromStorage()
    const draftVersions = versions[params.draftId] || []
    
    // Get next version number
    const lastVersion = draftVersions[draftVersions.length - 1]
    const nextVersionNum = lastVersion ? lastVersion.version + 1 : 1

    const version: ContentVersion = {
      id: this.generateId(),
      draftId: params.draftId,
      version: nextVersionNum,
      content: params.content,
      wordCount: this.countWords(params.content),
      title: params.title,
      metaTitle: params.metaTitle || '',
      metaDescription: params.metaDescription || '',
      changeType: params.changeType,
      changeDescription: params.changeDescription,
      changedSections: params.changedSections,
      createdAt: new Date().toISOString()
    }

    // Add to versions
    draftVersions.push(version)

    // Enforce max versions limit
    if (draftVersions.length > this.config.maxVersionsPerDraft) {
      // Keep first version (original) and most recent
      const toKeep = [
        draftVersions[0],
        ...draftVersions.slice(-this.config.maxVersionsPerDraft + 1)
      ]
      versions[params.draftId] = toKeep
    } else {
      versions[params.draftId] = draftVersions
    }

    this.saveVersionsToStorage(versions)
    return version
  }

  /**
   * Get a specific version
   */
  async getVersion(draftId: string, versionId: string): Promise<ContentVersion | null> {
    const versions = this.getAllVersionsFromStorage()
    const draftVersions = versions[draftId] || []
    return draftVersions.find(v => v.id === versionId) || null
  }

  /**
   * Get version by number
   */
  async getVersionByNumber(draftId: string, versionNum: number): Promise<ContentVersion | null> {
    const versions = this.getAllVersionsFromStorage()
    const draftVersions = versions[draftId] || []
    return draftVersions.find(v => v.version === versionNum) || null
  }

  /**
   * Get all versions for a draft
   */
  async getVersions(draftId: string): Promise<ContentVersion[]> {
    const versions = this.getAllVersionsFromStorage()
    return versions[draftId] || []
  }

  /**
   * Get the latest version for a draft
   */
  async getLatestVersion(draftId: string): Promise<ContentVersion | null> {
    const versions = await this.getVersions(draftId)
    return versions[versions.length - 1] || null
  }

  /**
   * Delete a specific version
   */
  async deleteVersion(draftId: string, versionId: string): Promise<boolean> {
    const versions = this.getAllVersionsFromStorage()
    const draftVersions = versions[draftId] || []
    
    const index = draftVersions.findIndex(v => v.id === versionId)
    if (index === -1) return false

    // Don't delete the first version (original)
    if (index === 0 && draftVersions.length > 1) {
      throw new Error('Cannot delete the original version')
    }

    draftVersions.splice(index, 1)
    versions[draftId] = draftVersions
    this.saveVersionsToStorage(versions)
    
    return true
  }

  /**
   * Delete all versions for a draft
   */
  async deleteAllVersions(draftId: string): Promise<boolean> {
    const versions = this.getAllVersionsFromStorage()
    
    if (!versions[draftId]) return false
    
    delete versions[draftId]
    this.saveVersionsToStorage(versions)
    
    return true
  }

  // ============================================
  // VERSION COMPARISON
  // ============================================

  /**
   * Compare two versions
   */
  async compareVersions(
    draftId: string,
    versionIdA: string,
    versionIdB: string
  ): Promise<VersionCompareResult | null> {
    const versionA = await this.getVersion(draftId, versionIdA)
    const versionB = await this.getVersion(draftId, versionIdB)

    if (!versionA || !versionB) return null

    const diff = this.calculateDiff(versionA.content, versionB.content)
    
    return {
      versionA,
      versionB,
      diff,
      summary: this.generateDiffSummary(versionA, versionB, diff)
    }
  }

  /**
   * Calculate diff between two content strings
   */
  private calculateDiff(contentA: string, contentB: string): VersionDiff {
    // Simple word-based diff
    const wordsA = this.tokenize(contentA)
    const wordsB = this.tokenize(contentB)

    const changes: DiffChange[] = []
    let added = 0
    let removed = 0
    let unchanged = 0

    // Use simple LCS-based diff
    const lcs = this.longestCommonSubsequence(wordsA, wordsB)
    
    let i = 0, j = 0, k = 0
    
    while (i < wordsA.length || j < wordsB.length) {
      if (k < lcs.length && i < wordsA.length && wordsA[i] === lcs[k]) {
        if (j < wordsB.length && wordsB[j] === lcs[k]) {
          changes.push({ type: 'unchanged', value: lcs[k] })
          unchanged++
          i++
          j++
          k++
        } else if (j < wordsB.length) {
          changes.push({ type: 'add', value: wordsB[j] })
          added++
          j++
        }
      } else if (i < wordsA.length) {
        changes.push({ type: 'remove', value: wordsA[i] })
        removed++
        i++
      } else if (j < wordsB.length) {
        changes.push({ type: 'add', value: wordsB[j] })
        added++
        j++
      }
    }

    return { added, removed, unchanged, changes }
  }

  /**
   * Generate a human-readable diff summary
   */
  private generateDiffSummary(
    versionA: ContentVersion,
    versionB: ContentVersion,
    diff: VersionDiff
  ): string {
    const wordDiff = versionB.wordCount - versionA.wordCount
    const wordChange = wordDiff > 0 ? `+${wordDiff}` : `${wordDiff}`
    
    const parts = [
      `Version ${versionA.version} → ${versionB.version}:`,
      `${diff.added} words added`,
      `${diff.removed} words removed`,
      `Net change: ${wordChange} words`
    ]

    return parts.join(' | ')
  }

  // ============================================
  // AUTO-VERSIONING
  // ============================================

  /**
   * Check if auto-version should be created
   */
  async shouldCreateAutoVersion(
    draftId: string,
    currentWordCount: number
  ): Promise<boolean> {
    if (!this.config.enableAutoVersioning) return false

    const latestVersion = await this.getLatestVersion(draftId)
    if (!latestVersion) return true

    const wordDiff = Math.abs(currentWordCount - latestVersion.wordCount)
    return wordDiff >= this.config.autoVersionOnWordCountChange
  }

  /**
   * Create auto-version if needed
   */
  async createAutoVersionIfNeeded(params: {
    draftId: string
    content: string
    title: string
    metaTitle?: string
    metaDescription?: string
  }): Promise<ContentVersion | null> {
    const wordCount = this.countWords(params.content)
    
    if (await this.shouldCreateAutoVersion(params.draftId, wordCount)) {
      return this.createVersion({
        ...params,
        changeType: 'auto-save',
        changeDescription: 'Auto-saved version'
      })
    }

    return null
  }

  // ============================================
  // RESTORE
  // ============================================

  /**
   * Restore a previous version (creates a new version with restored content)
   */
  async restoreVersion(draftId: string, versionId: string): Promise<ContentVersion | null> {
    const versionToRestore = await this.getVersion(draftId, versionId)
    if (!versionToRestore) return null

    return this.createVersion({
      draftId,
      content: versionToRestore.content,
      title: versionToRestore.title,
      metaTitle: versionToRestore.metaTitle,
      metaDescription: versionToRestore.metaDescription,
      changeType: 'restore',
      changeDescription: `Restored from version ${versionToRestore.version}`
    })
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VersionConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VERSION_CONFIG, JSON.stringify(this.config))
    }
  }

  /**
   * Get configuration
   */
  getConfig(): VersionConfig {
    return { ...this.config }
  }

  // ============================================
  // STORAGE HELPERS
  // ============================================

  private getAllVersionsFromStorage(): Record<string, ContentVersion[]> {
    if (typeof window === 'undefined') return {}
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VERSIONS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.warn('Failed to load versions:', error)
      return {}
    }
  }

  private saveVersionsToStorage(versions: Record<string, ContentVersion[]>): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions))
    } catch (error) {
      console.warn('Failed to save versions:', error)
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateId(): string {
    return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private countWords(content: string): number {
    if (!content) return 0
    const text = content.replace(/<[^>]*>/g, ' ')
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  private tokenize(content: string): string[] {
    const text = content.replace(/<[^>]*>/g, ' ')
    return text.trim().split(/\s+/).filter(w => w.length > 0)
  }

  private longestCommonSubsequence(a: string[], b: string[]): string[] {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // Backtrack to find LCS
    const lcs: string[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1])
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    return lcs
  }

  /**
   * Get statistics
   */
  getStats(): { totalVersions: number; draftCount: number } {
    const versions = this.getAllVersionsFromStorage()
    const draftIds = Object.keys(versions)
    const totalVersions = draftIds.reduce((sum, id) => sum + versions[id].length, 0)
    
    return {
      totalVersions,
      draftCount: draftIds.length
    }
  }

  /**
   * Clear all versions
   */
  clearAllVersions(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.VERSIONS)
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const versionHistoryService = new VersionHistoryService()

// Export class for testing
export { VersionHistoryService }
