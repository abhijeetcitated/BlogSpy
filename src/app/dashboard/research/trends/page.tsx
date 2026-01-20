import { TrendSpotter } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function TrendsPage() {
  return (
    <ErrorBoundary>
      <TrendSpotter />
    </ErrorBoundary>
  )
}


