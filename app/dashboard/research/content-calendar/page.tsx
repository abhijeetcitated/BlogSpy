import { ContentCalendar } from "@/src/features/content-calendar"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function ContentCalendarPage() {
  return (
    <ErrorBoundary>
      <ContentCalendar />
    </ErrorBoundary>
  )
}
