import { CommandCenter } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <CommandCenter />
    </ErrorBoundary>
  )
}























