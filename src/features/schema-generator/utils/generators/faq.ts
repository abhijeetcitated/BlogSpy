// FAQ Schema Generator

import type { FAQSchema } from "../../types"

/**
 * Generate JSON-LD for FAQ schema
 */
export function generateFAQSchema(data: FAQSchema): object {
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
