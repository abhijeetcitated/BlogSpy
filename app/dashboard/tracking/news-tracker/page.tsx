import { NewsTrackerContent } from "@/src/features/news-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function NewsTrackerPage() {
  return (
    <ErrorBoundary>
      <NewsTrackerContent />
    </ErrorBoundary>
  )
}
