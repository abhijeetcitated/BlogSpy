import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { QueryProvider } from "@/contexts/query-provider"
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
export const metadata: Metadata = {
  title: {
    default: "BlogSpy - AI-Powered SEO Intelligence Platform",
    template: "%s | BlogSpy",
  },
  description: "AI-Powered SEO Intelligence Platform for keyword research, rank tracking, content optimization, and competitor analysis.",
  keywords: ["SEO", "keyword research", "rank tracking", "content optimization", "competitor analysis", "AI writer"],
  authors: [{ name: "BlogSpy" }],
  creator: "BlogSpy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BlogSpy",
    title: "BlogSpy - AI-Powered SEO Intelligence Platform",
    description: "AI-Powered SEO Intelligence Platform for keyword research, rank tracking, content optimization, and competitor analysis.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "BlogSpy - AI-Powered SEO Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogSpy - AI-Powered SEO Intelligence Platform",
    description: "AI-Powered SEO Intelligence Platform for keyword research, rank tracking, and content optimization.",
    images: ["/og-image.svg"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // <CHANGE> Added dark class by default for dark mode theme
    // suppressHydrationWarning added to fix browser extension (Grammarly) hydration mismatch
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <UserProvider>
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </UserProvider>
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
