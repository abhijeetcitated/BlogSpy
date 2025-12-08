import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { OnPageCheckerContent } from "@/components/on-page-checker-content"

export default function OnPageCheckerPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <OnPageCheckerContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
