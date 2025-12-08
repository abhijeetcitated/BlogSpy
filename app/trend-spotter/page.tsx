import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { TrendSpotterContent } from "@/components/trend-spotter-content"

export default function TrendSpotterPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <TrendSpotterContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
