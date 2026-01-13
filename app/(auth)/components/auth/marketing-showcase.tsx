import { Sparkles, TrendingUp, Play } from "lucide-react"
import { FeatureCard } from "./feature-card"
import { QuoraIcon, RedditIcon } from "./icons"

export function MarketingShowcase() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.15),rgba(245,158,11,0.05),transparent_70%)]" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/8 blur-[120px]" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-8">
        <h1 className="mb-3 text-center text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl text-balance">
          The{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Modern Growth Engine
          </span>{" "}
          for 2026
        </h1>
        <p className="mb-8 max-w-lg text-center text-zinc-400 text-sm text-pretty">
          Dominate AI Overviews, hijack video SERPs, and find weak spots your competitors miss.
        </p>

        <div className="grid w-full max-w-3xl gap-4 grid-cols-3">
          <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="AI Visibility">
            <GEOScoreCard />
          </FeatureCard>

          <FeatureCard icon={<Play className="h-4 w-4" />} title="Video Hijack">
            <VideoHijackCard />
          </FeatureCard>

          <FeatureCard icon={<TrendingUp className="h-4 w-4" />} title="Weak Spot Hunter">
            <WeakSpotCard />
          </FeatureCard>
        </div>
      </div>
    </div>
  )
}

function GEOScoreCard() {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-center">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#amberGradient)"
              strokeWidth="3"
              strokeDasharray="94, 100"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-amber-400">94</span>
            <span className="text-[7px] text-zinc-500 uppercase tracking-wider">GEO</span>
          </div>
        </div>
      </div>

      <p className="text-[9px] text-center text-zinc-500">Dominate AI Overviews</p>
    </div>
  )
}

function WeakSpotCard() {
  return (
    <div className="mt-2 space-y-2">
      <div className="rounded-lg bg-black/40 px-2 py-2 text-xs border border-white/5">
        <div className="text-[10px] text-zinc-300 font-medium mb-1.5">best crm for startups</div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-bold uppercase text-amber-400">
            <RedditIcon className="h-2 w-2" /> Reddit
          </span>
          <span className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-bold uppercase text-amber-400">
            <QuoraIcon className="h-2 w-2" /> Quora
          </span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-zinc-500">8.2K vol</span>
          <span className="text-green-400 font-bold">KD 12</span>
        </div>
      </div>
      <p className="text-[9px] text-center text-zinc-500">Find easy rankings</p>
    </div>
  )
}

function VideoHijackCard() {
  return (
    <div className="mt-2 space-y-1.5">
      {[{ platform: "TikTok", views: "2.4M", position: 1 }, { platform: "Shorts", views: "890K", position: 2 }].map(
        (video) => (
          <div
            key={video.platform}
            className="flex items-center gap-2 rounded-lg bg-black/40 px-2 py-1.5 border border-white/5"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/20">
              <Play className="h-2.5 w-2.5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-medium text-zinc-300">{video.platform}</div>
              <div className="text-[8px] text-zinc-500">{video.views}</div>
            </div>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[8px] font-bold text-amber-400">
              #{video.position}
            </div>
          </div>
        )
      )}
      <p className="text-[9px] text-center text-zinc-500 pt-1">Capture SERP real estate</p>
    </div>
  )
}
