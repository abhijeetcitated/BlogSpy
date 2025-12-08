"use client"

interface CreditRingProps {
  used: number
  total: number
}

export function CreditRing({ used, total }: CreditRingProps) {
  const remaining = total - used
  const percentage = (remaining / total) * 100
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#creditGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-foreground">{remaining}</span>
          <span className="text-xs text-muted-foreground">/ {total}</span>
        </div>
      </div>
    </div>
  )
}
