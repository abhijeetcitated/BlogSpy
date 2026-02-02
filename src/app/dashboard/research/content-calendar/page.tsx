import { ContentCalendar } from "@/features/content-calendar"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

export default function ContentCalendarPage() {
  return (
    <ErrorBoundary>
      <ContentCalendar />
    </ErrorBoundary>
  )
}
