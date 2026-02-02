import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { OnPageCheckerContent } from "@features/on-page-checker"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function OnPageCheckerPage() {
  if (!FEATURE_FLAGS.ON_PAGE_CHECKER) {
    return <FeatureLocked title="On-Page Checker is disabled" />
  }

  return (
    <ErrorBoundary>
      <OnPageCheckerContent />
    </ErrorBoundary>
  )
}
























