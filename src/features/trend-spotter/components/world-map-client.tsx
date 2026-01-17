"use client"

import { useEffect, useState, useCallback } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { Loader2 } from "lucide-react"

import type { TooltipState } from "../types"
import { geoUrl } from "../constants"
import { ALL_COUNTRIES } from "../constants/map-coordinates"
import { countryInterestData, mapMarkers } from "../__mocks__"

// D3 Color Scale for Heatmap (Blue gradient)
const colorScale = scaleLinear<string>()
  .domain([0, 50, 100])
  .range(["#1e293b", "#1e40af", "#3b82f6"]) // Slate-800 -> Blue-800 -> Blue-500

type WorldMapProps = {
  activeCountryCode?: string | null
}

export function WorldMap({ activeCountryCode }: WorldMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 20],
    zoom: 1,
  })
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: "",
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const key = (activeCountryCode || "WORLD").toUpperCase()
    const target =
      ALL_COUNTRIES.find((country) => country.code === key) ||
      ALL_COUNTRIES.find((country) => country.code === "WORLD")
    if (!target) {
      setPosition({ coordinates: [0, 20], zoom: 1 })
      return
    }
    setPosition({ coordinates: target.coordinates, zoom: target.zoom })
  }, [activeCountryCode])

  const handleMouseEnter = useCallback(
    (geo: { properties: { name: string } }, event: React.MouseEvent) => {
      const countryName = geo.properties.name
      const data = countryInterestData[countryName]

      const content = data
        ? `${countryName}: ${data.volume.toLocaleString()} (${data.percentage}%)`
        : `${countryName}: N/A`

      setTooltip({
        show: true,
        content,
        x: event.clientX,
        y: event.clientY,
      })
    },
    []
  )

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip((prev) => ({
      ...prev,
      x: event.clientX,
      y: event.clientY,
    }))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, show: false }))
  }, [])

  const getCountryColor = useCallback((countryName: string) => {
    const data = countryInterestData[countryName]
    if (!data) return "#1e293b" // Slate-800 for no data
    return colorScale(data.percentage)
  }, [])

  const activeCountryInfo =
    activeCountryCode && activeCountryCode !== "WORLD"
      ? ALL_COUNTRIES.find((country) => country.code === activeCountryCode)
      : null

  // Error state
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-sm text-red-400">Failed to load map</p>
          <button 
            onClick={() => {
              setHasError(false)
              setIsLoading(true)
            }}
            className="mt-2 text-xs text-blue-400 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-xs text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}
      
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 20],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
        >
          <Geographies 
            geography={geoUrl}
            parseGeographies={(geos) => {
              if (geos && geos.length > 0) {
                setIsLoading(false)
              }
              return geos
            }}
          >
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name
                const hasData = !!countryInterestData[countryName]
                const fillColor = getCountryColor(countryName)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#334155"
                    strokeWidth={0.5}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        outline: "none",
                        transition: "all 0.2s ease",
                      },
                      hover: {
                        fill: hasData ? "#60a5fa" : "#475569",
                        stroke: "#93c5fd",
                        strokeWidth: 1.5,
                        outline: "none",
                        cursor: "pointer",
                        filter: "brightness(1.2)",
                      },
                      pressed: {
                        outline: "none",
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Animated hotspot markers */}
          {!isLoading && mapMarkers.map(({ name, coordinates, intensity }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle
                r={6 * intensity}
                fill="#3b82f6"
                fillOpacity={0.5}
                stroke="#60a5fa"
                strokeWidth={2}
                className="animate-pulse"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))",
                }}
              />
            </Marker>
          ))}

          {activeCountryInfo && (
            <Marker coordinates={activeCountryInfo.coordinates}>
              <circle r={8} fill="#F59E0B" fillOpacity="0.3" className="animate-ping" />
              <g
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(-12, -24)"
              >
                <line x1="4" x2="4" y1="22" y2="15" />
                <path
                  d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                  fill="#F59E0B"
                  fillOpacity="0.2"
                />
              </g>
              <circle r={2} fill="#F59E0B" />
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
          }}
        >
          <div className="bg-slate-900 border border-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-xl">
            {tooltip.content}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}
