import { VideoHijackContent } from "@features/video-hijack"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function VideoHijackPage() {
  return (
    <ErrorBoundary>
      <VideoHijackContent />
    </ErrorBoundary>
  )
}

