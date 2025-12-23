// ============================================
// useSchemaClipboard Hook
// ============================================

import { useState, useCallback, useRef, useEffect } from "react"
import { copyToClipboard, generateScriptTag } from "../utils"

interface UseSchemaClipboardReturn {
  copied: boolean
  copiedHtml: boolean
  copyJson: (jsonLd: string) => Promise<boolean>
  copyHtml: (jsonLd: string) => Promise<boolean>
}

/**
 * Hook for managing clipboard operations with proper cleanup
 */
export function useSchemaClipboard(timeout = 2000): UseSchemaClipboardReturn {
  const [copied, setCopied] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)
  
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const copyHtmlTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      if (copyHtmlTimerRef.current) clearTimeout(copyHtmlTimerRef.current)
    }
  }, [])

  const copyJson = useCallback(async (jsonLd: string): Promise<boolean> => {
    if (!jsonLd) return false
    
    const success = await copyToClipboard(jsonLd)
    if (success) {
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), timeout)
    }
    return success
  }, [timeout])

  const copyHtml = useCallback(async (jsonLd: string): Promise<boolean> => {
    if (!jsonLd) return false
    
    const htmlCode = generateScriptTag(jsonLd)
    const success = await copyToClipboard(htmlCode)
    if (success) {
      setCopiedHtml(true)
      if (copyHtmlTimerRef.current) clearTimeout(copyHtmlTimerRef.current)
      copyHtmlTimerRef.current = setTimeout(() => setCopiedHtml(false), timeout)
    }
    return success
  }, [timeout])

  return {
    copied,
    copiedHtml,
    copyJson,
    copyHtml,
  }
}
