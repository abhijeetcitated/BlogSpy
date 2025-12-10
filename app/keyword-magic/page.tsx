import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { KeywordMagicContent } from "@/components/keyword-magic-content"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Keyword Magic Demo - BlogSpy | Discover High-Value Keywords",
  description: "Try our keyword research tool. Find thousands of keyword ideas with search volume, difficulty, and CPC data. Sign up for full access.",
}

export default function KeywordMagicDemoPage() {
  return (
    <DemoWrapper
      featureName="Keyword Magic"
      featureDescription="Access unlimited keyword research with real-time data, competitor analysis, and export features."
      dashboardPath="/dashboard/research/keyword-magic"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <KeywordMagicContent />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
