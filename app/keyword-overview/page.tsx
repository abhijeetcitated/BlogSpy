import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { KeywordOverviewContent } from "@/components/keyword-overview-content"

export default function KeywordOverviewPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <KeywordOverviewContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
