import { AIVisibilityDashboard } from "@/features/ai-visibility"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function AIVisibilityPage() {
  return (
    <ErrorBoundary>
      <AIVisibilityDashboard />
    </ErrorBoundary>
  )
}
