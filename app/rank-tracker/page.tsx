import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { RankTrackerContent } from "@/components/rank-tracker-content"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Rank Tracker Demo - BlogSpy | Monitor Your Search Rankings",
  description: "Try our rank tracking tool. Monitor keyword positions across Google, Bing, and more. Sign up for full access.",
}

export default function RankTrackerDemoPage() {
  return (
    <DemoWrapper
      featureName="Rank Tracker"
      featureDescription="Track unlimited keywords with daily updates, competitor monitoring, and automated reports."
      dashboardPath="/dashboard/tracking/rank-tracker"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <RankTrackerContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
