// Review Schema Generator

import type { ReviewSchema } from "../../types"

/**
 * Generate JSON-LD for Review schema
 */
export function generateReviewSchema(data: ReviewSchema): object {
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
