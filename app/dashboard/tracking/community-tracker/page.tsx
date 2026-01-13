import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { CommunityTrackerContent } from "@/src/features/community-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CommunityTrackerPage() {
  if (!FEATURE_FLAGS.COMMUNITY_TRACKER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <CommunityTrackerContent />
    </ErrorBoundary>
  )
}
