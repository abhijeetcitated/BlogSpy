import { AppSidebar, TopNav } from "@/components/layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CommandPaletteProvider } from "@/src/features/command-palette"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { PAGE_PADDING } from "@/src/styles"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <UserProvider>
        <CommandPaletteProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <TopNav />
              <main className={`flex-1 ${PAGE_PADDING.default} overflow-auto`}>
                <div className="max-w-[1920px] mx-auto">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </UserProvider>
    </AuthProvider>
  )
}






















