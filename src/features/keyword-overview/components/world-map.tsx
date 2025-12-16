"use client"

import { MAP_COUNTRIES } from "../constants"
import type { Country } from "../types"

interface WorldMapProps {
  countries?: Country[]
}

export function WorldMap({ countries = MAP_COUNTRIES }: WorldMapProps) {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-32">
      {/* Simplified world map outline */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* North America */}
      <path
        d="M40,30 Q60,25 100,35 L120,55 Q100,80 70,90 L50,70 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* South America */}
      <path
        d="M90,100 Q100,95 110,105 L105,140 Q95,155 85,145 L80,120 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Europe */}
      <path
        d="M175,30 Q200,25 220,35 L225,55 Q210,65 185,60 L175,45 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Africa */}
      <path
        d="M185,70 Q205,65 220,75 L225,120 Q210,145 190,140 L180,100 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Asia */}
      <path
        d="M230,30 Q280,20 330,40 L340,80 Q310,100 260,90 L240,60 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Australia */}
      <path
        d="M310,120 Q330,115 350,125 L355,145 Q340,155 320,150 L310,135 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Glowing dots for highlighted countries */}
      {countries.map((country) => (
        <g key={country.id}>
          <circle cx={country.x} cy={country.y} r="8" fill="rgba(16,185,129,0.2)" filter="url(#glow)" />
          <circle cx={country.x} cy={country.y} r="4" fill="#10b981" className="animate-pulse" />
        </g>
      ))}
    </svg>
  )
}
