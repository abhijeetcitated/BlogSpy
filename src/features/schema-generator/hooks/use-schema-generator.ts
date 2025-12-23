// ============================================
// useSchemaGenerator Hook
// ============================================

import { useState, useCallback, useMemo } from "react"
import { generateSchema, validateSchema } from "../utils"
import { SCHEMA_TYPES, SCHEMA_TEMPLATES } from "../constants"
import type { SchemaType, SchemaData, ValidationResult } from "../types"

interface UseSchemaGeneratorOptions {
  initialType?: SchemaType
}

interface UseSchemaGeneratorReturn {
  // State
  selectedType: SchemaType | null
  formData: Record<string, unknown>
  generatedSchema: string
  validation: ValidationResult | null
  
  // Config
  selectedConfig: typeof SCHEMA_TYPES[number] | undefined
  templates: typeof SCHEMA_TEMPLATES[SchemaType] | undefined
  
  // Actions
  selectType: (type: SchemaType) => void
  updateFormData: (data: Record<string, unknown>) => void
  generate: () => boolean
  loadTemplate: (templateId: string) => void
  reset: () => void
  clear: () => void
}

/**
 * Hook for managing schema generation state and logic
 */
export function useSchemaGenerator(
  options: UseSchemaGeneratorOptions = {}
): UseSchemaGeneratorReturn {
  const { initialType = null } = options
  
  const [selectedType, setSelectedType] = useState<SchemaType | null>(initialType)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [generatedSchema, setGeneratedSchema] = useState<string>("")
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const selectedConfig = useMemo(
    () => SCHEMA_TYPES.find(t => t.id === selectedType),
    [selectedType]
  )

  const templates = useMemo(
    () => selectedType ? SCHEMA_TEMPLATES[selectedType] : undefined,
    [selectedType]
  )

  const selectType = useCallback((type: SchemaType) => {
    setSelectedType(type)
    setFormData({})
    setGeneratedSchema("")
    setValidation(null)
  }, [])

  const updateFormData = useCallback((data: Record<string, unknown>) => {
    setFormData(data)
  }, [])

  const generate = useCallback((): boolean => {
    if (!selectedType) return false
    
    const result = validateSchema(selectedType, formData)
    setValidation(result)
    
    if (result.isValid) {
      const schema = generateSchema(selectedType, formData as unknown as SchemaData)
      setGeneratedSchema(schema)
      return true
    }
    
    return false
  }, [selectedType, formData])

  const loadTemplate = useCallback((templateId: string) => {
    if (!selectedType) return
    const template = SCHEMA_TEMPLATES[selectedType]?.find(t => t.id === templateId)
    if (template) {
      setFormData(template.data)
    }
  }, [selectedType])

  const reset = useCallback(() => {
    setSelectedType(null)
    setFormData({})
    setGeneratedSchema("")
    setValidation(null)
  }, [])

  const clear = useCallback(() => {
    setFormData({})
    setGeneratedSchema("")
    setValidation(null)
  }, [])

  return {
    selectedType,
    formData,
    generatedSchema,
    validation,
    selectedConfig,
    templates,
    selectType,
    updateFormData,
    generate,
    loadTemplate,
    reset,
    clear,
  }
}
