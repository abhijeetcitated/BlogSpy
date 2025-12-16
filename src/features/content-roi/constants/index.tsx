// Content ROI Constants

import React from "react"
import { ContentCostSettings, PerformanceTier } from "../types"

// Premium SVG Icons for Performance Tiers
export const PerformanceIcons: Record<PerformanceTier, () => React.JSX.Element> = {
  star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  profitable: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  "break-even": () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-cyan-400">
      <path d="M12 3v18"/>
      <rect x="3" y="8" width="7" height="13" rx="1"/>
      <rect x="14" y="8" width="7" height="13" rx="1"/>
    </svg>
  ),
  underperforming: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-400">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  loss: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
}

// Premium SVG Icons for Content Categories
export const CategoryIcons: Record<string, () => React.JSX.Element> = {
  all: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  "how-to": () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  listicle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  review: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  comparison: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 3v18"/>
      <rect x="3" y="8" width="7" height="13" rx="1"/>
      <rect x="14" y="8" width="7" height="13" rx="1"/>
    </svg>
  ),
  news: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8"/>
      <path d="M15 18h-5"/>
      <path d="M10 6h8v4h-8V6Z"/>
    </svg>
  ),
  "case-study": () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  tutorial: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  opinion: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  interview: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  resource: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
}

// Default cost settings for calculating article costs
export const DEFAULT_COST_SETTINGS: ContentCostSettings = {
  avgWritingCostPerWord: 0.05, // $0.05 per word default
  avgEditingCostPerArticle: 25,
  avgImageCostPerArticle: 15,
  avgPromotionCostPerArticle: 10,
  monthlyToolsCost: 100, // SEO tools, hosting, etc.
  articleCountForToolsCost: 10, // $10 per article for tools
  writerRates: {
    self: 0, // Free if you write yourself
    freelancer: 0.08, // $0.08 per word
    agency: 0.15, // $0.15 per word
    aiAssisted: 0.02, // $0.02 per word (just editing AI content)
  },
}

// Performance tier definitions
export const PERFORMANCE_TIERS: Record<PerformanceTier, {
  label: string
  description: string
  color: string
  bgColor: string
  icon: string
  minROI: number
  maxROI: number | null
}> = {
  star: {
    label: "Star Performers",
    description: "ROI > 200% - Your best content",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    icon: "⭐",
    minROI: 200,
    maxROI: null,
  },
  profitable: {
    label: "Profitable",
    description: "ROI 50-200% - Solid performers",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: "📈",
    minROI: 50,
    maxROI: 200,
  },
  "break-even": {
    label: "Break Even",
    description: "ROI 0-50% - Covering costs",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    icon: "⚖️",
    minROI: 0,
    maxROI: 50,
  },
  underperforming: {
    label: "Underperforming",
    description: "ROI -50% to 0% - Needs improvement",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    icon: "⚠️",
    minROI: -50,
    maxROI: 0,
  },
  loss: {
    label: "Losing Money",
    description: "ROI < -50% - Consider updating or removing",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    icon: "📉",
    minROI: -Infinity,
    maxROI: -50,
  },
}

// Categories for content
export const CONTENT_CATEGORIES = [
  { id: "all", name: "All Categories", icon: "📁" },
  { id: "how-to", name: "How-To Guides", icon: "📝" },
  { id: "listicle", name: "Listicles", icon: "📋" },
  { id: "review", name: "Reviews", icon: "⭐" },
  { id: "comparison", name: "Comparisons", icon: "⚖️" },
  { id: "news", name: "News/Updates", icon: "📰" },
  { id: "case-study", name: "Case Studies", icon: "📊" },
  { id: "tutorial", name: "Tutorials", icon: "🎓" },
  { id: "opinion", name: "Opinion/Editorial", icon: "💭" },
  { id: "interview", name: "Interviews", icon: "🎤" },
  { id: "resource", name: "Resources/Tools", icon: "🔧" },
]

