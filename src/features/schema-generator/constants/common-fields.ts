// Common Schema Fields - Reusable field definitions

import type { SchemaField } from "../types"

export const authorField: SchemaField = {
  id: "author",
  name: "Author Name",
  type: "text",
  placeholder: "John Doe",
  required: true,
  description: "The author of the content"
}

export const descriptionField: SchemaField = {
  id: "description",
  name: "Description",
  type: "textarea",
  placeholder: "A brief description...",
  required: true,
  description: "A short description (150-300 characters recommended)"
}

export const imageField: SchemaField = {
  id: "image",
  name: "Image URL",
  type: "url",
  placeholder: "https://example.com/image.jpg",
  required: true,
  description: "Main image URL (recommended: 1200x630px)"
}

// Currency options used across multiple schemas
export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" }
]

// Price range options
export const PRICE_RANGE_OPTIONS = [
  { value: "$", label: "$ - Budget" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Expensive" },
  { value: "$$$$", label: "$$$$ - Luxury" }
]
