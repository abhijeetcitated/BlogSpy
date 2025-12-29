// Schema Validation Utilities

import type { SchemaType, ValidationResult, ValidationError, ValidationWarning } from "../../types"

/**
 * Validate URL format
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Validate schema data based on type
 */
export function validateSchema(type: SchemaType, data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Basic validation
  if (!data || Object.keys(data).length === 0) {
    errors.push({ field: "general", message: "No data provided" })
    return { isValid: false, errors, warnings }
  }

  // Type-specific validation
  switch (type) {
    case "article":
      validateArticle(data, errors, warnings)
      break
    case "faq":
      validateFAQ(data, errors, warnings)
      break
    case "howto":
      validateHowTo(data, errors, warnings)
      break
    case "product":
      validateProduct(data, errors, warnings)
      break
    case "review":
      validateReview(data, errors, warnings)
      break
    case "localbusiness":
      validateLocalBusiness(data, errors, warnings)
      break
    case "event":
      validateEvent(data, errors, warnings)
      break
    case "organization":
      validateOrganization(data, errors, warnings)
      break
    case "person":
      validatePerson(data, errors, warnings)
      break
    case "course":
      validateCourse(data, errors, warnings)
      break
    case "jobposting":
      validateJobPosting(data, errors, warnings)
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Individual validators
function validateArticle(
  data: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!data.headline) errors.push({ field: "headline", message: "Headline is required" })
  if (data.headline && (data.headline as string).length > 110) {
    warnings.push({ 
      field: "headline", 
      message: "Headline is too long",
      suggestion: "Keep headlines under 110 characters for best display"
    })
  }
  if (!data.description) errors.push({ field: "description", message: "Description is required" })
  if (!data.image) errors.push({ field: "image", message: "Image URL is required" })
  if (data.image && !isValidUrl(data.image as string)) {
    errors.push({ field: "image", message: "Invalid image URL format" })
  }
  if (!data.author) errors.push({ field: "author", message: "Author is required" })
  if (!data.publisher) errors.push({ field: "publisher", message: "Publisher is required" })
  if (!data.datePublished) errors.push({ field: "datePublished", message: "Publication date is required" })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateFAQ(
  data: Record<string, unknown>,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  if (!data.items || (data.items as Array<unknown>).length === 0) {
    errors.push({ field: "items", message: "At least one FAQ item is required" })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateHowTo(
  data: Record<string, unknown>,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Title is required" })
  if (!data.steps || (data.steps as Array<unknown>).length === 0) {
    errors.push({ field: "steps", message: "At least one step is required" })
  }
}

function validateProduct(
  data: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Product name is required" })
  if (!data.price) errors.push({ field: "price", message: "Price is required" })
  if (!data.brand) errors.push({ field: "brand", message: "Brand is required" })
  if (!data.ratingValue && !data.reviewCount) {
    warnings.push({
      field: "rating",
      message: "No rating provided",
      suggestion: "Adding ratings improves click-through rates"
    })
  }
}

function validateReview(
  data: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!data.itemReviewed) errors.push({ field: "itemReviewed", message: "Item name is required" })
  if (!data.reviewRating) errors.push({ field: "reviewRating", message: "Rating is required" })
  if (!data.reviewBody) errors.push({ field: "reviewBody", message: "Review text is required" })
  if (data.reviewBody && (data.reviewBody as string).length < 150) {
    warnings.push({
      field: "reviewBody",
      message: "Review is quite short",
      suggestion: "Longer reviews (150+ characters) are more valuable to readers"
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateLocalBusiness(
  data: Record<string, unknown>,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Business name is required" })
  if (!data.description) errors.push({ field: "description", message: "Description is required" })
  if (!data.streetAddress) errors.push({ field: "streetAddress", message: "Street address is required" })
  if (!data.addressLocality) errors.push({ field: "addressLocality", message: "City is required" })
  if (!data.telephone) errors.push({ field: "telephone", message: "Phone number is required" })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateEvent(
  data: Record<string, unknown>,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Event name is required" })
  if (!data.description) errors.push({ field: "description", message: "Description is required" })
  if (!data.startDate) errors.push({ field: "startDate", message: "Start date is required" })
  if (!data.locationName) errors.push({ field: "locationName", message: "Venue name is required" })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateOrganization(
  data: Record<string, unknown>,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Organization name is required" })
  if (!data.url) errors.push({ field: "url", message: "Website URL is required" })
  if (data.url && !isValidUrl(data.url as string)) {
    errors.push({ field: "url", message: "Invalid website URL format" })
  }
  if (!data.logo) errors.push({ field: "logo", message: "Logo URL is required" })
}

function validatePerson(
  data: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Name is required" })
  if (!data.description && !data.jobTitle) {
    warnings.push({
      field: "description",
      message: "No bio or job title",
      suggestion: "Adding a bio or job title improves rich snippets"
    })
  }
}

function validateCourse(
  data: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!data.name) errors.push({ field: "name", message: "Course name is required" })
  if (!data.description) errors.push({ field: "description", message: "Description is required" })
  if (!data.provider) errors.push({ field: "provider", message: "Provider is required" })
  if (!data.courseUrl) errors.push({ field: "courseUrl", message: "Course URL is required" })
  if (!data.ratingValue) {
    warnings.push({
      field: "rating",
      message: "No rating provided",
      suggestion: "Course ratings improve click-through rates in search"
    })
  }
}

function validateJobPosting(
  data: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!data.title) errors.push({ field: "title", message: "Job title is required" })
  if (!data.description) errors.push({ field: "description", message: "Job description is required" })
  if (!data.hiringOrganization) errors.push({ field: "hiringOrganization", message: "Company name is required" })
  if (!data.datePosted) errors.push({ field: "datePosted", message: "Date posted is required" })
  if (!data.jobLocationCity) errors.push({ field: "jobLocationCity", message: "Job location is required" })
  if (!data.salaryMin && !data.salaryMax) {
    warnings.push({
      field: "salary",
      message: "No salary provided",
      suggestion: "Jobs with salary info get 2x more applications"
    })
  }
}
