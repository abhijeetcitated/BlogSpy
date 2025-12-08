import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { TopicClusterContent } from "@/components/topic-cluster-content"

export default function TopicClustersPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <TopNav />
        <TopicClusterContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
