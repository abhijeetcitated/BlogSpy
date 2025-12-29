"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Redirect to the main AI Writer route which has proper layout
export default function AIWriterRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Preserve any query params when redirecting
    const params = searchParams.toString()
    const targetUrl = params ? `/ai-writer?${params}` : "/ai-writer"
    router.replace(targetUrl)
  }, [router, searchParams])
  
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-muted-foreground">
        Loading AI Writer...
      </div>
    </div>
  )
}
















