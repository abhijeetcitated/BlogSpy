"use client"

import { useId } from "react"

interface IconProps {
  className?: string
}

function useStableSvgId(prefix: string) {
  const id = useId().replace(/:/g, "")
  return `${prefix}-${id}`
}

// ============================================
// NICHE ICONS - Premium SVG with gradients
// ============================================

export function GlobalIcon({ className }: IconProps) {
  const globalGradId = useStableSvgId("globalGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={globalGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${globalGradId})`} strokeWidth="2" fill="none" />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke={`url(#${globalGradId})`} strokeWidth="1.5" fill="none" />
      <path d="M2 12h20" stroke={`url(#${globalGradId})`} strokeWidth="1.5" />
      <path d="M4 7h16M4 17h16" stroke={`url(#${globalGradId})`} strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  )
}

export function TechIcon({ className }: IconProps) {
  const techGradId = useStableSvgId("techGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={techGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="20" height="14" rx="2" stroke={`url(#${techGradId})`} strokeWidth="2" fill="none" />
      <path d="M8 21h8M12 18v3" stroke={`url(#${techGradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9l2 2-2 2M12 13h4" stroke={`url(#${techGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HealthIcon({ className }: IconProps) {
  const healthGradId = useStableSvgId("healthGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={healthGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={`url(#${healthGradId})`} strokeWidth="2" fill="none" />
      <path d="M12 8v6M9 11h6" stroke={`url(#${healthGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function FinanceIcon({ className }: IconProps) {
  const financeGradId = useStableSvgId("financeGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={financeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${financeGradId})`} strokeWidth="2" fill="none" />
      <path d="M12 6v12M9 8.5c0 0 0-1.5 3-1.5s3 1.5 3 2.5-1.5 2-3 2-3 1-3 2.5 0 2.5 3 2.5 3-1.5 3-1.5" stroke={`url(#${financeGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function TravelIcon({ className }: IconProps) {
  const travelGradId = useStableSvgId("travelGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={travelGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path d="M21 16v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" stroke={`url(#${travelGradId})`} strokeWidth="2" fill="none" />
      <path d="M3.5 16l2.5 5h12l2.5-5" stroke={`url(#${travelGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12V3l4 3-4 3" stroke={`url(#${travelGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FoodIcon({ className }: IconProps) {
  const foodGradId = useStableSvgId("foodGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={foodGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d="M6 2v6a4 4 0 0 0 8 0V2" stroke={`url(#${foodGradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 2v4" stroke={`url(#${foodGradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 12v10" stroke={`url(#${foodGradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 2v4c0 2.5-2 4-2 8v8" stroke={`url(#${foodGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function LifestyleIcon({ className }: IconProps) {
  const lifestyleGradId = useStableSvgId("lifestyleGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={lifestyleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={`url(#${lifestyleGradId})`} strokeWidth="2" fill="none" />
      <path d="M9 22V12h6v10" stroke={`url(#${lifestyleGradId})`} strokeWidth="2" />
    </svg>
  )
}

export function EntertainmentIcon({ className }: IconProps) {
  const entertainGradId = useStableSvgId("entertainGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={entertainGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke={`url(#${entertainGradId})`} strokeWidth="2" fill="none" />
      <polygon points="10,8 16,12 10,16" fill={`url(#${entertainGradId})`} />
    </svg>
  )
}

export function FashionIcon({ className }: IconProps) {
  const fashionGradId = useStableSvgId("fashionGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={fashionGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <path d="M12 2l4 4v14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6l4-4z" stroke={`url(#${fashionGradId})`} strokeWidth="2" fill="none" />
      <path d="M8 6l-4 4v10a2 2 0 0 0 2 2h2M16 6l4 4v10a2 2 0 0 1-2 2h-2" stroke={`url(#${fashionGradId})`} strokeWidth="2" />
      <circle cx="12" cy="10" r="2" fill={`url(#${fashionGradId})`} />
    </svg>
  )
}

export function SportsIcon({ className }: IconProps) {
  const sportsGradId = useStableSvgId("sportsGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={sportsGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${sportsGradId})`} strokeWidth="2" fill="none" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={`url(#${sportsGradId})`} strokeWidth="1.5" fill="none" />
      <path d="M2 12h20" stroke={`url(#${sportsGradId})`} strokeWidth="1.5" />
    </svg>
  )
}

export function EducationIcon({ className }: IconProps) {
  const eduGradId = useStableSvgId("eduGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={eduGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={`url(#${eduGradId})`} strokeWidth="2" fill="none" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={`url(#${eduGradId})`} strokeWidth="2" fill="none" />
      <path d="M8 7h8M8 11h6M8 15h4" stroke={`url(#${eduGradId})`} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ============================================
// URGENCY ICONS
// ============================================

export function FireIcon({ className }: IconProps) {
  const fireGradId = useStableSvgId("fireGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={fireGradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path d="M12 22c4-3 8-6 8-12 0-2-1-4-3-5-1 2-2 3-4 3 0-3-1-5-3-8-2 3-3 5-3 8-2 0-3-1-4-3-2 1-3 3-3 5 0 6 4 9 8 12z" fill={`url(#${fireGradId})`} />
      <path d="M12 22c2-1.5 4-3 4-6 0-2-2-3-4-1-2-2-4-1-4 1 0 3 2 4.5 4 6z" fill="#fef08a" fillOpacity="0.8" />
    </svg>
  )
}

export function ClockUrgentIcon({ className }: IconProps) {
  const clockUrgentGradId = useStableSvgId("clockUrgentGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={clockUrgentGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${clockUrgentGradId})`} strokeWidth="2" fill="none" />
      <path d="M12 6v6l4 2" stroke={`url(#${clockUrgentGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill={`url(#${clockUrgentGradId})`} />
    </svg>
  )
}

export function ClipboardIcon({ className }: IconProps) {
  const clipboardGradId = useStableSvgId("clipboardGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={clipboardGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke={`url(#${clipboardGradId})`} strokeWidth="2" fill="none" />
      <rect x="8" y="2" width="8" height="4" rx="1" stroke={`url(#${clipboardGradId})`} strokeWidth="2" fill="none" />
      <path d="M9 12h6M9 16h4" stroke={`url(#${clipboardGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CrystalBallIcon({ className }: IconProps) {
  const crystalGradId = useStableSvgId("crystalGrad")
  const crystalInnerId = useStableSvgId("crystalInner")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={crystalGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <radialGradient id={crystalInnerId} cx="30%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="10" r="8" stroke={`url(#${crystalGradId})`} strokeWidth="2" fill="none" />
      <ellipse cx="12" cy="10" rx="8" ry="8" fill={`url(#${crystalInnerId})`} />
      <path d="M5 20h14l-2-4H7l-2 4z" stroke={`url(#${crystalGradId})`} strokeWidth="2" fill="none" />
      <path d="M9 8c0-1 1-2 3-2" stroke={`url(#${crystalGradId})`} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  )
}

// ============================================
// ACTION ICONS
// ============================================

export function PlusCircleIcon({ className }: IconProps) {
  const plusGradId = useStableSvgId("plusGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={plusGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${plusGradId})`} strokeWidth="2" fill="none" />
      <path d="M12 8v8M8 12h8" stroke={`url(#${plusGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CheckCircleIcon({ className }: IconProps) {
  const checkCircleGradId = useStableSvgId("checkCircleGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={checkCircleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${checkCircleGradId})`} strokeWidth="2" fill={`url(#${checkCircleGradId})`} fillOpacity="0.1" />
      <path d="M8 12l3 3 5-6" stroke={`url(#${checkCircleGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WriteIcon({ className }: IconProps) {
  const writeGradId = useStableSvgId("writeGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={writeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M12 20h9" stroke={`url(#${writeGradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={`url(#${writeGradId})`} strokeWidth="2" fill="none" />
    </svg>
  )
}

export function CalendarPlanIcon({ className }: IconProps) {
  const calPlanGradId = useStableSvgId("calPlanGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={calPlanGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={`url(#${calPlanGradId})`} strokeWidth="2" fill="none" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke={`url(#${calPlanGradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 14h2M14 14h2M8 18h2" stroke={`url(#${calPlanGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function SparklesIcon({ className }: IconProps) {
  const sparklesGradId = useStableSvgId("sparklesGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={sparklesGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" fill={`url(#${sparklesGradId})`} />
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" fill={`url(#${sparklesGradId})`} />
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" fill={`url(#${sparklesGradId})`} />
    </svg>
  )
}

export function TrendUpIcon({ className }: IconProps) {
  const trendUpGradId = useStableSvgId("trendUpGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={trendUpGradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={`url(#${trendUpGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h6v6" stroke={`url(#${trendUpGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  const usersGradId = useStableSvgId("usersGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={usersGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={`url(#${usersGradId})`} strokeWidth="2" />
      <circle cx="9" cy="7" r="4" stroke={`url(#${usersGradId})`} strokeWidth="2" fill="none" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={`url(#${usersGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function FilterIcon({ className }: IconProps) {
  const filterGradId = useStableSvgId("filterGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={filterGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke={`url(#${filterGradId})`} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RocketIcon({ className }: IconProps) {
  const rocketGradId = useStableSvgId("rocketGrad")
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={rocketGradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke={`url(#${rocketGradId})`} strokeWidth="2" fill="none" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke={`url(#${rocketGradId})`} strokeWidth="2" fill="none" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke={`url(#${rocketGradId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
