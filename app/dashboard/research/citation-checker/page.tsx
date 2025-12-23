import { CitationCheckerContent } from "@/components/features/citation-checker"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function CitationCheckerPage() {
  return (
    <ErrorBoundary>
      <CitationCheckerContent />
    </ErrorBoundary>
  )
}
