// ============================================
// RANK TRACKER - Operations Hook
// ============================================
// 
// Service layer integration hook for all CRUD operations.
// Handles API calls, loading states, and error handling.
// 
// Usage:
//   const ops = useRankTrackerOps({ showToast, setRefreshing, ... })
//   await ops.handleRefresh()
//   await ops.handleAddKeywords("keyword1\nkeyword2")
// ============================================

"use client"

import { useCallback } from "react"
import { rankTrackerService } from "../services"
import { TOAST_MESSAGES } from "../constants/thresholds"
import type { RankData, SearchPlatform, MultiPlatformKeyword } from "../types"

/**
 * Parameters required for the operations hook
 * @description Actions from useRankTrackerState hook for updating UI state
 */
interface UseRankTrackerOpsParams {
  /** Show a toast notification */
  showToast: (message: string) => void
  /** Set refreshing loading state */
  setRefreshing: (refreshing: boolean) => void
  /** Update last refreshed timestamp */
  setLastUpdated: (date: Date) => void
  /** Set adding keywords loading state */
  setAdding: (adding: boolean) => void
  /** Set deleting keyword loading state */
  setDeleting: (deleting: boolean) => void
  /** Set editing keyword loading state */
  setEditing: (editing: boolean) => void
  /** Close the add keywords modal */
  closeAddModal: () => void
  /** Set keyword to show delete confirmation */
  setDeleteConfirm: (keyword: RankData | null) => void
  /** Close bulk delete modal */
  closeBulkDelete: () => void
  /** Set keyword being edited */
  setEditingKeyword: (keyword: RankData | null) => void
  /** Clear all selected keywords */
  clearSelection: () => void
  /** Optional callback when data is updated */
  onDataUpdate?: (data: MultiPlatformKeyword[]) => void
}

/**
 * Hook for Rank Tracker CRUD operations using service layer
 * @description Handles all API operations with proper loading states and error handling.
 * Uses rankTrackerService for actual API calls.
 * 
 * @param params - State update callbacks from useRankTrackerState
 * @returns Object containing operation handlers
 * 
 * @example
 * ```tsx
 * const { state, actions } = useRankTrackerState()
 * const ops = useRankTrackerOps({
 *   showToast: actions.showToast,
 *   setRefreshing: actions.setRefreshing,
 *   // ... other actions
 * })
 * 
 * // Use operations
 * await ops.handleRefresh()
 * await ops.handleAddKeywords("seo keyword")
 * await ops.handleDeleteKeyword(keywordToDelete)
 * ```
 */
