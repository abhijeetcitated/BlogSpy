import { AppSidebar, TopNav } from "@/components/shared/layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CommandPaletteProvider } from "@/features/command-palette"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { PAGE_PADDING } from "@/styles"
import { createServerClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const serverAccessToken = session?.access_token ?? null

  return (
    <AuthProvider serverAccessToken={serverAccessToken}>
      <UserProvider>
        <CommandPaletteProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <TopNav />
              <div role="main" className={`flex-1 ${PAGE_PADDING.default} overflow-auto`}>
                <div className="max-w-[1920px] mx-auto">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </UserProvider>
    </AuthProvider>
  )
}






















