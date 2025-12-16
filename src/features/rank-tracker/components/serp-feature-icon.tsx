// ============================================
// RANK TRACKER - SERP Feature Icon Component
// ============================================

"use client"

import {
  Video,
  FileText,
  DollarSign,
  HelpCircle,
  ShoppingBag,
  Image,
  MapPin,
  Star,
  Link2,
  Sparkles,
  Newspaper,
  type LucideIcon,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SerpFeature } from "../types"

interface SerpFeatureIconProps {
  feature: SerpFeature
  size?: number
}

const ICON_MAP: Record<SerpFeature, LucideIcon> = {
  snippet: FileText,
  video: Video,
  image: Image,
  faq: HelpCircle,
  local_pack: MapPin,
  shopping: ShoppingBag,
  reviews: Star,
  site_links: Link2,
  knowledge_panel: Sparkles,
  top_stories: Newspaper,
  ad: DollarSign,
}

const FEATURE_CONFIG: Record<SerpFeature, { label: string; bgColor: string; iconColor: string }> = {
  snippet: { label: "Featured Snippet", bgColor: "bg-blue-100 dark:bg-blue-500/20", iconColor: "text-blue-600 dark:text-blue-400" },
  video: { label: "Video Carousel", bgColor: "bg-red-100 dark:bg-red-500/20", iconColor: "text-red-600 dark:text-red-400" },
  image: { label: "Image Pack", bgColor: "bg-purple-100 dark:bg-purple-500/20", iconColor: "text-purple-600 dark:text-purple-400" },
  faq: { label: "People Also Ask", bgColor: "bg-cyan-100 dark:bg-cyan-500/20", iconColor: "text-cyan-600 dark:text-cyan-400" },
  local_pack: { label: "Local 3-Pack", bgColor: "bg-emerald-100 dark:bg-emerald-500/20", iconColor: "text-emerald-600 dark:text-emerald-400" },
  shopping: { label: "Shopping Results", bgColor: "bg-orange-100 dark:bg-orange-500/20", iconColor: "text-orange-600 dark:text-orange-400" },
  reviews: { label: "Star Ratings", bgColor: "bg-yellow-100 dark:bg-yellow-500/20", iconColor: "text-yellow-600 dark:text-yellow-500" },
  site_links: { label: "Site Links", bgColor: "bg-indigo-100 dark:bg-indigo-500/20", iconColor: "text-indigo-600 dark:text-indigo-400" },
  knowledge_panel: { label: "Knowledge Panel", bgColor: "bg-pink-100 dark:bg-pink-500/20", iconColor: "text-pink-600 dark:text-pink-400" },
  top_stories: { label: "Top Stories", bgColor: "bg-rose-100 dark:bg-rose-500/20", iconColor: "text-rose-600 dark:text-rose-400" },
  ad: { label: "Paid Ad", bgColor: "bg-amber-100 dark:bg-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400" },
}

/**
 * Displays a SERP feature icon with tooltip
 */
export function SerpFeatureIcon({ feature, size = 14 }: SerpFeatureIconProps) {
  const config = FEATURE_CONFIG[feature]
  if (!config) return null

  const IconComponent = ICON_MAP[feature]
  if (!IconComponent) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center justify-center p-1 rounded ${config.bgColor}`}
          >
            <IconComponent size={size} className={config.iconColor} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface SerpFeaturesListProps {
  features: SerpFeature[]
}

/**
 * Displays a list of SERP feature icons
 */
export function SerpFeaturesList({ features }: SerpFeaturesListProps) {
  if (!features || features.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {features.map((feature) => (
        <SerpFeatureIcon key={feature} feature={feature} />
      ))}
    </div>
  )
}
