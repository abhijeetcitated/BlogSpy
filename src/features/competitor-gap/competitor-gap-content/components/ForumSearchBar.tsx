"use client"

import { Search, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ForumSearchBar() {
  return (
    <div className="py-3 sm:py-4 border-b border-border bg-muted/30 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter your niche or topic..."
            className="pl-10 h-10 bg-background border-border"
          />
        </div>
        <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium">
          <TrendingUp className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">Find Opportunities</span>
          <span className="xs:hidden">Find</span>
        </Button>
      </div>
    </div>
  )
}
