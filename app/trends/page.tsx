import { AppSidebar } from "@/components/app-sidebar"
import { TrendSpotter } from "@/components/trend-spotter"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function TrendsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-6">
          <TrendSpotter />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
