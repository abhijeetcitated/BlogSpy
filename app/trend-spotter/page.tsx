import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { TrendSpotter } from "@/components/trend-spotter-content"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Trend Spotter Demo - BlogSpy | Catch Viral Topics Early",
  description: "Try our trend spotter tool. Find emerging topics before they go viral. Sign up for full access.",
}

export default function TrendSpotterDemoPage() {
  return (
    <DemoWrapper
      featureName="Trend Spotter"
      featureDescription="Get real-time trend alerts with virality predictions and content timing suggestions."
      dashboardPath="/dashboard/research/trends"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <TrendSpotter />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
