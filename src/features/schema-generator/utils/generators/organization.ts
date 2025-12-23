// Organization Schema Generator

/**
 * Generate JSON-LD for Organization schema
 */
export function generateOrganizationSchema(data: Record<string, unknown>): object {
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