// Sample data for demo
export const SAMPLE_ARTICLES: Array<{
  id: string
  title: string
  url: string
  publishDate: string
  wordCount: number
  category: string
  pageviews: number
  adRevenue: number
  affiliateRevenue: number
  writingCost: number
  totalCost: number
}> = [
  {
    id: "1",
    title: "10 Best Productivity Apps for Remote Workers in 2024",
    url: "/best-productivity-apps",
    publishDate: "2024-01-15",
    wordCount: 3500,
    category: "listicle",
    pageviews: 45000,
    adRevenue: 890,
    affiliateRevenue: 450,
    writingCost: 175,
    totalCost: 225,
  },
  {
    id: "2",
    title: "Complete Guide to Starting a Blog in 2024",
    url: "/start-blog-guide",
    publishDate: "2024-02-01",
    wordCount: 5000,
    category: "how-to",
    pageviews: 32000,
    adRevenue: 640,
    affiliateRevenue: 280,
    writingCost: 250,
    totalCost: 320,
  },
  {
    id: "3",
    title: "Ahrefs vs SEMrush: Complete Comparison",
    url: "/ahrefs-vs-semrush",
    publishDate: "2024-02-15",
    wordCount: 4200,
    category: "comparison",
    pageviews: 28000,
    adRevenue: 420,
    affiliateRevenue: 890,
    writingCost: 210,
    totalCost: 280,
  },
  {
    id: "4",
    title: "How I Made $10K/Month Blogging",
    url: "/blogging-income-report",
    publishDate: "2024-03-01",
    wordCount: 2800,
    category: "case-study",
    pageviews: 65000,
    adRevenue: 1300,
    affiliateRevenue: 520,
    writingCost: 0,
    totalCost: 50,
  },
  {
    id: "5",
    title: "WordPress Hosting Comparison: Top 10 Providers",
    url: "/wordpress-hosting",
    publishDate: "2024-03-15",
    wordCount: 4800,
    category: "comparison",
    pageviews: 38000,
    adRevenue: 720,
    affiliateRevenue: 1200,
    writingCost: 240,
    totalCost: 310,
  },
  {
    id: "6",
    title: "Is Blogging Dead in 2024?",
    url: "/is-blogging-dead",
    publishDate: "2024-04-01",
    wordCount: 1800,
    category: "opinion",
    pageviews: 8500,
    adRevenue: 85,
    affiliateRevenue: 0,
    writingCost: 90,
    totalCost: 140,
  },
  {
    id: "7",
    title: "Email Marketing for Beginners",
    url: "/email-marketing-guide",
    publishDate: "2024-04-15",
    wordCount: 3200,
    category: "how-to",
    pageviews: 12000,
    adRevenue: 180,
    affiliateRevenue: 95,
    writingCost: 160,
    totalCost: 210,
  },
  {
    id: "8",
    title: "ConvertKit Review 2024",
    url: "/convertkit-review",
    publishDate: "2024-05-01",
    wordCount: 2500,
    category: "review",
    pageviews: 15000,
    adRevenue: 225,
    affiliateRevenue: 380,
    writingCost: 125,
    totalCost: 175,
  },
  {
    id: "9",
    title: "Google Algorithm Update May 2024",
    url: "/google-update-may-2024",
    publishDate: "2024-05-15",
    wordCount: 1200,
    category: "news",
    pageviews: 3200,
    adRevenue: 32,
    affiliateRevenue: 0,
    writingCost: 60,
    totalCost: 110,
  },
  {
    id: "10",
    title: "How to Use AI for Content Writing",
    url: "/ai-content-writing",
    publishDate: "2024-06-01",
    wordCount: 3800,
    category: "tutorial",
    pageviews: 52000,
    adRevenue: 1040,
    affiliateRevenue: 680,
    writingCost: 76,
    totalCost: 150,
  },
]

// ROI calculation thresholds
export const ROI_THRESHOLDS = {
  excellent: 200,
  good: 100,
  average: 50,
  poor: 0,
  loss: -50,
}

// Date range options
export const DATE_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
]
