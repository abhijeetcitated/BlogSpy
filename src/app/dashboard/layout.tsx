import { AppSidebar, TopNav } from "@/components/shared/layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
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
  // Use getUser() for server-side JWT validation (not getSession which trusts the JWT without re-validation)
  const { data: { user } } = await supabase.auth.getUser()
  // Only fetch session token for client hydration if user is authenticated
  let serverAccessToken: string | null = null
  if (user) {
    const { data: { session } } = await supabase.auth.getSession()
    serverAccessToken = session?.access_token ?? null
  }

  return (
    <AuthProvider serverAccessToken={serverAccessToken}>
      <UserProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <TopNav />
            <div role="main" className={`flex-1 ${PAGE_PADDING.default} overflow-auto`}>
              <div className="max-w-480 mx-auto">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </UserProvider>
    </AuthProvider>
  )
}






















