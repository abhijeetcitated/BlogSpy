import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/shared/layout"
import { ContentDecayContent } from "@features/content-decay"
import { DemoWrapper } from "@/components/shared/common/demo-wrapper"

export const metadata = {
  title: "Content Decay Demo - BlogSpy | Revive Declining Content",
  description: "Try our content decay analyzer. Find and fix declining content before it's too late. Sign up for full access.",
}

export default function ContentDecayDemoPage() {
  return (
    <DemoWrapper
      featureName="Content Decay"
      featureDescription="Monitor unlimited pages with automated decay alerts and AI-powered refresh suggestions."
      dashboardPath="/dashboard/tracking/decay"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <ContentDecayContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}

