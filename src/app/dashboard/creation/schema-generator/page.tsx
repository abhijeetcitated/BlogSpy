import { SchemaGeneratorDashboard } from "@/features/schema-generator/components"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function SchemaGeneratorPage() {
  return (
    <ErrorBoundary>
      <SchemaGeneratorDashboard />
    </ErrorBoundary>
  )
}
