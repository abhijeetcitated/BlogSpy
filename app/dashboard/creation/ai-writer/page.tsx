"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Inner component that uses useSearchParams
function AIWriterRedirect() {
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

// Wrapper with Suspense boundary for useSearchParams
export default function AIWriterRedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <AIWriterRedirect />
    </Suspense>
  )
}




















