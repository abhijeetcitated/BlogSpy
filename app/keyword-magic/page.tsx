import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { KeywordMagicContent } from "@/components/keyword-magic-content"

export default function KeywordMagicPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <KeywordMagicContent />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
