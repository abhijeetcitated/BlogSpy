import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/layout"
import { KeywordOverviewContent } from "@/components/features"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Keyword Overview Demo - BlogSpy | Deep Keyword Analysis",
  description: "Try our keyword overview tool. Get comprehensive keyword insights. Sign up for full access.",
}

export default function KeywordOverviewDemoPage() {
  return (
    <DemoWrapper
      featureName="Keyword Overview"
      featureDescription="Access detailed keyword metrics, SERP analysis, and historical data for any keyword."
      dashboardPath="/dashboard/research/overview"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <KeywordOverviewContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
