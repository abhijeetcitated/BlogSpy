import { ContentROIDashboard } from "@/src/features/content-roi"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function ContentROIPage() {
  return (
    <ErrorBoundary>
      <ContentROIDashboard />
    </ErrorBoundary>
  )
}
