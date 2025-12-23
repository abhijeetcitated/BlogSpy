// ============================================
// DRAFT SERVICE - Production Ready
// ============================================
// Handles all draft management with localStorage
// Ready for API integration

import { MetaSettings } from '../types'

// ============================================
// TYPES
// ============================================

export interface Draft {
  id: string
  title: string
  content: string
  keyword: string
  secondaryKeywords: string[]
  metaSettings: MetaSettings
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastAutoSaveAt?: string
  
  // Status
  status: 'draft' | 'in-progress' | 'ready-for-review' | 'published'
  wordCount: number
  completionPercentage: number
  
  // Context
  sourceFeature?: string
  clusterId?: string
  pillarId?: string
  
  // Flags
  isAutoSave: boolean
  isLocked: boolean
}

export interface DraftListItem {
  id: string
  title: string
  keyword: string
  status: Draft['status']
  wordCount: number
  updatedAt: string
  completionPercentage: number
}

export interface DraftFilters {
  status?: Draft['status']
  keyword?: string
  sourceFeature?: string
  sortBy?: 'updatedAt' | 'createdAt' | 'title' | 'wordCount'
  sortOrder?: 'asc' | 'desc'
}

export interface AutoSaveConfig {
  enabled: boolean
  intervalMs: number
  maxAutoSaves: number
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  DRAFTS: 'blogspy_ai_writer_drafts',
  CURRENT_DRAFT: 'blogspy_ai_writer_current_draft',
  AUTO_SAVE_CONFIG: 'blogspy_ai_writer_autosave_config'
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 30000, // 30 seconds
  maxAutoSaves: 10
}

const DEFAULT_META_SETTINGS: MetaSettings = {
  title: '',
  titleLength: 0,
  description: '',
  descriptionLength: 0,
  slug: '',
  focusKeyword: '',
  secondaryKeywords: [],
  isTitleValid: false,
  isDescriptionValid: false,
  isSlugValid: false
}

// ============================================
// DRAFT SERVICE CLASS
// ============================================

class DraftService {
  private autoSaveInterval: NodeJS.Timeout | null = null
  private autoSaveConfig: AutoSaveConfig = DEFAULT_AUTO_SAVE_CONFIG

  constructor() {
    this.loadAutoSaveConfig()
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private loadAutoSaveConfig(): void {
    if (typeof window === 'undefined') return
    
    try {
      const config = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_CONFIG)
      if (config) {
        this.autoSaveConfig = { ...DEFAULT_AUTO_SAVE_CONFIG, ...JSON.parse(config) }
      }
    } catch (error) {
      console.warn('Failed to load auto-save config:', error)
    }
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Create a new draft
   */
  async createDraft(params: {
    title?: string
    content?: string
    keyword?: string
    secondaryKeywords?: string[]
    sourceFeature?: string
    clusterId?: string
    pillarId?: string
  }): Promise<Draft> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    const draft: Draft = {
      id,
      title: params.title || 'Untitled Draft',
      content: params.content || '',
      keyword: params.keyword || '',
      secondaryKeywords: params.secondaryKeywords || [],
      metaSettings: { ...DEFAULT_META_SETTINGS, focusKeyword: params.keyword || '' },
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      wordCount: this.countWords(params.content || ''),
      completionPercentage: 0,
      sourceFeature: params.sourceFeature,
      clusterId: params.clusterId,
      pillarId: params.pillarId,
      isAutoSave: false,
      isLocked: false
    }

    // Save to storage
    const drafts = this.getAllDraftsFromStorage()
    drafts[id] = draft
    this.saveDraftsToStorage(drafts)

    return draft
  }

  /**
   * Get a draft by ID
   */
  async getDraft(id: string): Promise<Draft | null> {
    const drafts = this.getAllDraftsFromStorage()
    return drafts[id] || null
  }

