import { AppSidebar } from "@/components/app-sidebar"
import { TrendSpotter } from "@/components/trend-spotter"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Trends Demo - BlogSpy | Discover Trending Topics",
  description: "Try our trend analysis tool. Find viral topics before they peak. Sign up for full access.",
}

export default function TrendsDemoPage() {
  return (
    <DemoWrapper
      featureName="Trend Analysis"
      featureDescription="Access real-time trend data, viral content alerts, and predictive analytics."
      dashboardPath="/dashboard/research/trends"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6">
            <TrendSpotter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
