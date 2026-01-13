import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { SocialTrackerContent } from "@/src/features/social-tracker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function SocialTrackerPage() {
  if (!FEATURE_FLAGS.SOCIAL_TRACKER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <SocialTrackerContent />
    </ErrorBoundary>
  )
}
