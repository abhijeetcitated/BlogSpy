import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/src/config/feature-flags"
import { ContentROIDashboard } from "@/src/features/content-roi"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function ContentROIPage() {
  if (!FEATURE_FLAGS.CONTENT_ROI) {
    return <FeatureLocked title="Content ROI is disabled" />
  }

  return (
    <ErrorBoundary>
      <ContentROIDashboard />
    </ErrorBoundary>
  )
}
