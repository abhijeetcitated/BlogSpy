import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { OnPageCheckerContent } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function OnPageCheckerPage() {
  if (!FEATURE_FLAGS.ON_PAGE_CHECKER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <OnPageCheckerContent />
    </ErrorBoundary>
  )
}























