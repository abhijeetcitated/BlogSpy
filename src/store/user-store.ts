// ============================================
// USER STORE (Zustand)
// ============================================
// User state and credits management
// ============================================

import { create } from "zustand"
import { persist } from "zustand/middleware"

type TargetCountry = string

interface UserProject {
  id: string
  userid: string
  projectname: string
  domain: string
  targetcountry: TargetCountry
  icon?: string | null
  gscpropertyid?: string | null
  createdat: string
  updatedat: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: "free" | "pro" | "agency"
}

type ProjectChannelMessage =
  | {
      type: "PROJECTS_SYNC"
      sourceId: string
      projects: UserProject[]
      activeProjectId: string | null
    }
  | {
      type: "PROJECT_ACTIVE_CHANGED"
      sourceId: string
      activeProjectId: string | null
    }

type ProjectChannelBroadcastMessage =
  | {
      type: "PROJECTS_SYNC"
      projects: UserProject[]
      activeProjectId: string | null
    }
  | {
      type: "PROJECT_ACTIVE_CHANGED"
      activeProjectId: string | null
    }

const PROJECT_CHANNEL_NAME = "blogspy-project-context"
const PROJECT_TAB_ID =
  typeof window !== "undefined" && typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : typeof window !== "undefined"
      ? `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`
      : null

let projectChannel: BroadcastChannel | null = null
let isDocumentVisible = true
let pendingProjectMessage: ProjectChannelMessage | null = null

function getProjectChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null
  if (!projectChannel) {
    projectChannel = new BroadcastChannel(PROJECT_CHANNEL_NAME)
  }
  return projectChannel
}

function scheduleBroadcast(message: ProjectChannelBroadcastMessage) {
  if (!PROJECT_TAB_ID) return
  const channel = getProjectChannel()
  if (!channel) return
  const payload = { ...message, sourceId: PROJECT_TAB_ID }
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => channel.postMessage(payload), { timeout: 200 })
  } else {
    setTimeout(() => channel.postMessage(payload), 0)
  }
}

function areProjectsEqual(a: UserProject[], b: UserProject[]) {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i]
    const right = b[i]
    if (!right) return false
    if (
      left.id !== right.id ||
      left.updatedat !== right.updatedat ||
      left.projectname !== right.projectname ||
      left.domain !== right.domain ||
      left.targetcountry !== right.targetcountry ||
      left.icon !== right.icon ||
      left.gscpropertyid !== right.gscpropertyid
    ) {
      return false
    }
  }
  return true
}

function resolveActiveProject(
  projects: UserProject[],
  preferredProjectId: string | null
): { activeProject: UserProject | null; activeProjectId: string | null } {
  if (projects.length === 0) {
    return { activeProject: null, activeProjectId: null }
  }

  if (preferredProjectId) {
    const match = projects.find((project) => project.id === preferredProjectId)
    if (match) {
      return { activeProject: match, activeProjectId: match.id }
    }
  }

  return { activeProject: projects[0], activeProjectId: projects[0].id }
}

interface UserState {
  // User data
  user: User | null
  isAuthenticated: boolean
  
  // Credits
  credits: number
  maxCredits: number

  // Projects
  projects: UserProject[]
  activeProject: UserProject | null
  activeProjectId: string | null

  // Hydration
  hasHydrated: boolean
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  updateCredits: (credits: number) => void
  useCredits: (amount: number) => boolean
  setProjects: (projects: UserProject[]) => void
  setActiveProject: (project: UserProject | null) => void
  setActiveProjectId: (projectId: string | null) => void
  addProject: (project: UserProject) => void
  removeProject: (projectId: string) => void
  setHasHydrated: (hydrated: boolean) => void
  logout: () => void
}

