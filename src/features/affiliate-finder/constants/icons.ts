// Affiliate Finder - Icon Configuration Constants
// These are React component-based constants (require lucide-react)
// Separated from main constants to avoid circular dependencies

import type { LucideIcon } from "lucide-react"
import {
  Globe,
  BarChart3,
  Mail,
  Shield,
  Wallet,
  GraduationCap,
  Monitor,
  Dumbbell,
  ShoppingCart,
  ExternalLink,
  Target,
  Sparkles,
  DollarSign,
} from "lucide-react"

// ============================================
// Niche Icons Configuration (Premium SVG)
// ============================================

export const NICHE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  hosting: { icon: Globe, color: "text-blue-400" },
  "seo-tools": { icon: BarChart3, color: "text-emerald-400" },
  "email-marketing": { icon: Mail, color: "text-pink-400" },
  vpn: { icon: Shield, color: "text-cyan-400" },
  finance: { icon: Wallet, color: "text-amber-400" },
  "online-courses": { icon: GraduationCap, color: "text-violet-400" },
  software: { icon: Monitor, color: "text-indigo-400" },
  fitness: { icon: Dumbbell, color: "text-orange-400" },
}

// ============================================
// Program Icons (Premium SVG instead of emojis)
// ============================================

export const PROGRAM_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  amazon: { icon: ShoppingCart, color: "text-orange-400" },
  shareasale: { icon: ExternalLink, color: "text-blue-400" },
  cj: { icon: Globe, color: "text-emerald-400" },
  impact: { icon: Target, color: "text-purple-400" },
  bluehost: { icon: Globe, color: "text-blue-500" },
  semrush: { icon: BarChart3, color: "text-orange-500" },
  convertkit: { icon: Mail, color: "text-pink-400" },
  canva: { icon: Sparkles, color: "text-cyan-400" },
}

// ============================================
// Content Type Configuration
// ============================================

export const CONTENT_TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  review: { label: "Review", icon: Sparkles, color: "text-amber-400" },
  comparison: { label: "Compare", icon: BarChart3, color: "text-cyan-400" },
  roundup: { label: "Roundup", icon: Target, color: "text-emerald-400" },
  "deals-page": { label: "Deals", icon: DollarSign, color: "text-pink-400" },
  tutorial: { label: "Tutorial", icon: GraduationCap, color: "text-violet-400" },
  "buying-guide": { label: "Guide", icon: ShoppingCart, color: "text-blue-400" },
}
