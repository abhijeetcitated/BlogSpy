"use client"

import { useState, useCallback } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps"
import { scaleLinear } from "d3-scale"

import type { TooltipState } from "../types"
import { geoUrl } from "../constants"
import { countryInterestData, mapMarkers } from "../__mocks__"

// D3 Color Scale for Heatmap (Blue gradient)
const colorScale = scaleLinear<string>()
  .domain([0, 50, 100])
  .range(["#1e293b", "#1e40af", "#3b82f6"]) // Slate-800 -> Blue-800 -> Blue-500

export function WorldMap() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: "",
    x: 0,
    y: 0,
  })

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

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 20],
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
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
        {mapMarkers.map(({ name, coordinates, intensity }) => (
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
