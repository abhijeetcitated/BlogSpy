// Article Schema Generator

import type { ArticleSchema } from "../../types"

/**
 * Generate JSON-LD for Article schema
 */
export function generateArticleSchema(data: ArticleSchema): object {
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
