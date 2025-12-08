import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { TrendSpotter } from "@/components/trend-spotter-content"

export default function TrendSpotterPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <TrendSpotter />
      </SidebarInset>
    </SidebarProvider>
  )
}
