import { AffiliateFinderDashboard } from "@/src/features/affiliate-finder"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function AffiliateFinderPage() {
  return (
    <ErrorBoundary>
      <AffiliateFinderDashboard />
    </ErrorBoundary>
  )
}
