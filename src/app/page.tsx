import { AppSidebar, TopNav } from "@/components/shared/layout"
import { CommandCenter } from "@features/dashboard"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CommandPaletteProvider } from "@/features/command-palette"
import { PAGE_PADDING } from "@/styles"

export default function DashboardPage() {
  return (
    <CommandPaletteProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <main className={`flex-1 ${PAGE_PADDING.default}`}>
            <CommandCenter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}