  /**
   * Update an existing draft
   */
  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft | null> {
    const drafts = this.getAllDraftsFromStorage()
    const existing = drafts[id]
    
    if (!existing) {
      return null
    }

    if (existing.isLocked) {
      throw new Error('Cannot update locked draft')
    }

    const updated: Draft = {
      ...existing,
      ...updates,
      id, // Prevent ID change
      createdAt: existing.createdAt, // Prevent createdAt change
      updatedAt: new Date().toISOString(),
      wordCount: updates.content ? this.countWords(updates.content) : existing.wordCount
    }

    // Update completion percentage
    updated.completionPercentage = this.calculateCompletion(updated)

    drafts[id] = updated
    this.saveDraftsToStorage(drafts)

    return updated
  }

  /**
   * Delete a draft
   */
  async deleteDraft(id: string): Promise<boolean> {
    const drafts = this.getAllDraftsFromStorage()
    
    if (!drafts[id]) {
      return false
    }

    if (drafts[id].isLocked) {
      throw new Error('Cannot delete locked draft')
    }

    delete drafts[id]
    this.saveDraftsToStorage(drafts)

    // Clear current draft if it was deleted
    const currentId = this.getCurrentDraftId()
    if (currentId === id) {
      this.clearCurrentDraft()
    }

    return true
  }

  /**
   * List all drafts with optional filtering
   */
  async listDrafts(filters?: DraftFilters): Promise<DraftListItem[]> {
    const drafts = this.getAllDraftsFromStorage()
    let items = Object.values(drafts)

    // Apply filters
    if (filters?.status) {
      items = items.filter(d => d.status === filters.status)
    }
    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase()
      items = items.filter(d => 
        d.keyword.toLowerCase().includes(keyword) ||
        d.title.toLowerCase().includes(keyword)
      )
    }
    if (filters?.sourceFeature) {
      items = items.filter(d => d.sourceFeature === filters.sourceFeature)
    }

    // Sort
    const sortBy = filters?.sortBy || 'updatedAt'
    const sortOrder = filters?.sortOrder || 'desc'
    
