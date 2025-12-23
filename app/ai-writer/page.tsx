import { Suspense } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout"
import { AIWriterContent } from "@/src/features/ai-writer"

export const metadata = {
  title: "AI Writer - BlogSpy | AI-Powered Content Creation",
  description: "AI-powered content writer. Generate SEO-optimized blog posts, articles, and more.",
}

function AIWriterLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

export default function AIWriterPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <Suspense fallback={<AIWriterLoader />}>
          <AIWriterContent />
        </Suspense>
      </div>
    </SidebarProvider>
  )
}
