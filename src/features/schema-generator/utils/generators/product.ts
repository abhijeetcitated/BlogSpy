// Product Schema Generator

import type { ProductSchema } from "../../types"

/**
 * Generate JSON-LD for Product schema
 */
export function generateProductSchema(data: ProductSchema): object {
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