export function useRankTrackerOps({
  showToast,
  setRefreshing,
  setLastUpdated,
  setAdding,
  setDeleting,
  setEditing,
  closeAddModal,
  setDeleteConfirm,
  closeBulkDelete,
  setEditingKeyword,
  clearSelection,
  // onDataUpdate - reserved for future use
}: UseRankTrackerOpsParams) {
  /**
   * Refresh rankings data from API
   * @returns Promise that resolves when refresh is complete
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await rankTrackerService.refreshRankings()
      if (response.success) {
        setLastUpdated(new Date(response.updatedAt || Date.now()))
        showToast(TOAST_MESSAGES.REFRESH_SUCCESS)
      }
    } catch (error) {
      console.error("[useRankTrackerOps] Refresh failed:", error)
    } finally {
      setRefreshing(false)
    }
  }, [setRefreshing, setLastUpdated, showToast])

  /**
   * Add new keywords to track
   * @param keywordsText - Newline-separated list of keywords
   * @param platforms - Optional array of platforms to track on
   * @returns Promise<boolean> - true if successful
   */
  const handleAddKeywords = useCallback(async (
    keywordsText: string,
    platforms?: SearchPlatform[]
  ) => {
    const keywords = keywordsText
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    if (keywords.length === 0) {
      showToast(TOAST_MESSAGES.ENTER_KEYWORD)
      return false
    }

    setAdding(true)
    try {
      const response = await rankTrackerService.addKeywords({ 
        keywords, 
        platforms 
      })
      
      if (response.success) {
        closeAddModal()
        showToast(TOAST_MESSAGES.KEYWORDS_ADDED(response.added))
        // Trigger refresh to get updated data
        setTimeout(() => handleRefresh(), 500)
        return true
      } else {
        showToast(response.error || "Failed to add keywords")
        return false
      }
    } catch (error) {
      console.error("[useRankTrackerOps] Add keywords failed:", error)
      return false
    } finally {
      setAdding(false)
    }
  }, [setAdding, closeAddModal, showToast, handleRefresh])

  /**
   * Delete a single keyword
   */
  const handleDeleteKeyword = useCallback(async (keyword: RankData) => {
    setDeleting(true)
    try {
      const baseId = keyword.id.split("-")[0]
      const response = await rankTrackerService.deleteKeyword(baseId)
      
      if (response.success) {
        setDeleteConfirm(null)
        showToast(TOAST_MESSAGES.KEYWORD_DELETED(keyword.keyword))
        // Trigger data update if callback provided
        handleRefresh()
        return true
      } else {
        showToast(response.error || "Failed to delete keyword")
        return false
      }
    } catch (error) {
      console.error("[useRankTrackerOps] Delete failed:", error)
      return false
    } finally {
      setDeleting(false)
    }
  }, [setDeleting, setDeleteConfirm, showToast, handleRefresh])

  /**
   * Delete multiple keywords
   */
  const handleBulkDelete = useCallback(async (selectedKeywords: Set<string>) => {
    if (selectedKeywords.size === 0) return false

    setDeleting(true)
    try {
      const baseIds = Array.from(selectedKeywords).map(id => id.split("-")[0])
      const response = await rankTrackerService.deleteKeywords(baseIds)
      
      if (response.success) {
        clearSelection()
        closeBulkDelete()
        showToast(TOAST_MESSAGES.KEYWORDS_DELETED(response.deleted))
        handleRefresh()
        return true
      }
      return false
    } catch (error) {
      console.error("[useRankTrackerOps] Bulk delete failed:", error)
      return false
    } finally {
      setDeleting(false)
    }
  }, [setDeleting, clearSelection, closeBulkDelete, showToast, handleRefresh])

  /**
   * Update a keyword
   */
  const handleUpdateKeyword = useCallback(async (
    keywordId: string,
    newKeyword: string,
    newCountry: string
  ) => {
    if (!newKeyword.trim()) return false

    setEditing(true)
    try {
      const baseId = keywordId.split("-")[0]
      const response = await rankTrackerService.updateKeyword({
        keywordId: baseId,
        keyword: newKeyword.trim(),
        country: newCountry,
      })
      
      if (response.success) {
        setEditingKeyword(null)
        showToast(TOAST_MESSAGES.KEYWORD_UPDATED(newKeyword.trim()))
        handleRefresh()
        return true
      } else {
        showToast(response.error || "Failed to update keyword")
        return false
      }
    } catch (error) {
      console.error("[useRankTrackerOps] Update failed:", error)
      return false
    } finally {
      setEditing(false)
    }
  }, [setEditing, setEditingKeyword, showToast, handleRefresh])

  /**
   * Export keywords to CSV
   * @param data - Array of rank data to export
   * @param platformName - Platform name for filename
   */
  const handleExport = useCallback(async (
    data: RankData[],
    platformName: string
  ) => {
    if (data.length === 0) {
      showToast(TOAST_MESSAGES.SELECT_KEYWORDS)
      return
    }

    const result = await rankTrackerService.exportToCSV(data, platformName)
    if (result.success) {
      rankTrackerService.downloadCSV(result.content, result.filename)
      showToast(TOAST_MESSAGES.EXPORT_SUCCESS(data.length))
    }
  }, [showToast])

  /**
   * Export selected keywords to CSV
   * @param allData - Full array of rank data
   * @param selectedKeywords - Set of selected keyword IDs
   * @param platformName - Platform name for filename
   */
  const handleBulkExport = useCallback(async (
    allData: RankData[],
    selectedKeywords: Set<string>,
    platformName: string
  ) => {
    if (selectedKeywords.size === 0) {
      showToast(TOAST_MESSAGES.SELECT_KEYWORDS)
      return
    }

    const selectedData = allData.filter(k => selectedKeywords.has(k.id))
    handleExport(selectedData, platformName)
  }, [showToast, handleExport])

  return {
    handleRefresh,
    handleAddKeywords,
    handleDeleteKeyword,
    handleBulkDelete,
    handleUpdateKeyword,
    handleExport,
    handleBulkExport,
  }
}
