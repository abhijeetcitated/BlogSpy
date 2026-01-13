import { FEATURE_FLAGS } from "@/config/feature-flags"
import { notFound } from "next/navigation"
import { SnippetStealerContent } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function SnippetStealerPage() {
  if (!FEATURE_FLAGS.SNIPPET_STEALER) {
    return notFound()
  }

  return (
    <ErrorBoundary>
      <SnippetStealerContent />
    </ErrorBoundary>
  )
}























