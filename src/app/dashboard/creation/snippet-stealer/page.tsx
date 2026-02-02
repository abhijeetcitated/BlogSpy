import { FeatureLocked } from "@/components/shared/feature-locked"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import { SnippetStealerContent } from "@features/snippet-stealer"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function SnippetStealerPage() {
  if (!FEATURE_FLAGS.SNIPPET_STEALER) {
    return <FeatureLocked title="Snippet Stealer is disabled" />
  }

  return (
    <ErrorBoundary>
      <SnippetStealerContent />
    </ErrorBoundary>
  )
}
