// Default user for demo
const DEMO_USER: User = {
  id: "demo-user",
  name: "John Doe",
  email: "john@example.com",
  plan: "pro",
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => {
      const channel = getProjectChannel()
      const handleIncomingMessage = (message: ProjectChannelMessage) => {
        if (!message || typeof message !== "object") return
        if (!PROJECT_TAB_ID || message.sourceId === PROJECT_TAB_ID) return

        if (message.type === "PROJECTS_SYNC") {
          const current = get()
          if (
            areProjectsEqual(current.projects, message.projects) &&
            current.activeProjectId === message.activeProjectId
          ) {
            return
          }
          const resolved = resolveActiveProject(message.projects, message.activeProjectId)
          set({
            projects: message.projects,
            activeProject: resolved.activeProject,
            activeProjectId: resolved.activeProjectId,
          })
          return
        }

        if (message.type === "PROJECT_ACTIVE_CHANGED") {
          const { projects, activeProjectId } = get()
          if (activeProjectId === message.activeProjectId) return
          const resolved = resolveActiveProject(projects, message.activeProjectId)
          set({
            activeProject: resolved.activeProject,
            activeProjectId: resolved.activeProjectId,
          })
        }
      }

      if (typeof document !== "undefined") {
        isDocumentVisible = !document.hidden
        document.addEventListener("visibilitychange", () => {
          isDocumentVisible = !document.hidden
          if (isDocumentVisible && pendingProjectMessage) {
            const nextMessage = pendingProjectMessage
            pendingProjectMessage = null
            handleIncomingMessage(nextMessage)
          }
        })
      }

      if (channel) {
        channel.onmessage = (event: MessageEvent<ProjectChannelMessage>) => {
          const message = event.data
          if (!isDocumentVisible) {
            pendingProjectMessage = message
            return
          }
          handleIncomingMessage(message)
        }
      }

      return {
        // Initial state (demo mode)
        user: DEMO_USER,
        isAuthenticated: true,
        credits: 750,
        maxCredits: 1000,
        projects: [],
        activeProject: null,
        activeProjectId: null,
        hasHydrated: false,
        isLoading: false,

        // Actions
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            // Reset credits based on plan
            credits: user?.plan === "agency" ? 5000 : user?.plan === "pro" ? 1000 : 100,
            maxCredits: user?.plan === "agency" ? 5000 : user?.plan === "pro" ? 1000 : 100,
          }),

        updateCredits: (credits) => set({ credits }),

        useCredits: (amount) => {
          const { credits } = get()
          if (credits >= amount) {
            set({ credits: credits - amount })
            return true
          }
          return false
        },

        setProjects: (projects) => {
          const current = get()
          if (areProjectsEqual(current.projects, projects)) return
          const resolved = resolveActiveProject(projects, current.activeProjectId)
          set({
            projects,
            activeProject: resolved.activeProject,
            activeProjectId: resolved.activeProjectId,
          })
          scheduleBroadcast({
            type: "PROJECTS_SYNC",
            projects,
            activeProjectId: resolved.activeProjectId,
          })
        },

        setActiveProject: (project) => {
          const projectId = project?.id ?? null
          const current = get()
          if (current.activeProjectId === projectId) return
          const resolved = resolveActiveProject(current.projects, projectId)
          set({
            activeProject: resolved.activeProject,
            activeProjectId: resolved.activeProjectId,
          })
          scheduleBroadcast({
            type: "PROJECT_ACTIVE_CHANGED",
            activeProjectId: resolved.activeProjectId,
          })
        },

        setActiveProjectId: (projectId) => {
          const current = get()
          if (current.activeProjectId === projectId) return
          const resolved = resolveActiveProject(current.projects, projectId)
          set({
            activeProject: resolved.activeProject,
            activeProjectId: resolved.activeProjectId,
          })
          scheduleBroadcast({
            type: "PROJECT_ACTIVE_CHANGED",
            activeProjectId: resolved.activeProjectId,
          })
        },

        addProject: (project) => {
          const projects = get().projects
          const existingIndex = projects.findIndex((item) => item.id === project.id)
          const nextProjects =
            existingIndex >= 0
              ? projects.map((item, index) => (index === existingIndex ? project : item))
              : [project, ...projects]
          set({
            projects: nextProjects,
            activeProject: project,
            activeProjectId: project.id,
          })
          scheduleBroadcast({
            type: "PROJECTS_SYNC",
            projects: nextProjects,
            activeProjectId: project.id,
          })
        },

        removeProject: (projectId) => {
          const nextProjects = get().projects.filter((project) => project.id !== projectId)
          const resolved = resolveActiveProject(
            nextProjects,
            get().activeProjectId === projectId ? null : get().activeProjectId
          )
          set({
            projects: nextProjects,
            activeProject: resolved.activeProject,
            activeProjectId: resolved.activeProjectId,
          })
          scheduleBroadcast({
            type: "PROJECTS_SYNC",
            projects: nextProjects,
            activeProjectId: resolved.activeProjectId,
          })
        },

        setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            credits: 0,
            maxCredits: 0,
            projects: [],
            activeProject: null,
            activeProjectId: null,
          }),
      }
    },
    {
      name: "blogspy-user-storage",
      partialize: (state) => ({
        user: state.user,
        credits: state.credits,
        activeProjectId: state.activeProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
