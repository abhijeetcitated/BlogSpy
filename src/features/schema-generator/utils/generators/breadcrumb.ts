// Breadcrumb Schema Generator

import type { BreadcrumbSchema } from "../../types"

/**
 * Generate JSON-LD for Breadcrumb schema
 */
export function generateBreadcrumbSchema(data: BreadcrumbSchema): object {
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
