import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { RankTrackerContent } from "@/components/rank-tracker-content"

export default function RankTrackerPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <RankTrackerContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
