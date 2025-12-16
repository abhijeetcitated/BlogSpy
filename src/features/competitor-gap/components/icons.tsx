"use client"

import { cn } from "@/lib/utils"

// ============================================
// COMPETITOR GAP - Premium SVG Icons
// ============================================

interface IconProps {
  className?: string
}

// Sword Battle Icon - Main logo
export function SwordBattleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)}>
      <defs>
        <linearGradient id="sword-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        d="M14.5 3L21 9.5M21 9.5L17 13.5M21 9.5L18.5 12M3 21L9.5 14.5M9.5 14.5L5.5 10.5L9.5 6.5L13.5 10.5M9.5 14.5L13.5 10.5"
        stroke="url(#sword-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Target Crosshair Icon
export function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", className)}>
      <defs>
        <linearGradient id="target-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#target-grad)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" stroke="url(#target-grad)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="url(#target-grad)" />
      <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="url(#target-grad)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Enemy Flag Icon
export function EnemyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", className)}>
      <defs>
        <linearGradient id="enemy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <path
        d="M4 21V4M4 4L12 8L4 12"
        stroke="url(#enemy-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8L20 4V12L12 16V8Z"
        fill="url(#enemy-grad)"
        fillOpacity="0.2"
        stroke="url(#enemy-grad)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

// Gap Finder Icon
export function GapFinderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", className)}>
      <defs>
        <linearGradient id="gap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="url(#gap-grad)" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="url(#gap-grad)" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="url(#gap-grad)" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="url(#gap-grad)" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M17.5 17.5L19 19M15.5 17.5C15.5 18.6046 16.3954 19.5 17.5 19.5C18.6046 19.5 19.5 18.6046 19.5 17.5C19.5 16.3954 18.6046 15.5 17.5 15.5C16.3954 15.5 15.5 16.3954 15.5 17.5Z" stroke="url(#gap-grad)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Weak Spot Icon (Reddit/Quora)
export function WeakSpotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", className)}>
      <defs>
        <linearGradient id="weak-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" stroke="url(#weak-grad)" strokeWidth="1.5" strokeDasharray="4 2" />
      <path d="M12 8V12L15 15" stroke="url(#weak-grad)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="url(#weak-grad)" />
    </svg>
  )
}

// Trend Arrow Icon
export function TrendIcon({ className, direction = "up" }: IconProps & { direction?: "up" | "down" }) {
  const gradientId = direction === "up" ? "trend-up-grad" : "trend-down-grad"
  const color1 = direction === "up" ? "#10b981" : "#ef4444"
  const color2 = direction === "up" ? "#059669" : "#dc2626"
  
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      {direction === "up" ? (
        <path d="M3 17L9 11L13 15L21 7M21 7V13M21 7H15" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M3 7L9 13L13 9L21 17M21 17V11M21 17H15" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

// AI Spark Icon
export function AISparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", className)}>
      <defs>
        <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L13.09 8.26L19 9L13.09 10.74L12 17L10.91 10.74L5 9L10.91 8.26L12 2Z"
        fill="url(#ai-grad)"
      />
      <path
        d="M5 16L5.54 18.46L8 19L5.54 19.54L5 22L4.46 19.54L2 19L4.46 18.46L5 16Z"
        fill="url(#ai-grad)"
        fillOpacity="0.6"
      />
      <path
        d="M19 14L19.35 15.65L21 16L19.35 16.35L19 18L18.65 16.35L17 16L18.65 15.65L19 14Z"
        fill="url(#ai-grad)"
        fillOpacity="0.6"
      />
    </svg>
  )
}

// Write/Pen Icon
export function WriteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <defs>
        <linearGradient id="write-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        d="M12 20H21M3 20H5.5M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.2786 2.87868 18.5544 2.93355 18.8118 3.04015C19.0692 3.14676 19.303 3.30301 19.5 3.5C19.697 3.69698 19.8532 3.93083 19.9598 4.1882C20.0665 4.44557 20.1213 4.72142 20.1213 5C20.1213 5.27858 20.0665 5.55442 19.9598 5.81179C19.8532 6.06916 19.697 6.30301 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
        stroke="url(#write-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Calendar Icon
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <defs>
        <linearGradient id="cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="url(#cal-grad)" strokeWidth="1.5" />
      <path d="M3 10H21" stroke="url(#cal-grad)" strokeWidth="1.5" />
      <path d="M8 2V6M16 2V6" stroke="url(#cal-grad)" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="url(#cal-grad)" />
    </svg>
  )
}

// Chart/Visual Icon
export function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", className)}>
      <defs>
        <linearGradient id="chart-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect x="3" y="12" width="4" height="9" rx="1" fill="url(#chart-grad)" fillOpacity="0.3" stroke="url(#chart-grad)" strokeWidth="1.5" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="url(#chart-grad)" fillOpacity="0.5" stroke="url(#chart-grad)" strokeWidth="1.5" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="url(#chart-grad)" fillOpacity="0.7" stroke="url(#chart-grad)" strokeWidth="1.5" />
    </svg>
  )
}

// Check Circle Icon
export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <defs>
        <linearGradient id="check-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#check-grad)" fillOpacity="0.1" stroke="url(#check-grad)" strokeWidth="1.5" />
      <path d="M8 12L11 15L16 9" stroke="url(#check-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// External Link Icon
export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-3.5 w-3.5", className)}>
      <path
        d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11M15 3H21M21 3V9M21 3L10 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Arrow Right Icon
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <path
        d="M5 12H19M19 12L12 5M19 12L12 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Download Icon
export function DownloadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <path
        d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M12 3V15M12 15L7 10M12 15L17 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Filter Icon
export function FilterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <path
        d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Search Icon
export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Loader Icon
export function LoaderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5 animate-spin", className)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12"
        stroke="url(#loader-grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Plus Icon
export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Reddit Icon
export function RedditIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <circle cx="12" cy="12" r="10" fill="#FF4500" fillOpacity="0.1" />
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#FF4500"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="13" r="1.5" fill="#FF4500" />
      <circle cx="15.5" cy="13" r="1.5" fill="#FF4500" />
      <path d="M9 16.5C10 17.5 14 17.5 15 16.5" stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Quora Icon
export function QuoraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <circle cx="12" cy="12" r="10" fill="#B92B27" fillOpacity="0.1" />
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#B92B27"
        strokeWidth="1.5"
      />
      <text x="8" y="16" fill="#B92B27" fontSize="10" fontWeight="bold" fontFamily="serif">Q</text>
    </svg>
  )
}
