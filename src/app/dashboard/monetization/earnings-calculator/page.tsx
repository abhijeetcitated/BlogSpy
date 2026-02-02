import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { EarningsCalculator } from "@/features/monetization"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function EarningsCalculatorPage() {
  if (!FEATURE_FLAGS.EARNINGS_CALC) {
    return <FeatureLocked title="Earnings Calculator is disabled" />
  }

  return (
    <ErrorBoundary>
      <EarningsCalculator />
    </ErrorBoundary>
  )
}
