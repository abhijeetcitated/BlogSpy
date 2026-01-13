import { FEATURE_FLAGS } from "@/src/config/feature-flags"
import { notFound } from "next/navigation"
import { EarningsCalculator } from "@/src/features/monetization"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function EarningsCalculatorPage() {
  if (!FEATURE_FLAGS.EARNINGS_CALC) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <EarningsCalculator />
    </ErrorBoundary>
  )
}
