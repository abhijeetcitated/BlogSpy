import { MessageSquare, Globe, FileText } from "lucide-react"
import { WeakSpotType, Intent } from "../types/weak-spot.types"

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getWeakSpotIcon = (type: WeakSpotType) => {
  switch (type) {
    case "reddit":
      return { icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/20" }
    case "quora":
      return { icon: MessageSquare, color: "text-red-400", bg: "bg-red-500/20" }
    case "linkedin":
      return { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/20" }
    case "medium":
      return { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/20" }
    case "forum":
      return { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/20" }
    default:
      return { icon: Globe, color: "text-muted-foreground", bg: "bg-muted/20" }
  }
}

export const getOpportunityStyle = (opportunity: string) => {
  switch (opportunity) {
    case "high":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "low":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

export const getIntentStyle = (intent: Intent) => {
  switch (intent) {
    case "commercial":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "transactional":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "informational":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "navigational":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}
