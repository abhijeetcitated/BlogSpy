import { createServerClient } from "@/lib/supabase/server"
import { AppSidebarClient } from "./app-sidebar-client"
import { getProjects } from "@/features/dashboard/actions/get-projects"
import type { ProjectSummary } from "@/features/dashboard/actions/get-projects"

export async function AppSidebar() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  let projects: ProjectSummary[] = []

  if (data.user) {
    try {
      const result = await getProjects({})
      projects = result?.data ?? []
    } catch (error) {
      console.error("[AppSidebar] Failed to load projects from DB:", error instanceof Error ? error.message : error)
      projects = []
    }
  }

  return (
    <AppSidebarClient
      serverIsAuthenticated={!!data.user}
      projects={projects}
    />
  )
}
