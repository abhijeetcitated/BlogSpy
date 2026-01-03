"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Loading placeholder
function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-xs text-muted-foreground">Loading map...</span>
      </div>
    </div>
  )
}

// Dynamic import with SSR disabled - react-simple-maps requires window object
export const WorldMap = dynamic(
  () => import("./world-map-client").then((mod) => mod.WorldMap),
  { 
    ssr: false,
    loading: () => <MapLoading />
  }
)
