import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - CitaTed",
  description: "Sign in or create an account to access CitaTed SEO tools",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Intentionally minimal: auth pages bring their own full-screen layout (v0 AuthPage)
  return children
}
