import { CannibalizationContent } from "@features/cannibalization"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function CannibalizationPage() {
  return (
    <ErrorBoundary>
      <CannibalizationContent />
    </ErrorBoundary>
  )
}

