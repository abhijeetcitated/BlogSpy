"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user-store"

import { AddProjectDialog } from "./AddProjectDialog"

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  IN: "🇮🇳",
  UK: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  GLOBAL: "🌍",
}

export function ProjectSwitcher() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const {
    projects,
    activeProject,
    setActiveProject,
    hasHydrated,
  } = useUserStore(
    useShallow((state) => ({
      projects: state.projects,
      activeProject: state.activeProject,
      setActiveProject: state.setActiveProject,
      hasHydrated: state.hasHydrated,
    }))
  )

  const activeLabel = activeProject?.projectname ?? "Create Project"
  const activeInitial = activeProject?.projectname?.charAt(0)?.toUpperCase() ?? "C"

  const triggerClassName =
    "flex w-full items-center justify-between rounded-lg border border-border bg-sidebar-accent/40 px-2 py-1.5 text-sm text-sidebar-foreground shadow-sm transition-colors hover:bg-sidebar-accent"

  const handleAddProject = () => setDialogOpen(true)

  const projectItems = useMemo(() => {
    return projects.map((project) => {
      const flag = COUNTRY_FLAGS[project.targetcountry] ?? "🌍"
      const isActive = activeProject?.id === project.id

      return (
        <DropdownMenuItem
          key={project.id}
          onSelect={() => setActiveProject(project)}
          className={cn("cursor-pointer", isActive && "bg-accent/60 text-foreground")}
        >
          <Avatar className="h-5 w-5 rounded-md">
            {project.icon ? (
              <AvatarImage src={project.icon} alt={project.projectname} className="rounded-md" />
            ) : null}
            <AvatarFallback className="rounded-md text-[10px] font-semibold uppercase">
              {project.projectname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{project.projectname}</span>
          <span className="ml-auto text-xs text-muted-foreground">{flag}</span>
        </DropdownMenuItem>
      )
    })
  }, [projects, activeProject, setActiveProject])

  if (!hasHydrated) {
    return <Skeleton className="h-10 w-full rounded-lg" />
  }

  return (
    <div className="space-y-2">
      {projects.length === 0 ? (
        <Button
          variant="outline"
          onClick={handleAddProject}
          className="w-full justify-between rounded-lg border-dashed border-border text-sm"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Plus className="h-4 w-4 text-amber-500" />
            <span>Create Project</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={triggerClassName}>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-5 w-5 rounded-md">
                  {activeProject?.icon ? (
                    <AvatarImage src={activeProject.icon} alt={activeLabel} className="rounded-md" />
                  ) : null}
                  <AvatarFallback className="rounded-md text-[10px] font-semibold uppercase">
                    {activeInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{activeLabel}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>My Projects</DropdownMenuLabel>
            <div className="max-h-60 overflow-y-auto">{projectItems}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                handleAddProject()
              }}
              className="cursor-pointer text-amber-500 focus:text-amber-500"
            >
              <Plus className="h-4 w-4 text-amber-500" />
              Add New Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AddProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
