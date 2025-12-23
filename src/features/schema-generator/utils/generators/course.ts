// Course Schema Generator

/**
 * Generate JSON-LD for Course schema
 */
export function generateCourseSchema(data: Record<string, unknown>): object {
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
