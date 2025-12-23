// Schema Generator - Main Schema Generation Function

import type { 
  SchemaType, 
  SchemaData,
  ArticleSchema,
  FAQSchema,
  HowToSchema,
  ProductSchema,
  RecipeSchema,
  ReviewSchema,
  VideoSchema,
  BreadcrumbSchema
} from "../types"

import {
  generateArticleSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateProductSchema,
  generateRecipeSchema,
  generateReviewSchema,
  generateVideoSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateEventSchema,
  generateOrganizationSchema,
  generatePersonSchema,
  generateCourseSchema,
  generateJobPostingSchema
} from "./generators"

/**
 * Generate JSON-LD schema based on type
 */
export function generateSchema(type: SchemaType, data: SchemaData): string {
  let schemaObject: object

  switch (type) {
    case "article":
      schemaObject = generateArticleSchema(data as ArticleSchema)
      break
    case "faq":
      schemaObject = generateFAQSchema(data as FAQSchema)
      break
    case "howto":
      schemaObject = generateHowToSchema(data as HowToSchema)
      break
    case "product":
      schemaObject = generateProductSchema(data as ProductSchema)
      break
    case "recipe":
      schemaObject = generateRecipeSchema(data as RecipeSchema)
      break
    case "review":
      schemaObject = generateReviewSchema(data as ReviewSchema)
      break
    case "video":
      schemaObject = generateVideoSchema(data as VideoSchema)
      break
    case "breadcrumb":
      schemaObject = generateBreadcrumbSchema(data as BreadcrumbSchema)
      break
    case "localbusiness":
      schemaObject = generateLocalBusinessSchema(data as unknown as Record<string, unknown>)
      break
    case "event":
      schemaObject = generateEventSchema(data as unknown as Record<string, unknown>)
      break
    case "organization":
      schemaObject = generateOrganizationSchema(data as unknown as Record<string, unknown>)
      break
    case "person":
      schemaObject = generatePersonSchema(data as unknown as Record<string, unknown>)
      break
    case "course":
      schemaObject = generateCourseSchema(data as unknown as Record<string, unknown>)
      break
    case "jobposting":
      schemaObject = generateJobPostingSchema(data as unknown as Record<string, unknown>)
      break
    default:
      schemaObject = {}
  }

  return JSON.stringify(schemaObject, null, 2)
}
