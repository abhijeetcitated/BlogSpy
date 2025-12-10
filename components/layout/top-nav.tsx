"use client"

import { Search, Bell, Moon, Sun, ChevronRight, Home, Crown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function TopNav() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize theme on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
    // Ensure dark class is set on initial load
    if (!document.documentElement.classList.contains("dark") && !document.documentElement.classList.contains("light")) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/research/overview/${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Keyword Magic</span>
      </nav>

      {/* Global Search */}
      <div className="flex-1 max-w-md ml-auto md:ml-0 md:mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search for a keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-border"
          />
        </form>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Pricing/Plan Icon */}
        <Link href="/pricing">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-500 hover:text-amber-400">
            <Crown className="h-4 w-4" />
            <span className="sr-only">View Plans</span>
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
