"use client"

import { 
  ExternalLink, 
  Star, 
  Clock, 
  DollarSign,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AFFILIATE_PROGRAMS } from "../constants"
import { PROGRAM_ICONS } from "../constants/icons"

export function TopProgramsCard() {
  const topPrograms = AFFILIATE_PROGRAMS
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-purple-500" />
        Top Affiliate Programs
      </h3>
      <div className="space-y-3">
        {topPrograms.map(program => {
          const programIcon = PROGRAM_ICONS[program.id]
          const ProgramIcon = programIcon?.icon || Globe
          return (
            <div 
              key={program.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50",
                programIcon?.color
              )}>
                <ProgramIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{program.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {program.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {program.commissionRate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {program.cookieDuration}d cookie
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    {program.rating}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
