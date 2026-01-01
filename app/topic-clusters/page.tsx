import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/layout"
import { TopicClusterContent } from "@/components/features"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Topic Clusters Demo - BlogSpy | Build Content Authority",
  description: "Try our topic cluster tool. Organize content into strategic clusters for better SEO. Sign up for full access.",
}

export default function TopicClustersDemoPage() {
  return (
    <DemoWrapper
      featureName="Topic Clusters"
      featureDescription="Create unlimited topic clusters with AI-powered content suggestions and internal linking strategies."
      dashboardPath="/dashboard/strategy/topic-clusters"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col">
            <TopicClusterContent />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
