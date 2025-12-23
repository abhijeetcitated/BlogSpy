import { SocialTrackerContent } from "@/src/features/social-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function SocialTrackerPage() {
  return (
    <ErrorBoundary>
      <SocialTrackerContent />
    </ErrorBoundary>
  )
}