    items.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'wordCount':
          comparison = a.wordCount - b.wordCount
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    // Map to list items
    return items.map(d => ({
      id: d.id,
      title: d.title,
      keyword: d.keyword,
      status: d.status,
      wordCount: d.wordCount,
      updatedAt: d.updatedAt,
      completionPercentage: d.completionPercentage
    }))
  }

  // ============================================
  // CURRENT DRAFT MANAGEMENT
  // ============================================

  /**
   * Set the current working draft
   */
  setCurrentDraft(id: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.CURRENT_DRAFT, id)
  }

  /**
   * Get the current working draft ID
   */
  getCurrentDraftId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.CURRENT_DRAFT)
  }

  /**
   * Get the current working draft
   */
  async getCurrentDraft(): Promise<Draft | null> {
    const id = this.getCurrentDraftId()
    if (!id) return null
    return this.getDraft(id)
  }

  /**
   * Clear the current draft reference
   */
  clearCurrentDraft(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DRAFT)
  }

  // ============================================
  // AUTO-SAVE
  // ============================================

  /**
   * Start auto-save for a draft
   */
  startAutoSave(
    draftId: string,
    getContent: () => { content: string; metaSettings?: MetaSettings }
  ): void {
    if (!this.autoSaveConfig.enabled) return

    this.stopAutoSave()

    this.autoSaveInterval = setInterval(async () => {
      try {
        const { content, metaSettings } = getContent()
        await this.autoSave(draftId, content, metaSettings)
      } catch (error) {
        console.warn('Auto-save failed:', error)
      }
    }, this.autoSaveConfig.intervalMs)
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  /**
   * Perform an auto-save
   */
  async autoSave(draftId: string, content: string, metaSettings?: MetaSettings): Promise<Draft | null> {
    return this.updateDraft(draftId, {
      content,
      metaSettings,
      lastAutoSaveAt: new Date().toISOString(),
      isAutoSave: true
    })
  }

  /**
   * Update auto-save configuration
   */
  updateAutoSaveConfig(config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_CONFIG, JSON.stringify(this.autoSaveConfig))
    }
  }

  /**
   * Get auto-save configuration
   */
  getAutoSaveConfig(): AutoSaveConfig {
    return { ...this.autoSaveConfig }
  }

  // ============================================
  // DRAFT STATUS MANAGEMENT
  // ============================================

  /**
   * Update draft status
   */
  async updateStatus(id: string, status: Draft['status']): Promise<Draft | null> {
    return this.updateDraft(id, { status })
  }

  /**
   * Lock a draft (prevent edits)
   */
  async lockDraft(id: string): Promise<Draft | null> {
    const drafts = this.getAllDraftsFromStorage()
    const draft = drafts[id]
    
    if (!draft) return null

    draft.isLocked = true
    draft.updatedAt = new Date().toISOString()
    
    drafts[id] = draft
    this.saveDraftsToStorage(drafts)
    
    return draft
  }

  /**
   * Unlock a draft
   */
  async unlockDraft(id: string): Promise<Draft | null> {
    const drafts = this.getAllDraftsFromStorage()
    const draft = drafts[id]
    
    if (!draft) return null

    draft.isLocked = false
    draft.updatedAt = new Date().toISOString()
    
    drafts[id] = draft
    this.saveDraftsToStorage(drafts)
    
    return draft
  }

  // ============================================
  // DUPLICATE & RESTORE
  // ============================================

  /**
   * Duplicate a draft
   */
  async duplicateDraft(id: string): Promise<Draft | null> {
    const original = await this.getDraft(id)
    if (!original) return null

    return this.createDraft({
      title: `${original.title} (Copy)`,
      content: original.content,
      keyword: original.keyword,
      secondaryKeywords: original.secondaryKeywords,
      sourceFeature: original.sourceFeature
    })
  }

  // ============================================
  // STORAGE HELPERS
  // ============================================

  private getAllDraftsFromStorage(): Record<string, Draft> {
    if (typeof window === 'undefined') return {}
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFTS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.warn('Failed to load drafts:', error)
      return {}
    }
  }

  private saveDraftsToStorage(drafts: Record<string, Draft>): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts))
    } catch (error) {
      console.warn('Failed to save drafts:', error)
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private countWords(content: string): number {
    if (!content) return 0
    
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, ' ')
    // Count words
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    return words.length
  }

  private calculateCompletion(draft: Draft): number {
    let score = 0
    const weights = {
      title: 10,
      content: 40,
      metaTitle: 15,
      metaDescription: 15,
      keyword: 10,
      minWordCount: 10
    }

    // Title
    if (draft.title && draft.title !== 'Untitled Draft') {
      score += weights.title
    }

    // Content (based on word count target of 1500)
    const contentScore = Math.min((draft.wordCount / 1500) * weights.content, weights.content)
    score += contentScore

    // Meta title
    if (draft.metaSettings.title && draft.metaSettings.isTitleValid) {
      score += weights.metaTitle
    }

    // Meta description
    if (draft.metaSettings.description && draft.metaSettings.isDescriptionValid) {
      score += weights.metaDescription
    }

    // Focus keyword
    if (draft.keyword) {
      score += weights.keyword
    }

    // Minimum word count (500+)
    if (draft.wordCount >= 500) {
      score += weights.minWordCount
    }

    return Math.round(score)
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): { totalDrafts: number; totalSize: number } {
    const drafts = this.getAllDraftsFromStorage()
    const data = localStorage.getItem(STORAGE_KEYS.DRAFTS) || ''
    
    return {
      totalDrafts: Object.keys(drafts).length,
      totalSize: new Blob([data]).size
    }
  }

  /**
   * Clear all drafts (dangerous!)
   */
  clearAllDrafts(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.DRAFTS)
    this.clearCurrentDraft()
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const draftService = new DraftService()

// Export class for testing
export { DraftService }
