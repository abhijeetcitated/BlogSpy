// ============================================
// AI WRITER - Toast Notification Component
// ============================================

"use client"

import { CheckCircle2 } from "lucide-react"

interface ToastNotificationProps {
  show: boolean
  message: string
}

export function ToastNotification({ show, message }: ToastNotificationProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <span className="text-sm text-foreground">{message}</span>
      </div>
    </div>
  )
}
