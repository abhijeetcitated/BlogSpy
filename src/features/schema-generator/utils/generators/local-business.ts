// LocalBusiness Schema Generator

/**
 * Generate JSON-LD for LocalBusiness schema
 */
export function generateLocalBusinessSchema(data: Record<string, unknown>): object {
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

  if (data.geo) {
    schema["geo"] = {
      "@type": "GeoCoordinates",
      "latitude": (data.geo as { latitude: number }).latitude,
      "longitude": (data.geo as { longitude: number }).longitude
    }
  }

  return schema
}
