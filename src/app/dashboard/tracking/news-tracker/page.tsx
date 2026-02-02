import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { NewsTrackerContent } from "@/features/news-tracker"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function NewsTrackerPage() {
  if (!FEATURE_FLAGS.NEWS_TRACKER) {
    return <FeatureLocked title="News Tracker is disabled" />
  }

  return (
    <ErrorBoundary>
      <NewsTrackerContent />
    </ErrorBoundary>
  )
}
