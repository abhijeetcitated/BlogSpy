import { AppSidebar, TopNav } from "@/components/layout"
import { CommandCenter } from "@/components/features"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CommandPaletteProvider } from "@/src/features/command-palette"
import { PAGE_PADDING } from "@/src/styles"

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
