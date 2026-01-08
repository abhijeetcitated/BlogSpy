// ============================================
// 🔐 DATA ACCESS LAYER - Index
// ============================================
// Centralized exports for secure data access.
// All modules use React Taint API to prevent data leaks.
// ============================================

import "server-only"

// Re-export all user DAL functions and types
export {
  // Types - Safe DTOs
  type UserDTO,
  type UserProfile,
  
  // Public API - Safe to pass to Client Components
  getCurrentUser,
  getUserById,
  getUserProfile,
  hasRole,
  isAdmin,
} from "./user"

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// ✅ SAFE: Passing user to Client Component
import { getCurrentUser } from "@/src/lib/dal"

export default async function Page() {
  const user = await getCurrentUser()
  return <ClientComponent user={user} />  // ✅ OK - UserDTO is safe
}

// ✅ Server-side data access with taint protection
import { getUserById } from "@/src/lib/dal"

export default async function AdminPage() {
  const serverData = await getUserById(userId)  // Tainted internally
  // Can use serverData here on server, but can't pass raw to client
  return <AdminView credits={serverData?.credits} />  // ✅ Pass primitives only
}

// ✅ CORRECT: Require authenticated user
import { requireCurrentUser } from "@/src/lib/dal"

export default async function ProtectedPage() {
  const user = await requireCurrentUser()  // Throws if not authenticated
  return <Dashboard user={user} />
}
*/
