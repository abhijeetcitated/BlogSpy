// ============================================
// SCHEMA GENERATOR - Service Layer
// ============================================

import { apiClient } from "@/services/api-client"
import type { SchemaType, SchemaData } from "../types"

// API Endpoints
const ENDPOINTS = {
  SCHEMAS: "/api/schema-generator/schemas",
  HISTORY: "/api/schema-generator/history",
  EXPORT: "/api/schema-generator/export",
} as const

// Types
export interface SavedSchema {
  id: string
  userId: string
  name: string
  type: SchemaType
  data: SchemaData
  jsonLd: string
  createdAt: string
  updatedAt: string
}

export interface SaveSchemaRequest {
  name: string
  type: SchemaType
  data: SchemaData
  jsonLd: string
}

export interface SaveSchemaResponse {
  success: boolean
  data?: SavedSchema
  error?: string
}

export interface SchemaHistoryResponse {
  success: boolean
  data?: SavedSchema[]
  error?: string
}

/**
 * Schema Generator Service
 * Handles all API calls for schema operations
 */
class SchemaService {
  /**
   * Save a schema to user's history
   */
  async saveSchema(request: SaveSchemaRequest): Promise<SaveSchemaResponse> {
    try {
      const response = await apiClient.post<SavedSchema>(
        ENDPOINTS.SCHEMAS,
        request
      )
      return { success: true, data: response.data }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save schema"
      return { success: false, error: message }
    }
  }

  /**
   * Get user's saved schemas
   */
  async getSavedSchemas(type?: SchemaType): Promise<SchemaHistoryResponse> {
    try {
      const params = type ? `?type=${type}` : ""
      const response = await apiClient.get<SavedSchema[]>(
        `${ENDPOINTS.SCHEMAS}${params}`
      )
      return { success: true, data: response.data }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch schemas"
      return { success: false, error: message }
    }
  }

  /**
   * Get a single saved schema by ID
   */
  async getSchemaById(id: string): Promise<SaveSchemaResponse> {
    try {
      const response = await apiClient.get<SavedSchema>(
        `${ENDPOINTS.SCHEMAS}/${id}`
      )
      return { success: true, data: response.data }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch schema"
      return { success: false, error: message }
    }
  }

  /**
   * Update an existing schema
   */
  async updateSchema(
    id: string, 
    request: Partial<SaveSchemaRequest>
  ): Promise<SaveSchemaResponse> {
    try {
      const response = await apiClient.patch<SavedSchema>(
        `${ENDPOINTS.SCHEMAS}/${id}`,
        request
      )
      return { success: true, data: response.data }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update schema"
      return { success: false, error: message }
    }
  }

  /**
   * Delete a saved schema
   */
  async deleteSchema(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.delete(`${ENDPOINTS.SCHEMAS}/${id}`)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete schema"
      return { success: false, error: message }
    }
  }

  /**
   * Get recent schema history
   */
  async getHistory(limit = 10): Promise<SchemaHistoryResponse> {
    try {
      const response = await apiClient.get<SavedSchema[]>(
        `${ENDPOINTS.HISTORY}?limit=${limit}`
      )
      return { success: true, data: response.data }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch history"
      return { success: false, error: message }
    }
  }

  /**
   * Clear schema history
   */
  async clearHistory(): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.delete(ENDPOINTS.HISTORY)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to clear history"
      return { success: false, error: message }
    }
  }

  /**
   * Export schema as different formats
   */
  exportAsJson(jsonLd: string, schemaType: string): void {
    const blob = new Blob([jsonLd], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${schemaType}-schema-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Export as HTML script tag
   */
  exportAsHtml(jsonLd: string, schemaType: string): void {
    const htmlContent = `<script type="application/ld+json">
${jsonLd}
</script>`
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${schemaType}-schema-${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const schemaService = new SchemaService()
