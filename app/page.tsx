import { AppSidebar } from "@/components/layout"
import { CommandCenter } from "@/components/features"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-6">
          <CommandCenter />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
