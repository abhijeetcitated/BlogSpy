// ============================================
// Schema Generator - Zod Validation Schemas
// ============================================

import { z } from "zod"

// URL validation helper
const urlSchema = z.string().url("Invalid URL format")

// Common schemas
export const authorSchema = z.string().min(1, "Author name is required")
export const descriptionSchema = z.string().min(10, "Description must be at least 10 characters")
export const imageUrlSchema = urlSchema.optional()
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")

// Article Schema
export const articleSchemaValidator = z.object({
  headline: z.string().min(1, "Headline is required").max(110, "Headline must be 110 characters or less"),
  description: descriptionSchema,
  image: urlSchema,
  author: authorSchema,
  authorUrl: urlSchema.optional(),
  publisher: z.string().min(1, "Publisher is required"),
  publisherLogo: urlSchema,
  datePublished: dateSchema,
  dateModified: dateSchema.optional(),
  articleType: z.enum(["Article", "NewsArticle", "BlogPosting"]).default("Article"),
})

// FAQ Schema
export const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
})

export const faqSchemaValidator = z.object({
  items: z.array(faqItemSchema).min(1, "At least one FAQ item is required"),
})

// HowTo Schema
export const howToStepSchema = z.object({
  name: z.string().min(1, "Step name is required"),
  text: z.string().min(1, "Step description is required"),
  image: urlSchema.optional(),
})

export const howToSchemaValidator = z.object({
  name: z.string().min(1, "Title is required"),
  description: descriptionSchema,
  image: urlSchema.optional(),
  totalTime: z.string().optional(),
  estimatedCost: z.string().optional(),
  supply: z.array(z.string()).optional(),
  tool: z.array(z.string()).optional(),
  steps: z.array(howToStepSchema).min(1, "At least one step is required"),
})

// Product Schema
export const productSchemaValidator = z.object({
  name: z.string().min(1, "Product name is required"),
  description: descriptionSchema,
  image: urlSchema,
  brand: z.string().min(1, "Brand is required"),
  sku: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  priceCurrency: z.string().length(3, "Currency must be 3 characters (e.g., USD)"),
  availability: z.enum(["InStock", "OutOfStock", "PreOrder"]),
  ratingValue: z.number().min(1).max(5).optional(),
  reviewCount: z.number().int().positive().optional(),
})

// Recipe Schema
export const recipeSchemaValidator = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: descriptionSchema,
  image: urlSchema,
  author: authorSchema,
  prepTime: z.string().min(1, "Prep time is required"),
  cookTime: z.string().min(1, "Cook time is required"),
  totalTime: z.string().min(1, "Total time is required"),
  recipeYield: z.string().min(1, "Recipe yield is required"),
  recipeCategory: z.string().min(1, "Category is required"),
  recipeCuisine: z.string().min(1, "Cuisine is required"),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  nutrition: z.object({
    calories: z.string(),
  }).optional(),
})

// Review Schema
export const reviewSchemaValidator = z.object({
  itemReviewed: z.string().min(1, "Item name is required"),
  itemType: z.enum(["Product", "Movie", "Book", "Restaurant", "LocalBusiness"]),
  reviewRating: z.number().min(1).max(5, "Rating must be between 1-5"),
  bestRating: z.number().default(5),
  worstRating: z.number().default(1),
  author: authorSchema,
  reviewBody: z.string().min(50, "Review must be at least 50 characters"),
  datePublished: dateSchema,
})

// Video Schema
export const videoSchemaValidator = z.object({
  name: z.string().min(1, "Video name is required"),
  description: descriptionSchema,
  thumbnailUrl: urlSchema,
  uploadDate: dateSchema,
  duration: z.string().min(1, "Duration is required (ISO 8601 format)"),
  contentUrl: urlSchema.optional(),
  embedUrl: urlSchema.optional(),
})

// Local Business Schema
export const localBusinessSchemaValidator = z.object({
  name: z.string().min(1, "Business name is required"),
  description: descriptionSchema,
  image: urlSchema,
  streetAddress: z.string().min(1, "Street address is required"),
  addressLocality: z.string().min(1, "City is required"),
  addressRegion: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  addressCountry: z.string().min(1, "Country is required"),
  telephone: z.string().min(1, "Phone number is required"),
  priceRange: z.string().optional(),
  openingHours: z.array(z.string()).optional(),
})

// Event Schema
export const eventSchemaValidator = z.object({
  name: z.string().min(1, "Event name is required"),
  description: descriptionSchema,
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  locationName: z.string().min(1, "Venue name is required"),
  locationAddress: z.string().optional(),
  image: urlSchema.optional(),
  performer: z.string().optional(),
  offerPrice: z.number().optional(),
  offerCurrency: z.string().optional(),
  offerUrl: urlSchema.optional(),
})

