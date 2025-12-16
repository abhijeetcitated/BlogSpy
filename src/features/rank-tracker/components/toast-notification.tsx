// ============================================
// RANK TRACKER - Toast Notification Component
// ============================================

"use client"

import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export type ToastType = "success" | "error" | "info"

interface ToastNotificationProps {
  isVisible: boolean
  message: string
  type?: ToastType
  onClose: () => void
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const TOAST_STYLES = {
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "text-emerald-500",
    text: "text-emerald-400",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "text-red-500",
    text: "text-red-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "text-blue-500",
    text: "text-blue-400",
  },
}

/**
 * Toast notification component
 */
export function ToastNotification({
  isVisible,
  message,
  type = "success",
  onClose,
}: ToastNotificationProps) {
  if (!isVisible) return null

  const IconComponent = TOAST_ICONS[type]
  const style = TOAST_STYLES[type]

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border} shadow-lg backdrop-blur-sm`}
      >
        <IconComponent className={`w-5 h-5 ${style.icon}`} />
        <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-2"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
