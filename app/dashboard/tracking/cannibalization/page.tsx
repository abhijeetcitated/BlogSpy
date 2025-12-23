import { CannibalizationContent } from "@/components/features/cannibalization"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CannibalizationPage() {
  return (
    <ErrorBoundary>
      <CannibalizationContent />
    </ErrorBoundary>
  )
}
