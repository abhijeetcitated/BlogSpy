// ============================================
// useSchemaTemplates Hook  
// ============================================

import { useState, useCallback, useMemo } from "react"
import { SCHEMA_TEMPLATES } from "../constants"
import type { SchemaType } from "../types"

interface UseSchemaTemplatesReturn {
  showTemplates: boolean
  templates: typeof SCHEMA_TEMPLATES[SchemaType] | undefined
  toggleTemplates: () => void
  openTemplates: () => void
  closeTemplates: () => void
  getTemplate: (templateId: string) => Record<string, unknown> | undefined
}

/**
 * Hook for managing schema templates
 */
export function useSchemaTemplates(
  schemaType: SchemaType | null
): UseSchemaTemplatesReturn {
  const [showTemplates, setShowTemplates] = useState(false)

  const templates = useMemo(
    () => schemaType ? SCHEMA_TEMPLATES[schemaType] : undefined,
    [schemaType]
  )

  const toggleTemplates = useCallback(() => {
    setShowTemplates(prev => !prev)
  }, [])

  const openTemplates = useCallback(() => {
    setShowTemplates(true)
  }, [])

  const closeTemplates = useCallback(() => {
    setShowTemplates(false)
  }, [])

  const getTemplate = useCallback((templateId: string): Record<string, unknown> | undefined => {
    if (!schemaType) return undefined
    const template = SCHEMA_TEMPLATES[schemaType]?.find(t => t.id === templateId)
    return template?.data
  }, [schemaType])

  return {
    showTemplates,
    templates,
    toggleTemplates,
    openTemplates,
    closeTemplates,
    getTemplate,
  }
}
