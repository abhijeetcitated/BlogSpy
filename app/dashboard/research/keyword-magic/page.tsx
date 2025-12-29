import { KeywordMagicContent } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function KeywordMagicPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <KeywordMagicContent />
      </div>
    </ErrorBoundary>
  )
}
















