"use client"

// ============================================
// Toast Notification Component
// ============================================

import { CheckCircle2 } from "lucide-react"

interface ToastNotificationProps {
  show: boolean
  message: string
}

export function ToastNotification({ show, message }: ToastNotificationProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="text-sm text-foreground">{message}</span>
      </div>
    </div>
  )
}
