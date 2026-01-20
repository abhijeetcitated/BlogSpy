import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - BlogSpy",
  description: "Sign in or create an account to access BlogSpy SEO tools",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Intentionally minimal: auth pages bring their own full-screen layout (v0 AuthPage)
  return children
}
