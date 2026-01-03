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
  type UserProfileDTO,
  
  // Public API - Safe to pass to Client Components
  getCurrentUser,
  getUserProfile,
  
  // Auth Helpers
  requireAuth,
  requireAdmin,
  
  // Internal API - Tainted (server-only operations)
  _getUserWithSensitiveData,
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

// ❌ UNSAFE: This will throw a React error
import { _getUserWithSensitiveData } from "@/src/lib/dal"

export default async function Page() {
  const sensitiveUser = await _getUserWithSensitiveData(userId)
  return <ClientComponent data={sensitiveUser} />  // ❌ THROWS - Tainted!
}

// ✅ CORRECT: Use sensitive data server-side only
import { _getUserWithSensitiveData } from "@/src/lib/dal"

async function verifyPassword(userId: string, password: string) {
  const sensitiveData = await _getUserWithSensitiveData(userId)
  const isValid = await bcrypt.compare(password, sensitiveData.passwordHash)
  return isValid  // ✅ OK - Only returning boolean, not sensitive data
}
*/
