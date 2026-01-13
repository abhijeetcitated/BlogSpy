import { FEATURE_FLAGS } from "@/src/config/feature-flags"
import { notFound } from "next/navigation"
import { ContentROIDashboard } from "@/src/features/content-roi"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function ContentROIPage() {
  if (!FEATURE_FLAGS.CONTENT_ROI) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <ContentROIDashboard />
    </ErrorBoundary>
  )
}
