// Video Schema Generator

import type { VideoSchema } from "../../types"

/**
 * Generate JSON-LD for Video schema
 */
export function generateVideoSchema(data: VideoSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": data.name,
    "description": data.description,
    "thumbnailUrl": data.thumbnailUrl,
    "uploadDate": data.uploadDate,
    "duration": data.duration,
    ...(data.contentUrl && { "contentUrl": data.contentUrl }),
    ...(data.embedUrl && { "embedUrl": data.embedUrl })
  }
}
