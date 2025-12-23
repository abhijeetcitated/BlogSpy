/**
 * useAuth Hook
 * Authentication state and actions
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { authService, User } from "@/services"
import { getFeatureAccess, type FeatureAccess } from "@/lib/feature-access"

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  featureAccess: FeatureAccess
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  // Calculate feature access based on auth state
  const featureAccess = useMemo(() => {
    const isDemoUser = user?.email === "demo@blogspy.io"
    return getFeatureAccess(!!user, isDemoUser)
  }, [user])

  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Register handler
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true)
      try {
        const response = await authService.register({ name, email, password })
        setUser(response.user)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Logout handler
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh user data
  const refresh = useCallback(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  return {
    user,
    isAuthenticated: true, // TEMPORARY: Always authenticated during development
    isLoading: false,
    featureAccess,
    login,
    register,
    logout,
    refresh,
  }
}

export default useAuth
