"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useShallow } from "zustand/shallow"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useUIStore } from "@/store/ui-store"
import { useUserStore } from "@/store/user-store"
import { commandConfig, commandIcons } from "@/config/command-menu"

export function CommandMenu() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    openCreateProjectModal,
  } = useUIStore(
    useShallow((state) => ({
      commandPaletteOpen: state.commandPaletteOpen,
      setCommandPaletteOpen: state.setCommandPaletteOpen,
      openCreateProjectModal: state.openCreateProjectModal,
    }))
  )

  const { projects, setActiveProject } = useUserStore(
    useShallow((state) => ({
      projects: state.projects,
      setActiveProject: state.setActiveProject,
    }))
  )

  const navigationCommands = useMemo(
    () => commandConfig.filter((item) => item.group === "navigation"),
    []
  )
  const actionCommands = useMemo(
    () => commandConfig.filter((item) => item.group === "actions"),
    []
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleNavigate = (href?: string) => {
    if (!href) return
    setCommandPaletteOpen(false)
    router.push(href)
  }

  const handleAction = (action?: string) => {
    setCommandPaletteOpen(false)
    if (action === "create-project") {
      openCreateProjectModal()
      return
    }
    if (action === "add-keyword") {
      router.push("/dashboard/research/keyword-magic")
    }
  }

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project) return
    setActiveProject(project)
    setCommandPaletteOpen(false)
    toast.success(`Switched to ${project.projectname}`)
  }

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      contentClassName="top-[10%] translate-y-0 w-[calc(100%-2rem)] max-w-2xl border border-border bg-card shadow-2xl sm:rounded-xl [&>button]:hidden"
      commandClassName="rounded-xl bg-card"
    >
      <Command className="rounded-xl bg-card">
        <CommandInput
          placeholder="Search commands, projects, or pages..."
          value={query}
          onValueChange={setQuery}
          className="h-12 text-sm sm:text-base"
        />
        <CommandList className="max-h-100 py-2">
          <CommandEmpty>No results found.</CommandEmpty>

          {projects.length > 0 && (
            <CommandGroup heading="Projects" className="px-2">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.projectname} ${project.domain ?? ""}`}
                  onSelect={() => handleProjectSelect(project.id)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-foreground"
                >
                  <span className="truncate">{project.projectname}</span>
                  <span className="ml-auto text-xs text-muted-foreground truncate">
                    {project.domain}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Navigation" className="px-2">
            {navigationCommands.map((item) => {
              const Icon = commandIcons[item.icon]
              return (
                <CommandItem
                  key={item.title}
                  value={`${item.title} ${item.keywords.join(" ")}`}
                  onSelect={() => handleNavigate(item.href)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-foreground"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions" className="px-2">
            {actionCommands.map((item) => {
              const Icon = commandIcons[item.icon]
              return (
                <CommandItem
                  key={item.title}
                  value={`${item.title} ${item.keywords.join(" ")}`}
                  onSelect={() => handleAction(item.action)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-foreground"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
