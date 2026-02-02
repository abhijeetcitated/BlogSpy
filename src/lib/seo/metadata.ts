/**
 * SEO Metadata Configuration
 * ============================================
 * Centralized SEO metadata for all pages
 * Use: import { generateMetadata } from "@/lib/seo"
 * ============================================
 */

import type { Metadata } from "next"

// ============================================
// BASE CONFIGURATION
// ============================================

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blogspy.io"
const siteName = "BlogSpy"
const siteDescription = "Modern SEO SaaS Platform for Keyword Research, Rank Tracking & Content Optimization"

// ============================================
// DEFAULT METADATA
// ============================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - SEO Dashboard`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "BlogSpy Team" }],
  generator: "Next.js",
  keywords: [
    "SEO",
    "keyword research",
    "rank tracker",
    "content optimization",
    "SEO tools",
    "competitor analysis",
    "SERP tracking",
    "BlogSpy",
  ],
  creator: "BlogSpy",
  publisher: "BlogSpy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Modern SEO SaaS Platform`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} - SEO Dashboard`,
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Modern SEO SaaS Platform`,
    description: siteDescription,
    creator: "@blogspy",
    images: [`${siteUrl}/og-image.png`],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add your IDs)
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },

  // Icons
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  // Manifest
  manifest: "/manifest.json",

  // Alternates
  alternates: {
    canonical: siteUrl,
  },
}

// ============================================
// PAGE-SPECIFIC METADATA GENERATORS
// ============================================

interface PageMetadataProps {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: PageMetadataProps): Metadata {
  const url = `${siteUrl}${path}`
  const ogImage = image || `${siteUrl}/og-image.png`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title: `${title} | ${siteName}`,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

// ============================================
// FEATURE PAGE METADATA
// ============================================

export const featureMetadata = {
  keywordMagic: generatePageMetadata({
    title: "Keyword Magic Tool",
    description: "Discover thousands of high-value keywords with search volume, difficulty, and CPC data. The ultimate keyword research tool.",
    path: "/keyword-magic",
  }),
  
  rankTracker: generatePageMetadata({
    title: "Rank Tracker",
    description: "Track your keyword rankings across search engines. Monitor position changes and outperform competitors.",
    path: "/rank-tracker",
  }),
  
  competitorGap: generatePageMetadata({
    title: "Competitor Gap Analysis",
    description: "Find keyword gaps between you and competitors. Discover untapped ranking opportunities.",
    path: "/competitor-gap",
  }),
  
  contentDecay: generatePageMetadata({
    title: "Content Decay Tracker",
    description: "Identify declining content before it's too late. Keep your rankings stable with timely updates.",
    path: "/content-decay",
  }),
  
  topicClusters: generatePageMetadata({
    title: "Topic Clusters",
    description: "Build semantic topic clusters for content strategy. Establish topical authority with pillar content.",
    path: "/topic-clusters",
  }),
  
  trendSpotter: generatePageMetadata({
    title: "Trend Spotter",
    description: "Spot emerging trends before they peak. Get ahead of the competition with trend analysis.",
    path: "/trend-spotter",
  }),
  
  aiWriter: generatePageMetadata({
    title: "AI Content Writer",
    description: "Generate SEO-optimized content with AI. Create high-quality articles, blog posts, and more.",
    path: "/ai-writer",
  }),
  
  snippetStealer: generatePageMetadata({
    title: "Snippet Stealer",
    description: "Analyze and steal featured snippets from competitors. Optimize your content for position zero.",
    path: "/snippet-stealer",
  }),
  
  onPageChecker: generatePageMetadata({
    title: "On-Page SEO Checker",
    description: "Analyze your pages for SEO issues. Get actionable recommendations to improve rankings.",
    path: "/on-page-checker",
  }),
}

// ============================================
// JSON-LD STRUCTURED DATA
// ============================================

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/blogspy",
      "https://linkedin.com/company/blogspy",
      "https://github.com/blogspy",
    ],
  }
}

export function generateSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
  }
}
