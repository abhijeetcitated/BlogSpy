import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/layout"
import { SnippetStealerContent } from "@/components/features"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Snippet Stealer Demo - BlogSpy | Win Featured Snippets",
  description: "Try our featured snippet tool. Analyze and steal snippets from competitors. Sign up for full access.",
}

export default function SnippetStealerDemoPage() {
  return (
    <DemoWrapper
      featureName="Snippet Stealer"
      featureDescription="Analyze unlimited snippets with optimization suggestions and competitor tracking."
      dashboardPath="/dashboard/creation/snippet-stealer"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <SnippetStealerContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
