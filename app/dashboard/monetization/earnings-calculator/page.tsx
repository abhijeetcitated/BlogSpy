import { EarningsCalculator } from "@/src/features/monetization"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function EarningsCalculatorPage() {
  return (
    <ErrorBoundary>
      <EarningsCalculator />
    </ErrorBoundary>
  )
}
