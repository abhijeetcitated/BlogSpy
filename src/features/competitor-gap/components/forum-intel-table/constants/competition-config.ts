import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { CompetitionLevel } from "../../../types"

export const COMPETITION_CONFIG: Record<CompetitionLevel, { 
  icon: typeof CheckCircle
  label: string
  color: string
  bg: string
  border: string 
}> = {
  low: { 
    icon: CheckCircle, 
    label: "Low", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/30"
  },
  medium: { 
    icon: AlertTriangle, 
    label: "Medium", 
    color: "text-yellow-600 dark:text-yellow-400", 
    bg: "bg-yellow-500/10 dark:bg-yellow-500/15",
    border: "border-yellow-500/30"
  },
  high: { 
    icon: XCircle, 
    label: "High", 
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
}
