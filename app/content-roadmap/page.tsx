import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { ContentRoadmapContent } from "@/components/content-roadmap-content"

export default function ContentRoadmapPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <TopNav />
        <ContentRoadmapContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
