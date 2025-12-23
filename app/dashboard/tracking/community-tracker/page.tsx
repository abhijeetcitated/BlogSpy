import { CommunityTrackerContent } from "@/src/features/community-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CommunityTrackerPage() {
  return (
    <ErrorBoundary>
      <CommunityTrackerContent />
    </ErrorBoundary>
  )
}
