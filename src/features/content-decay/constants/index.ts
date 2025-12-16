// ============================================
// CONTENT DECAY - Constants
// ============================================

import type { AlertPreferences, DecayReasonDisplay } from "../types"

// Decay reason display mapping
export const DECAY_REASON_DISPLAY: DecayReasonDisplay = {
  Competitor: "Competitor Updated Content",
  Outdated: "Content Outdated",
  "Missing Keywords": "Missing LSI Keywords",
  "Schema Issues": "Missing Schema Markup",
  "Slow Load": "Slow Page Load",
}

// Default alert preferences
export const DEFAULT_ALERT_PREFS: AlertPreferences = {
  email: true,
  slack: false,
  whatsapp: true,
  push: true,
  criticalOnly: false,
  dailyDigest: true,
  instantAlerts: true,
}

// Matrix zone colors
export const ZONE_DOT_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  watch: "bg-amber-500",
  low: "bg-slate-500",
  stable: "bg-emerald-500",
}

export const ZONE_GLOW_COLORS: Record<string, string> = {
  critical: "shadow-red-500/50",
  watch: "shadow-amber-500/50",
  low: "shadow-slate-500/30",
  stable: "shadow-emerald-500/30",
}

// Alert severity colors
export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
}

// Channel button styles
export const CHANNEL_BUTTON_STYLES: Record<string, { active: string; inactive: string }> = {
  email: {
    active: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-blue-500/30 hover:text-blue-400",
  },
  slack: {
    active: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-purple-500/30 hover:text-purple-400",
  },
  whatsapp: {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-emerald-500/30 hover:text-emerald-400",
  },
  push: {
    active: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-amber-500/30 hover:text-amber-400",
  },
}

// Preference button styles
export const PREF_BUTTON_STYLES: Record<string, { active: string; inactive: string }> = {
  criticalOnly: {
    active: "bg-red-500/20 text-red-400 border-red-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-red-500/30 hover:text-red-400",
  },
  dailyDigest: {
    active: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-cyan-500/30 hover:text-cyan-400",
  },
  instantAlerts: {
    active: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    inactive: "bg-muted text-muted-foreground border-border hover:border-amber-500/30 hover:text-amber-400",
  },
}
