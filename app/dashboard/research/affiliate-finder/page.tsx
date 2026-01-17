import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { AffiliateFinderDashboard } from "@/src/features/affiliate-finder"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function AffiliateFinderPage() {
  if (!FEATURE_FLAGS.AFFILIATE_FINDER) {
    return <FeatureLocked title="Affiliate Finder is disabled" />
  }

  return (
    <ErrorBoundary>
      <AffiliateFinderDashboard />
    </ErrorBoundary>
  )
}
