import { ErrorBoundary } from "@/components/shared/common/error-boundary"
import { DashboardClient } from "@/features/dashboard/components/DashboardClient"

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardClient />
    </ErrorBoundary>
  )
}
























