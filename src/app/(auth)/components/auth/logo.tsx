import { Search } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
          <Search className="h-5 w-5 text-zinc-950" />
        </div>
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 opacity-40 blur-md -z-10 animate-gold-pulse" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-foreground">
        Blog<span className="text-amber-400">Spy</span>
      </span>
    </div>
  )
}
