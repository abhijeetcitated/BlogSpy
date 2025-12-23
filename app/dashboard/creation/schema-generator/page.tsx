import { SchemaGeneratorDashboard } from "@/src/features/schema-generator/components"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function SchemaGeneratorPage() {
  return (
    <ErrorBoundary>
      <SchemaGeneratorDashboard />
    </ErrorBoundary>
  )
}
