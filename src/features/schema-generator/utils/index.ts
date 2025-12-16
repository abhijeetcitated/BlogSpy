// Schema Generator Utilities

import { 
  SchemaType, 
  SchemaData, 
  ValidationResult,
  ArticleSchema,
  FAQSchema,
  HowToSchema,
  ProductSchema,
  RecipeSchema,
  ReviewSchema,
  VideoSchema,
  BreadcrumbSchema
} from "../types"

// Generate JSON-LD for Article schema
function generateArticleSchema(data: ArticleSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": data.articleType || "Article",
    "headline": data.headline,
    "description": data.description,
    "image": data.image,
    "author": {
      "@type": "Person",
      "name": data.author,
      ...(data.authorUrl && { "url": data.authorUrl })
    },
    "publisher": {
      "@type": "Organization",
      "name": data.publisher,
      "logo": {
        "@type": "ImageObject",
        "url": data.publisherLogo
      }
    },
    "datePublished": data.datePublished,
    ...(data.dateModified && { "dateModified": data.dateModified })
  }
}

// Generate JSON-LD for FAQ schema
function generateFAQSchema(data: FAQSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }
}

// Generate JSON-LD for HowTo schema
function generateHowToSchema(data: HowToSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    ...(data.image && { "image": data.image }),
    ...(data.totalTime && { "totalTime": data.totalTime }),
    ...(data.estimatedCost && { 
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "value": data.estimatedCost
      }
    }),
    ...(data.supply && data.supply.length > 0 && {
      "supply": data.supply.map(s => ({ "@type": "HowToSupply", "name": s }))
    }),
    ...(data.tool && data.tool.length > 0 && {
      "tool": data.tool.map(t => ({ "@type": "HowToTool", "name": t }))
    }),
    "step": data.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image })
    }))
  }
}

// Generate JSON-LD for Product schema
function generateProductSchema(data: ProductSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "brand": {
      "@type": "Brand",
      "name": data.brand
    },
    ...(data.sku && { "sku": data.sku }),
    "offers": {
      "@type": "Offer",
      "price": data.price,
      "priceCurrency": data.priceCurrency,
      "availability": `https://schema.org/${data.availability}`
    },
    ...(data.ratingValue && data.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": data.ratingValue,
        "bestRating": 5,
        "reviewCount": data.reviewCount
      }
    })
  }
}

// Generate JSON-LD for Recipe schema
function generateRecipeSchema(data: RecipeSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "author": {
      "@type": "Person",
      "name": data.author
    },
    "prepTime": data.prepTime,
    "cookTime": data.cookTime,
    "totalTime": data.totalTime,
    "recipeYield": data.recipeYield,
    "recipeCategory": data.recipeCategory,
    "recipeCuisine": data.recipeCuisine,
    "recipeIngredient": data.ingredients,
    "recipeInstructions": data.instructions.map((instruction, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": instruction
    })),
    ...(data.nutrition && {
      "nutrition": {
        "@type": "NutritionInformation",
        "calories": data.nutrition.calories
      }
    })
  }
}

// Generate JSON-LD for Review schema
function generateReviewSchema(data: ReviewSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": data.itemType,
      "name": data.itemReviewed
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": data.reviewRating,
      "bestRating": data.bestRating || 5,
      "worstRating": data.worstRating || 1
    },
    "author": {
      "@type": "Person",
      "name": data.author
    },
    "reviewBody": data.reviewBody,
    "datePublished": data.datePublished
  }
}

// Generate JSON-LD for Video schema
function generateVideoSchema(data: VideoSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": data.name,
    "description": data.description,
    "thumbnailUrl": data.thumbnailUrl,
    "uploadDate": data.uploadDate,
    "duration": data.duration,
    ...(data.contentUrl && { "contentUrl": data.contentUrl }),
    ...(data.embedUrl && { "embedUrl": data.embedUrl })
  }
}

// Generate JSON-LD for Breadcrumb schema
function generateBreadcrumbSchema(data: BreadcrumbSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": data.items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

// Generate JSON-LD for LocalBusiness schema
function generateLocalBusinessSchema(data: Record<string, unknown>): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.streetAddress,
      "addressLocality": data.addressLocality,
      "addressRegion": data.addressRegion,
      "postalCode": data.postalCode,
      "addressCountry": data.addressCountry
    },
    "telephone": data.telephone,
    "priceRange": data.priceRange,
  }
  if (data.openingHours) {
    schema["openingHours"] = data.openingHours
  }
  return schema
}

