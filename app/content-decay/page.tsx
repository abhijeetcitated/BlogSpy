import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { ContentDecayContent } from "@/components/content-decay-content"

export default function ContentDecayPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <ContentDecayContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
