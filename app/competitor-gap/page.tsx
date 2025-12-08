import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { CompetitorGapContent } from "@/components/competitor-gap-content"

export default function CompetitorGapPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <CompetitorGapContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
