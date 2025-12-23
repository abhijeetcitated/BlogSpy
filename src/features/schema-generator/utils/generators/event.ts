// Event Schema Generator

/**
 * Generate JSON-LD for Event schema
 */
export function generateEventSchema(data: Record<string, unknown>): object {
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
