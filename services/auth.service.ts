/**
 * Auth Service - Authentication and user management
 * Handles login, logout, registration, password reset, and user profile
 */

import { apiClient } from "./api-client"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
  credits: number
}

interface AuthResponse {
  success: boolean
  user: User
  token: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  name: string
  email: string
  password: string
}

// Local storage keys
const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "user",
} as const

class AuthService {
  // Get current user from storage
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  // Get auth token
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth", {
      action: "login",
      ...credentials,
    })

    if (response.data.success) {
      this.setSession(response.data)
    }

    return response.data
  }

  // Register
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth", {
      action: "register",
      ...credentials,
    })

    if (response.data.success) {
      this.setSession(response.data)
    }

    return response.data
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth", { action: "logout" })
    } catch {
      // Continue with logout even if API call fails
    } finally {
      this.clearSession()
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>("/api/auth", {
      action: "forgot-password",
      email,
    })

    return response.data
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>("/api/auth", {
      action: "reset-password",
      token,
      password: newPassword,
    })

    return response.data
  }

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<{ user: User }>("/api/auth", {
      action: "update-profile",
      ...data,
    })

    if (response.data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user))
    }

    return response.data.user
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>("/api/auth", {
      action: "change-password",
      currentPassword,
      newPassword,
    })

    return response.data
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>("/api/auth", {
        action: "refresh-token",
      })

      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token)
        return response.data.token
      }
    } catch {
      this.clearSession()
    }

    return null
  }

  // Private: Set session data
  private setSession(data: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
  }

  // Private: Clear session data
  private clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export types
export type { User, AuthResponse, LoginCredentials, RegisterCredentials }
