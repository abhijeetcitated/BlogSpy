import { TrendSpotter } from "@features/trend-spotter"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function TrendsPage() {
  return (
    <ErrorBoundary>
      <TrendSpotter />
    </ErrorBoundary>
  )
}



