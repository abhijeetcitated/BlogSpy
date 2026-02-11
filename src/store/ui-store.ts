// ============================================
// UI STORE (Zustand)
// ============================================
// Global UI state management
// ============================================

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Theme
  theme: "light" | "dark" | "system"
  
  // Command Palette
  commandPaletteOpen: boolean
  
  // Modals
  pricingModalOpen: boolean
  settingsModalOpen: boolean
  createProjectModalOpen: boolean
  
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleCommandPalette: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  openPricingModal: () => void
  closePricingModal: () => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
  openCreateProjectModal: () => void
  closeCreateProjectModal: () => void
  setCreateProjectModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: "dark",
      commandPaletteOpen: false,
      pricingModalOpen: false,
      settingsModalOpen: false,
      createProjectModalOpen: false,

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        if (typeof window !== "undefined") {
          const root = document.documentElement
          root.classList.remove("light", "dark")
          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            root.classList.add(systemTheme)
          } else {
            root.classList.add(theme)
          }
        }
      },
      
      toggleCommandPalette: () => 
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      openPricingModal: () => set({ pricingModalOpen: true }),
      closePricingModal: () => set({ pricingModalOpen: false }),
      
      openSettingsModal: () => set({ settingsModalOpen: true }),
      closeSettingsModal: () => set({ settingsModalOpen: false }),

      openCreateProjectModal: () => set({ createProjectModalOpen: true }),
      closeCreateProjectModal: () => set({ createProjectModalOpen: false }),
      setCreateProjectModalOpen: (open) => set({ createProjectModalOpen: open }),
    }),
    {
      name: "blogspy-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
