import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { CommerceTrackerContent } from "@/src/features/commerce-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CommerceTrackerPage() {
  if (!FEATURE_FLAGS.COMMERCE_TRACKER) {
    return <FeatureLocked title="Commerce Tracker is disabled" />
  }

  return (
    <ErrorBoundary>
      <CommerceTrackerContent />
    </ErrorBoundary>
  )
}
