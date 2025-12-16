import { Suspense } from "react"
import { AppSidebar } from "@/components/layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { KeywordMagicContent } from "@/components/features"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Keyword Magic Demo - BlogSpy | Discover High-Value Keywords",
  description: "Try our keyword research tool. Find thousands of keyword ideas with search volume, difficulty, and CPC data. Sign up for full access.",
}

function KeywordMagicLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
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
            <Suspense fallback={<KeywordMagicLoading />}>
              <KeywordMagicContent />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
