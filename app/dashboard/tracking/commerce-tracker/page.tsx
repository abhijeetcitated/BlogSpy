import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { CommerceTrackerContent } from "@/src/features/commerce-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CommerceTrackerPage() {
  if (!FEATURE_FLAGS.COMMERCE_TRACKER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <CommerceTrackerContent />
    </ErrorBoundary>
  )
}
