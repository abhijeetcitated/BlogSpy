import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/layout"
import { CompetitorGapContent } from "@/components/features"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "Competitor Gap Demo - BlogSpy | Find Content Opportunities",
  description: "Try our competitor gap analysis. Discover keywords your competitors rank for but you don't. Sign up for full access.",
}

export default function CompetitorGapDemoPage() {
  return (
    <DemoWrapper
      featureName="Competitor Gap"
      featureDescription="Analyze unlimited competitors with keyword gap analysis and content opportunity scores."
      dashboardPath="/dashboard/research/gap-analysis"
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <CompetitorGapContent />
        </SidebarInset>
      </SidebarProvider>
    </DemoWrapper>
  )
}
