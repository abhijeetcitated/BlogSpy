import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { AffiliateFinderDashboard } from "@/src/features/affiliate-finder"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function AffiliateFinderPage() {
  if (!FEATURE_FLAGS.AFFILIATE_FINDER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <AffiliateFinderDashboard />
    </ErrorBoundary>
  )
}
