import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { QueryProvider } from "@/contexts/query-provider"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { CommandMenu } from "@/components/shared/command-menu"
import { GlobalModals } from "@/components/shared/global-modals"
import { createServerClient } from "@/lib/supabase/server"
import "./globals.css"

// Geist - Vercel's premium sans-serif font
// Used for: UI text, buttons, labels, body copy
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700"],
})

// Geist Mono - Vercel's premium monospace font  
// Used for: Numbers, metrics, code, technical data
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
})

// Updated metadata for BlogSpy SEO Dashboard
const ogImageUrl = process.env.NEXT_PUBLIC_OG_IMAGE || "/og-image.svg"

export const metadata: Metadata = {
  title: {
    default: "BlogSpy - Modern SEO Tool",
    template: "%s | BlogSpy - Modern SEO Tool",
  },
  description: "Uncover hidden keyword opportunities, track viral trends, and hijack video traffic with AI-powered SEO intelligence.",
  keywords: ["SEO", "keyword research", "rank tracking", "content optimization", "competitor analysis", "AI writer"],
  authors: [{ name: "BlogSpy" }],
  creator: "BlogSpy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BlogSpy",
    title: "BlogSpy - Modern SEO Tool",
    description: "Uncover hidden keyword opportunities, track viral trends, and hijack video traffic with AI-powered SEO intelligence.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "BlogSpy - Modern SEO Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogSpy - Modern SEO Tool",
    description: "Uncover hidden keyword opportunities, track viral trends, and hijack video traffic with AI-powered SEO intelligence.",
    images: [ogImageUrl],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const serverAccessToken = session?.access_token ?? null

  return (
    // suppressHydrationWarning added to fix browser extension (Grammarly) hydration mismatch
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" storageKey="blogspy-theme">
          <QueryProvider>
            <AuthProvider serverAccessToken={serverAccessToken}>
              <UserProvider>
                <Suspense fallback={null}>{children}</Suspense>
                <CommandMenu />
                <GlobalModals />
              </UserProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>

        {/* Global toasts (Sonner) */}
        <Toaster theme="system" richColors position="top-right" closeButton />

        <Analytics />
      </body>
    </html>
  )
}
