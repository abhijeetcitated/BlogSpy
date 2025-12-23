import { CommerceTrackerContent } from "@/src/features/commerce-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CommerceTrackerPage() {
  return (
    <ErrorBoundary>
      <CommerceTrackerContent />
    </ErrorBoundary>
  )
}
