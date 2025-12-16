"use client"

import { AlertCircle } from "lucide-react"

interface URLValidatorProps {
  url: string
  error?: string
}

export function URLValidator({ url, error }: URLValidatorProps) {
  if (!error || !url) return null

  return (
    <div className="text-xs mt-1 flex items-center gap-1 text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  )
}
