import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/layout"
import { SettingsContent } from "@/components/features"

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
