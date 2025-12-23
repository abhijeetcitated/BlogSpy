// Person Schema Generator

/**
 * Generate JSON-LD for Person schema
 */
export function generatePersonSchema(data: Record<string, unknown>): object {
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
