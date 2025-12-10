import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { OnPageCheckerContent } from "@/components/on-page-checker-content"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "On-Page Checker Demo - BlogSpy | Optimize Your Content",
  description: "Try our on-page SEO checker. Get actionable optimization suggestions. Sign up for full access.",
}

export default function OnPageCheckerDemoPage() {
  return (
    <DemoWrapper
      featureName="On-Page Checker"
      featureDescription="Analyze unlimited pages with detailed SEO audits and fix recommendations."
      dashboardPath="/dashboard/creation/on-page"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <OnPageCheckerContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
