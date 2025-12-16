// Topic Clusters Constants

import type { ClusterData } from "../types"

export const VIEW_MODE_OPTIONS = [
  { value: "graph", label: "Graph" },
  { value: "list", label: "List" },
] as const

export const MOCK_CLUSTERS: ClusterData[] = [
  {
    id: "seo",
    name: "SEO",
    fullName: "Search Engine Optimization",
    volume: "120K",
    kd: 45,
    keywords: [
      { keyword: "best seo tools", volume: "5K" },
      { keyword: "seo strategy guide", volume: "3.2K" },
      { keyword: "on-page seo checklist", volume: "2.8K" },
      { keyword: "technical seo audit", volume: "1.9K" },
      { keyword: "seo for beginners", volume: "4.5K" },
      { keyword: "local seo tips", volume: "2.1K" },
    ],
  },
  {
    id: "social",
    name: "Social Media",
    fullName: "Social Media Marketing",
    volume: "180K",
    kd: 38,
    keywords: [
      { keyword: "social media strategy", volume: "8K" },
      { keyword: "instagram marketing", volume: "6.5K" },
      { keyword: "linkedin for business", volume: "4.2K" },
      { keyword: "social media tools", volume: "3.8K" },
      { keyword: "content calendar", volume: "5.1K" },
    ],
  },
  {
    id: "email",
    name: "Email Marketing",
    fullName: "Email Marketing Automation",
    volume: "95K",
    kd: 52,
    keywords: [
      { keyword: "email marketing software", volume: "7K" },
      { keyword: "email automation", volume: "4.8K" },
      { keyword: "newsletter templates", volume: "3.5K" },
      { keyword: "email subject lines", volume: "2.9K" },
      { keyword: "drip campaigns", volume: "2.2K" },
    ],
  },
  {
    id: "content",
    name: "Content Strategy",
    fullName: "Content Marketing Strategy",
    volume: "55K",
    kd: 41,
    keywords: [
      { keyword: "content marketing", volume: "9K" },
      { keyword: "blog writing tips", volume: "3.2K" },
      { keyword: "content calendar template", volume: "2.8K" },
      { keyword: "storytelling in marketing", volume: "1.5K" },
    ],
  },
  {
    id: "ppc",
    name: "PPC",
    fullName: "Pay-Per-Click Advertising",
    volume: "88K",
    kd: 62,
    keywords: [
      { keyword: "google ads tips", volume: "6K" },
      { keyword: "ppc campaign setup", volume: "3.1K" },
      { keyword: "ad copywriting", volume: "2.4K" },
      { keyword: "landing page optimization", volume: "4.2K" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    fullName: "Marketing Analytics",
    volume: "72K",
    kd: 35,
    keywords: [
      { keyword: "google analytics setup", volume: "5.5K" },
      { keyword: "marketing metrics", volume: "2.8K" },
      { keyword: "conversion tracking", volume: "3.2K" },
      { keyword: "data visualization", volume: "4.1K" },
    ],
  },
]

export const KD_DIFFICULTY_LEGEND = [
  { color: "bg-emerald-500", shadowColor: "shadow-emerald-500/50", label: "Easy", range: "0-30" },
  { color: "bg-amber-500", shadowColor: "shadow-amber-500/50", label: "Medium", range: "31-60" },
  { color: "bg-red-500", shadowColor: "shadow-red-500/50", label: "Hard", range: "61-100" },
]
