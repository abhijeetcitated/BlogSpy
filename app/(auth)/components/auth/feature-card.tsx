import type { ReactNode } from "react"

type FeatureCardProps = {
  icon: ReactNode
  title: string
  children: ReactNode
}

export function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
          {icon}
        </div>
        <div className="text-xs font-semibold text-zinc-200">{title}</div>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
