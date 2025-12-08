import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AIWriterContent } from "@/components/ai-writer-content"

export default function AIWriterPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <AIWriterContent />
      </div>
    </SidebarProvider>
  )
}
