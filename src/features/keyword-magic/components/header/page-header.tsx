"use client"

// ============================================
// PAGE HEADER - Main page title and breadcrumb
// ============================================

import Link from "next/link"
import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title?: string
  description?: string
  showBreadcrumb?: boolean
  className?: string
}

export function PageHeader({
  title = "Keyword Magic Tool",
  description = "Discover keyword opportunities for your SEO strategy",
  showBreadcrumb = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {showBreadcrumb && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/dashboard/research" className="hover:text-foreground transition-colors">
            Research
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Keyword Magic</span>
        </nav>
      )}
      
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
