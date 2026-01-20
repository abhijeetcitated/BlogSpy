import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { SocialTrackerContent } from "@/src/features/social-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function SocialTrackerPage() {
  if (!FEATURE_FLAGS.SOCIAL_TRACKER) {
    return <FeatureLocked title="Social Tracker is disabled" />
  }

  return (
    <ErrorBoundary>
      <SocialTrackerContent />
    </ErrorBoundary>
  )
}
