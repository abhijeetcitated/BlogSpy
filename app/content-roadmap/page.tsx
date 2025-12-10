import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { ContentRoadmapContent } from "@/components/content-roadmap-content"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Content Roadmap Demo - BlogSpy | Plan Your Content Strategy",
  description: "Try our content roadmap tool. Plan and schedule content for maximum impact. Sign up for full access.",
}

export default function ContentRoadmapDemoPage() {
  return (
    <DemoWrapper
      featureName="Content Roadmap"
      featureDescription="Create unlimited content calendars with AI prioritization and team collaboration."
      dashboardPath="/dashboard/strategy/roadmap"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <TopNav />
          <ContentRoadmapContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
