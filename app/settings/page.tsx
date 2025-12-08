import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <SettingsContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
