// ============================================
// USER STORE (Zustand)
// ============================================
// User state and credits management
// ============================================

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: "free" | "pro" | "agency"
}

interface UserState {
  // User data
  user: User | null
  isAuthenticated: boolean
  
  // Credits
  credits: number
  maxCredits: number
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  updateCredits: (credits: number) => void
  useCredits: (amount: number) => boolean
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
    (set, get) => ({
      // Initial state (demo mode)
      user: DEMO_USER,
      isAuthenticated: true,
      credits: 750,
      maxCredits: 1000,
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

      logout: () => 
        set({ 
          user: null, 
          isAuthenticated: false, 
          credits: 0,
          maxCredits: 0,
        }),
    }),
    {
      name: "blogspy-user-storage",
      partialize: (state) => ({
        user: state.user,
        credits: state.credits,
      }),
    }
  )
)
