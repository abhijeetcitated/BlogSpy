import { AppSidebar, TopNav } from "@/components/layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CommandPaletteProvider } from "@/src/features/command-palette"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"

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
              <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </UserProvider>
    </AuthProvider>
  )
}













