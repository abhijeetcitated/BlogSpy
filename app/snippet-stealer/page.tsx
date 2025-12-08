import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SnippetStealerContent } from "@/components/snippet-stealer-content"

export default function SnippetStealerPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <TopNav />
        <SnippetStealerContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
