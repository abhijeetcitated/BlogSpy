import { AIVisibilityDashboard } from "@/src/features/ai-visibility/components"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function AIVisibilityPage() {
  return (
    <ErrorBoundary>
      <AIVisibilityDashboard />
    </ErrorBoundary>
  )
}
