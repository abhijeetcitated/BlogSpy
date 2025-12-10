import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout"
import { AIWriterContent } from "@/components/features"
import { DemoWrapper } from "@/components/common/demo-wrapper"

export const metadata = {
  title: "AI Writer Demo - BlogSpy | AI-Powered Content Creation",
  description: "Try our AI-powered content writer. Generate SEO-optimized blog posts, articles, and more. Sign up for full access.",
}

export default function AIWriterDemoPage() {
  return (
    <DemoWrapper
      featureName="AI Writer"
      featureDescription="Generate unlimited SEO-optimized content with advanced AI models and real-time suggestions."
      dashboardPath="/dashboard/creation/ai-writer"
    >
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <AIWriterContent />
        </div>
      </SidebarProvider>
    </DemoWrapper>
  )
}
