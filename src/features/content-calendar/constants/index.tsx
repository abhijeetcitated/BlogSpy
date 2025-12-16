"use client"

import { ReactNode } from "react"
import type { ContentNiche } from "../types"
import {
  GlobalIcon,
  TechIcon,
  HealthIcon,
  FinanceIcon,
  TravelIcon,
  FoodIcon,
  LifestyleIcon,
  EntertainmentIcon,
  FashionIcon,
  SportsIcon,
  EducationIcon,
  FireIcon,
  ClockUrgentIcon,
  ClipboardIcon,
  CrystalBallIcon,
} from "../components/icons"

// ============================================
// NICHE CONFIGURATION - Premium Icons
// ============================================

export interface NicheConfigItem {
  value: ContentNiche | "all"
  label: string
  icon: ReactNode
  color: string
  bgColor: string
  borderColor: string
}

export const nicheConfig: NicheConfigItem[] = [
  { 
    value: "all", 
    label: "All Niches", 
    icon: <GlobalIcon className="h-4 w-4" />,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800/50",
    borderColor: "border-slate-200 dark:border-slate-700"
  },
  { 
    value: "technology", 
    label: "Technology", 
    icon: <TechIcon className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  { 
    value: "health", 
    label: "Health & Fitness", 
    icon: <HealthIcon className="h-4 w-4" />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    borderColor: "border-green-200 dark:border-green-800"
  },
  { 
    value: "finance", 
    label: "Finance & Money", 
    icon: <FinanceIcon className="h-4 w-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  { 
    value: "travel", 
    label: "Travel", 
    icon: <TravelIcon className="h-4 w-4" />,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/50",
    borderColor: "border-sky-200 dark:border-sky-800"
  },
  { 
    value: "food", 
    label: "Food & Recipes", 
    icon: <FoodIcon className="h-4 w-4" />,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-800"
  },
  { 
    value: "lifestyle", 
    label: "Lifestyle", 
    icon: <LifestyleIcon className="h-4 w-4" />,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/50",
    borderColor: "border-pink-200 dark:border-pink-800"
  },
  { 
    value: "entertainment", 
    label: "Entertainment", 
    icon: <EntertainmentIcon className="h-4 w-4" />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    borderColor: "border-purple-200 dark:border-purple-800"
  },
  { 
    value: "fashion", 
    label: "Fashion & Beauty", 
    icon: <FashionIcon className="h-4 w-4" />,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/50",
    borderColor: "border-rose-200 dark:border-rose-800"
  },
  { 
    value: "sports", 
    label: "Sports", 
    icon: <SportsIcon className="h-4 w-4" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-800"
  },
  { 
    value: "education", 
    label: "Education", 
    icon: <EducationIcon className="h-4 w-4" />,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    borderColor: "border-indigo-200 dark:border-indigo-800"
  },
]

// ============================================
// URGENCY CONFIGURATION - Theme Aware
// ============================================

export interface UrgencyConfigItem {
  label: string
  color: string
  bgColor: string
  borderColor: string
  badge: string
  icon: ReactNode
}

export const urgencyConfig: Record<string, UrgencyConfigItem> = {
  urgent: {
    label: "Start Today!",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    badge: "URGENT",
    icon: <FireIcon className="h-4 w-4" />,
  },
  upcoming: {
    label: "This Month",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    badge: "UPCOMING",
    icon: <ClockUrgentIcon className="h-4 w-4" />,
  },
  planned: {
    label: "Plan Ahead",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    badge: "PLAN",
    icon: <ClipboardIcon className="h-4 w-4" />,
  },
  future: {
    label: "Research Mode",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
    badge: "FUTURE",
    icon: <CrystalBallIcon className="h-4 w-4" />,
  },
}

// ============================================
// DIFFICULTY CONFIGURATION - Theme Aware
// ============================================

export interface DifficultyConfigItem {
  label: string
  color: string
  bgColor: string
  textColor: string
}

export const difficultyConfig: Record<string, DifficultyConfigItem> = {
  easy: {
    label: "Easy",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  hard: {
    label: "Hard",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-300",
  },
}

// ============================================
// MATCH SCORE CONFIGURATION
// ============================================

export const getMatchScoreStyle = (score: number) => {
  if (score >= 80) {
    return {
      bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
      textColor: "text-emerald-700 dark:text-emerald-300",
      ringColor: "ring-emerald-500/30",
    }
  }
  if (score >= 50) {
    return {
      bgColor: "bg-amber-100 dark:bg-amber-900/40",
      textColor: "text-amber-700 dark:text-amber-300",
      ringColor: "ring-amber-500/30",
    }
  }
  return {
    bgColor: "bg-slate-100 dark:bg-slate-800/60",
    textColor: "text-slate-700 dark:text-slate-300",
    ringColor: "ring-slate-500/30",
  }
}

// ============================================
// BUTTON STYLES
// ============================================

export const buttonStyles = {
  primary: "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white dark:text-black font-semibold shadow-lg shadow-amber-500/25 dark:shadow-amber-500/15",
  secondary: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50",
  success: "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30",
  ghost: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
}
