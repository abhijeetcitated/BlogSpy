"use client"

import React from "react"

// Premium SVG Icons for Blog Niches
export const NicheIcons: Record<string, React.ReactNode> = {
  finance: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" className="stroke-emerald-500" />
      <path d="M12 6v12" className="stroke-emerald-500" />
      <path d="M8 10h8" className="stroke-emerald-500" />
      <path d="M8 14h8" className="stroke-emerald-500" />
    </svg>
  ),
  insurance: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="stroke-blue-500" />
      <path d="M9 12l2 2 4-4" className="stroke-blue-500" />
    </svg>
  ),
  legal: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" className="stroke-amber-500" />
      <path d="M4 8l8 4 8-4" className="stroke-amber-500" />
      <path d="M4 8v4a4 4 0 004 4" className="stroke-amber-500" />
      <path d="M20 8v4a4 4 0 01-4 4" className="stroke-amber-500" />
    </svg>
  ),
  health: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" className="stroke-red-500" />
    </svg>
  ),
  tech: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" className="stroke-cyan-500" />
      <line x1="8" y1="21" x2="16" y2="21" className="stroke-cyan-500" />
      <line x1="12" y1="17" x2="12" y2="21" className="stroke-cyan-500" />
    </svg>
  ),
  travel: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l4-9v18l-4-9H2" className="stroke-violet-500" />
      <path d="M22 12h-4l-4 9V3l4 9h4" className="stroke-violet-500" />
    </svg>
  ),
  food: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 019.18 0A4 4 0 0118 13.87V21H6z" className="stroke-orange-500" />
      <line x1="6" y1="17" x2="18" y2="17" className="stroke-orange-500" />
    </svg>
  ),
  lifestyle: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" className="stroke-yellow-500 fill-yellow-500/20" />
    </svg>
  ),
  parenting: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" className="stroke-pink-500" />
      <circle cx="9" cy="7" r="4" className="stroke-pink-500" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" className="stroke-pink-500" />
      <path d="M16 3.13a4 4 0 010 7.75" className="stroke-pink-500" />
    </svg>
  ),
  diy: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" className="stroke-amber-600" />
    </svg>
  ),
  gaming: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" className="stroke-purple-500" />
      <line x1="8" y1="10" x2="8" y2="14" className="stroke-purple-500" />
      <circle cx="15" cy="13" r="1" className="stroke-purple-500 fill-purple-500" />
      <circle cx="18" cy="11" r="1" className="stroke-purple-500 fill-purple-500" />
      <rect x="2" y="6" width="20" height="12" rx="2" className="stroke-purple-500" />
    </svg>
  ),
  education: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" className="stroke-indigo-500" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" className="stroke-indigo-500" />
    </svg>
  ),
}

// Premium SVG Icons for Ad Networks  
export const NetworkIcons: Record<string, React.ReactNode> = {
  adsense: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" className="fill-blue-500/20 stroke-blue-500" strokeWidth="2" />
      <path d="M7 12h10" className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8h6" className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16h8" className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ezoic: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" className="fill-green-500/20 stroke-green-500" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" className="stroke-green-500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  monumetric: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="4" height="10" rx="1" className="fill-blue-600" />
      <rect x="10" y="6" width="4" height="14" rx="1" className="fill-blue-500" />
      <rect x="17" y="3" width="4" height="17" rx="1" className="fill-blue-400" />
    </svg>
  ),
  mediavine: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" className="fill-purple-500/30 stroke-purple-500" strokeWidth="2" />
      <path d="M2 17l10 5 10-5" className="stroke-purple-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" className="stroke-purple-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  raptive: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 22,9 22,22 12,15 2,22 2,9" className="fill-orange-500/20 stroke-orange-500" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="3" className="fill-orange-500" />
    </svg>
  ),
}
