import { createServerClient } from "@/lib/supabase/server"
import { AppSidebarClient } from "./app-sidebar-client"

export async function AppSidebar() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()

  return <AppSidebarClient serverIsAuthenticated={!!data.user} />
}
