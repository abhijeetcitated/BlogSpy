import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { CommunityTrackerContent } from "@/src/features/community-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CommunityTrackerPage() {
  if (!FEATURE_FLAGS.COMMUNITY_TRACKER) {
    return <FeatureLocked title="Community Tracker is disabled" />
  }

  return (
    <ErrorBoundary>
      <CommunityTrackerContent />
    </ErrorBoundary>
  )
}
