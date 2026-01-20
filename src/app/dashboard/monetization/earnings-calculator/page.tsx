import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/src/config/feature-flags"
import { EarningsCalculator } from "@/src/features/monetization"
import { ErrorBoundary } from "@/components/common/error-boundary"

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
