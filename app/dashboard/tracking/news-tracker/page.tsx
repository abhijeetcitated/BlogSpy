import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { NewsTrackerContent } from "@/src/features/news-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function NewsTrackerPage() {
  // Feature flag guard - returns 404 if disabled
  if (!FEATURE_FLAGS.NEWS_TRACKER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <NewsTrackerContent />
    </ErrorBoundary>
  )
}
