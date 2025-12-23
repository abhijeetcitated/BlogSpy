// HowTo Schema Generator

import type { HowToSchema } from "../../types"

/**
 * Generate JSON-LD for HowTo schema
 */
export function generateHowToSchema(data: HowToSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    ...(data.image && { "image": data.image }),
    ...(data.totalTime && { "totalTime": data.totalTime }),
    ...(data.estimatedCost && { 
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "value": data.estimatedCost
      }
    }),
    ...(data.supply && data.supply.length > 0 && {
      "supply": data.supply.map(s => ({ "@type": "HowToSupply", "name": s }))
    }),
    ...(data.tool && data.tool.length > 0 && {
      "tool": data.tool.map(t => ({ "@type": "HowToTool", "name": t }))
    }),
    "step": data.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image })
    }))
  }
}
