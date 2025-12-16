// Schema Generator Types
// Generate structured data (JSON-LD) for better SEO and rich snippets

export type SchemaType = 
  | 'article'
  | 'faq'
  | 'howto'
  | 'product'
  | 'recipe'
  | 'review'
  | 'localbusiness'
  | 'event'
  | 'organization'
  | 'person'
  | 'course'
  | 'jobposting'
  | 'video'
  | 'breadcrumb'

export interface SchemaTypeConfig {
  id: SchemaType
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  popularity: number // 1-100
  fields: SchemaField[]
  previewImage?: string
}

export interface SchemaField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'url' | 'date' | 'number' | 'select' | 'array' | 'rating'
  placeholder?: string
  required: boolean
  description?: string
  options?: { value: string; label: string }[]
  arrayItemType?: 'text' | 'object'
  arrayItemFields?: SchemaField[]
  min?: number
  max?: number
  defaultValue?: string | number
}

// Article Schema
export interface ArticleSchema {
  headline: string
  description: string
  image: string
  author: string
  authorUrl?: string
  publisher: string
  publisherLogo: string
  datePublished: string
  dateModified?: string
  articleType: 'Article' | 'NewsArticle' | 'BlogPosting'
}

// FAQ Schema
export interface FAQItem {
  question: string
  answer: string
}

export interface FAQSchema {
  items: FAQItem[]
}

// HowTo Schema
export interface HowToStep {
  name: string
  text: string
  image?: string
}

export interface HowToSchema {
  name: string
  description: string
  image?: string
  totalTime?: string
  estimatedCost?: string
  supply?: string[]
  tool?: string[]
  steps: HowToStep[]
}

// Product Schema
export interface ProductSchema {
  name: string
  description: string
  image: string
  brand: string
  sku?: string
  price: number
  priceCurrency: string
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  ratingValue?: number
  reviewCount?: number
}

// Recipe Schema
export interface RecipeSchema {
  name: string
  description: string
  image: string
  author: string
  prepTime: string
  cookTime: string
  totalTime: string
  recipeYield: string
  recipeCategory: string
  recipeCuisine: string
  ingredients: string[]
  instructions: string[]
  nutrition?: {
    calories: string
  }
}

// Review Schema
export interface ReviewSchema {
  itemReviewed: string
  itemType: 'Product' | 'Movie' | 'Book' | 'Restaurant' | 'LocalBusiness'
  reviewRating: number
  bestRating: number
  worstRating: number
  author: string
  reviewBody: string
  datePublished: string
}

// Local Business Schema
export interface LocalBusinessSchema {
  name: string
  description: string
  image: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  telephone: string
  priceRange: string
  openingHours: string[]
  geo?: {
    latitude: number
    longitude: number
  }
}

// Event Schema
export interface EventSchema {
  name: string
  description: string
  startDate: string
  endDate?: string
  location: string
  image?: string
  performer?: string
  offers?: {
    price: number
    priceCurrency: string
    url: string
    availability: string
  }
}

// Video Schema
export interface VideoSchema {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration: string
  contentUrl?: string
  embedUrl?: string
}

// Breadcrumb Schema
export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbSchema {
  items: BreadcrumbItem[]
}

// Generic schema data type
export type SchemaData = 
  | ArticleSchema 
  | FAQSchema 
  | HowToSchema 
  | ProductSchema 
  | RecipeSchema 
  | ReviewSchema 
  | LocalBusinessSchema 
  | EventSchema 
  | VideoSchema 
  | BreadcrumbSchema

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}
