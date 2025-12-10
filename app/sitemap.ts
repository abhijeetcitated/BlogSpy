/**
 * Sitemap Generator
 * ============================================
 * Dynamic sitemap generation for SEO
 * ============================================
 */

import { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blogspy.io"

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages = [
    "",
    "/features",
    "/pricing",
    "/blog",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ]

  // Demo/feature pages
  const featurePages = [
    "/keyword-magic",
    "/keyword-overview",
    "/rank-tracker",
    "/competitor-gap",
    "/content-decay",
    "/topic-clusters",
    "/snippet-stealer",
    "/trend-spotter",
    "/trends",
    "/ai-writer",
    "/content-roadmap",
    "/on-page-checker",
  ]

  const allPages = [...staticPages, ...featurePages]

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/keyword") ? 0.9 : 0.8,
  }))
}
