import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/layout"
import { RankTrackerContent } from "@/components/features"
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
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col">
            <RankTrackerContent />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
