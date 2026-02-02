import { Suspense } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopNav } from "@/components/shared/layout"
import { SettingsContent } from "@features/settings"

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading settings...</div>}>
          <SettingsContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}