// Generate JSON-LD for Event schema
function generateEventSchema(data: Record<string, unknown>): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": data.name,
    "description": data.description,
    "startDate": data.startDate,
    "eventStatus": `https://schema.org/${data.eventStatus || 'EventScheduled'}`,
    "eventAttendanceMode": `https://schema.org/${data.eventAttendanceMode || 'OfflineEventAttendanceMode'}`,
    "location": {
      "@type": "Place",
      "name": data.locationName,
      "address": data.locationAddress
    }
  }

  if (data.image) schema.image = data.image
  if (data.endDate) schema.endDate = data.endDate
  if (data.performer) {
    schema.performer = {
      "@type": "Person",
      "name": data.performer
    }
  }
  if (data.offerPrice) {
    const offers: Record<string, unknown> = {
      "@type": "Offer",
      "price": data.offerPrice,
      "priceCurrency": data.offerCurrency || "USD",
    }
    if (data.offerUrl) offers["url"] = data.offerUrl
    schema.offers = offers
  }

  return schema
}

// Generate JSON-LD for Organization schema
function generateOrganizationSchema(data: Record<string, unknown>): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.name,
    "url": data.url,
    "logo": data.logo,
    "description": data.description
  }

  if (data.email || data.telephone) {
    const contactPoint: Record<string, unknown> = { "@type": "ContactPoint" }
    if (data.email) contactPoint["email"] = data.email
    if (data.telephone) contactPoint["telephone"] = data.telephone
    schema.contactPoint = contactPoint
  }

  if (data.streetAddress) {
    const address: Record<string, unknown> = {
      "@type": "PostalAddress",
      "streetAddress": data.streetAddress,
    }
    if (data.addressLocality) address["addressLocality"] = data.addressLocality
    if (data.addressRegion) address["addressRegion"] = data.addressRegion
    if (data.postalCode) address["postalCode"] = data.postalCode
    if (data.addressCountry) address["addressCountry"] = data.addressCountry
    schema.address = address
  }

  if (data.foundingDate) schema.foundingDate = data.foundingDate
  if (data.sameAs && Array.isArray(data.sameAs) && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs
  }

  return schema
}

// Generate JSON-LD for Person schema
function generatePersonSchema(data: Record<string, unknown>): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": data.name
  }

  if (data.description) schema.description = data.description
  if (data.image) schema.image = data.image
  if (data.url) schema.url = data.url
  if (data.email) schema.email = data.email
  if (data.jobTitle) schema.jobTitle = data.jobTitle
  if (data.worksFor) {
    schema.worksFor = {
      "@type": "Organization",
      "name": data.worksFor
    }
  }
  if (data.alumniOf) {
    schema.alumniOf = {
      "@type": "Organization",
      "name": data.alumniOf
    }
  }
  if (data.sameAs && Array.isArray(data.sameAs) && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs
  }

  return schema
}

// Generate JSON-LD for Course schema
function generateCourseSchema(data: Record<string, unknown>): object {
  const provider: Record<string, unknown> = {
    "@type": "Organization",
    "name": data.provider,
  }
  if (data.providerUrl) provider["url"] = data.providerUrl
  
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": data.name,
    "description": data.description,
    "provider": provider,
    "url": data.courseUrl
  }

  if (data.instructor) {
    schema.instructor = {
      "@type": "Person",
      "name": data.instructor
    }
  }
  if (data.image) schema.image = data.image
  if (data.language) schema.inLanguage = data.language
  if (data.duration) schema.timeRequired = data.duration

  if (data.price) {
    schema.offers = {
      "@type": "Offer",
      "price": data.price,
      "priceCurrency": data.priceCurrency || "USD"
    }
  }

  if (data.ratingValue && data.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": data.ratingValue,
      "bestRating": 5,
      "reviewCount": data.reviewCount
    }
  }

  return schema
}

