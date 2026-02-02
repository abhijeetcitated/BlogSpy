import { CommandCenter } from "@features/dashboard"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <CommandCenter />
    </ErrorBoundary>
  )
}
























