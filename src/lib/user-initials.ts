export function getUserInitials(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || (email && email.trim()) || "U"
  const firstChar = source.charAt(0)
  return firstChar ? firstChar.toUpperCase() : "U"
}