// Generate JSON-LD for JobPosting schema
function generateJobPostingSchema(data: Record<string, unknown>): object {
  const hiringOrganization: Record<string, unknown> = {
    "@type": "Organization",
    "name": data.hiringOrganization,
  }
  if (data.companyLogo) hiringOrganization["logo"] = data.companyLogo
  if (data.companyUrl) hiringOrganization["sameAs"] = data.companyUrl
  
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": data.title,
    "description": data.description,
    "datePosted": data.datePosted,
    "hiringOrganization": hiringOrganization,
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": data.jobLocationCity,
        "addressRegion": data.jobLocationRegion,
        "addressCountry": data.jobLocationCountry
      }
    },
    "employmentType": data.employmentType
  }

  if (data.validThrough) schema.validThrough = data.validThrough
  if (data.workLocationType === "TELECOMMUTE") {
    schema.jobLocationType = "TELECOMMUTE"
  }

  if (data.salaryMin || data.salaryMax) {
    const salaryValue: Record<string, unknown> = {
      "@type": "QuantitativeValue",
      "unitText": data.salaryUnit || "YEAR"
    }
    if (data.salaryMin) salaryValue["minValue"] = data.salaryMin
    if (data.salaryMax) salaryValue["maxValue"] = data.salaryMax
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": data.salaryCurrency || "USD",
      "value": salaryValue
    }
  }

  return schema
}

// Main function to generate schema
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

// Generate HTML script tag
export function generateScriptTag(jsonLd: string): string {
  return `<script type="application/ld+json">
${jsonLd}
</script>`
}

// Validate schema data
export function validateSchema(type: SchemaType, data: Record<string, unknown>): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []

  // Basic validation
  if (!data || Object.keys(data).length === 0) {
    errors.push({ field: "general", message: "No data provided" })
    return { isValid: false, errors, warnings }
  }

  // Type-specific validation
  switch (type) {
    case "article":
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
      if (!data.author) errors.push({ field: "author", message: "Author is required" })
      if (!data.publisher) errors.push({ field: "publisher", message: "Publisher is required" })
      if (!data.datePublished) errors.push({ field: "datePublished", message: "Publication date is required" })
      break

    case "faq":
      if (!data.items || (data.items as Array<unknown>).length === 0) {
        errors.push({ field: "items", message: "At least one FAQ item is required" })
      }
      break

    case "howto":
      if (!data.name) errors.push({ field: "name", message: "Title is required" })
      if (!data.steps || (data.steps as Array<unknown>).length === 0) {
        errors.push({ field: "steps", message: "At least one step is required" })
      }
      break

    case "product":
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
      break

    case "review":
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
      break

    case "localbusiness":
      if (!data.name) errors.push({ field: "name", message: "Business name is required" })
      if (!data.description) errors.push({ field: "description", message: "Description is required" })
      if (!data.streetAddress) errors.push({ field: "streetAddress", message: "Street address is required" })
      if (!data.addressLocality) errors.push({ field: "addressLocality", message: "City is required" })
      if (!data.telephone) errors.push({ field: "telephone", message: "Phone number is required" })
      break

    case "event":
      if (!data.name) errors.push({ field: "name", message: "Event name is required" })
      if (!data.description) errors.push({ field: "description", message: "Description is required" })
      if (!data.startDate) errors.push({ field: "startDate", message: "Start date is required" })
      if (!data.locationName) errors.push({ field: "locationName", message: "Venue name is required" })
      break

    case "organization":
      if (!data.name) errors.push({ field: "name", message: "Organization name is required" })
      if (!data.url) errors.push({ field: "url", message: "Website URL is required" })
      if (!data.logo) errors.push({ field: "logo", message: "Logo URL is required" })
      break

    case "person":
      if (!data.name) errors.push({ field: "name", message: "Name is required" })
      if (!data.description && !data.jobTitle) {
        warnings.push({
          field: "description",
          message: "No bio or job title",
          suggestion: "Adding a bio or job title improves rich snippets"
        })
      }
      break

    case "course":
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
      break

    case "jobposting":
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
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Download as file
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Format ISO duration to readable
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return isoDuration
  
  const hours = match[1] ? `${match[1]}h ` : ''
  const minutes = match[2] ? `${match[2]}m ` : ''
  const seconds = match[3] ? `${match[3]}s` : ''
  
  return `${hours}${minutes}${seconds}`.trim() || isoDuration
}

// Get schema type config by ID
export function getSchemaTypeById(id: SchemaType) {
  const { SCHEMA_TYPES } = require('../constants')
  return SCHEMA_TYPES.find((s: { id: SchemaType }) => s.id === id)
}
