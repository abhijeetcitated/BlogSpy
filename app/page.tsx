import { AppSidebar, TopNav } from "@/components/layout"
import { CommandCenter } from "@/components/features"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CommandPaletteProvider } from "@/src/features/command-palette"

export default function DashboardPage() {
  return (
    <CommandPaletteProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <CommandCenter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}
