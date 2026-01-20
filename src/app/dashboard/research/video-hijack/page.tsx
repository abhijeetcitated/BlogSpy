import { VideoHijackContent } from "@/components/features/video-hijack"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function VideoHijackPage() {
  return (
    <ErrorBoundary>
      <VideoHijackContent />
    </ErrorBoundary>
  )
}