// Organization Schema
export const organizationSchemaValidator = z.object({
  name: z.string().min(1, "Organization name is required"),
  url: urlSchema,
  logo: urlSchema,
  description: descriptionSchema.optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  streetAddress: z.string().optional(),
  addressLocality: z.string().optional(),
  addressRegion: z.string().optional(),
  postalCode: z.string().optional(),
  addressCountry: z.string().optional(),
  foundingDate: dateSchema.optional(),
  sameAs: z.array(urlSchema).optional(),
})

// Person Schema
export const personSchemaValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: urlSchema.optional(),
  url: urlSchema.optional(),
  email: z.string().email().optional(),
  jobTitle: z.string().optional(),
  worksFor: z.string().optional(),
  alumniOf: z.string().optional(),
  sameAs: z.array(urlSchema).optional(),
})

// Course Schema
export const courseSchemaValidator = z.object({
  name: z.string().min(1, "Course name is required"),
  description: descriptionSchema,
  provider: z.string().min(1, "Provider is required"),
  providerUrl: urlSchema.optional(),
  courseUrl: urlSchema,
  instructor: z.string().optional(),
  image: urlSchema.optional(),
  language: z.string().optional(),
  duration: z.string().optional(),
  price: z.number().optional(),
  priceCurrency: z.string().optional(),
  ratingValue: z.number().min(1).max(5).optional(),
  reviewCount: z.number().int().positive().optional(),
})

// Job Posting Schema
export const jobPostingSchemaValidator = z.object({
  title: z.string().min(1, "Job title is required"),
  description: descriptionSchema,
  hiringOrganization: z.string().min(1, "Company name is required"),
  companyLogo: urlSchema.optional(),
  companyUrl: urlSchema.optional(),
  datePosted: dateSchema,
  validThrough: dateSchema.optional(),
  jobLocationCity: z.string().min(1, "City is required"),
  jobLocationRegion: z.string().optional(),
  jobLocationCountry: z.string().min(1, "Country is required"),
  workLocationType: z.enum(["TELECOMMUTE", "ONSITE", "HYBRID"]).optional(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "TEMPORARY",
    "INTERN",
  ]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryUnit: z.enum(["HOUR", "WEEK", "MONTH", "YEAR"]).optional(),
  salaryCurrency: z.string().optional(),
})

// Breadcrumb Schema
export const breadcrumbItemSchema = z.object({
  name: z.string().min(1, "Breadcrumb name is required"),
  url: urlSchema,
})

export const breadcrumbSchemaValidator = z.object({
  items: z.array(breadcrumbItemSchema).min(1, "At least one breadcrumb item is required"),
})

// Schema type to validator mapping
export const schemaValidators = {
  article: articleSchemaValidator,
  faq: faqSchemaValidator,
  howto: howToSchemaValidator,
  product: productSchemaValidator,
  recipe: recipeSchemaValidator,
  review: reviewSchemaValidator,
  video: videoSchemaValidator,
  breadcrumb: breadcrumbSchemaValidator,
  localbusiness: localBusinessSchemaValidator,
  event: eventSchemaValidator,
  organization: organizationSchemaValidator,
  person: personSchemaValidator,
  course: courseSchemaValidator,
  jobposting: jobPostingSchemaValidator,
} as const

// Type exports
export type ArticleSchemaInput = z.infer<typeof articleSchemaValidator>
export type FAQSchemaInput = z.infer<typeof faqSchemaValidator>
export type HowToSchemaInput = z.infer<typeof howToSchemaValidator>
export type ProductSchemaInput = z.infer<typeof productSchemaValidator>
export type RecipeSchemaInput = z.infer<typeof recipeSchemaValidator>
export type ReviewSchemaInput = z.infer<typeof reviewSchemaValidator>
export type VideoSchemaInput = z.infer<typeof videoSchemaValidator>
export type BreadcrumbSchemaInput = z.infer<typeof breadcrumbSchemaValidator>
export type LocalBusinessSchemaInput = z.infer<typeof localBusinessSchemaValidator>
export type EventSchemaInput = z.infer<typeof eventSchemaValidator>
export type OrganizationSchemaInput = z.infer<typeof organizationSchemaValidator>
export type PersonSchemaInput = z.infer<typeof personSchemaValidator>
export type CourseSchemaInput = z.infer<typeof courseSchemaValidator>
export type JobPostingSchemaInput = z.infer<typeof jobPostingSchemaValidator>
