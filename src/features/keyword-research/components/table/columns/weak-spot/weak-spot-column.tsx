"use client"

import React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { WeakSpots } from "../../../../types"

// ============================================
// OFFICIAL BRAND SVG ICONS
// ============================================
// Source: Simple Icons (https://simpleicons.org/)
// These are the official brand icons from each platform
// ============================================

/**
 * Reddit Official Icon (Snoo mascot)
 * Brand Color: #FF4500 (Reddit Orange)
 * Source: https://simpleicons.org/?q=reddit
 */
const RedditSVG = React.memo(function RedditSVG({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5 min-w-5", className)}
    aria-label="Reddit"
    {...props}
    fill="#FF4500"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.094z" />
  </svg>
  )
})

/**
 * Quora Official Icon (Q letter)
 * Brand Color: #B92B27 (Quora Red)
 * Source: https://simpleicons.org/?q=quora
 */
const QuoraSVG = React.memo(function QuoraSVG({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5 min-w-5", className)}
    aria-label="Quora"
    {...props}
    fill="#B92B27"
  >
    <path d="M12.738 17.426c-.768-1.476-1.572-2.964-2.984-2.964-.432 0-.864.144-1.152.432l-.576-.96c.576-.528 1.44-.816 2.448-.816 1.872 0 3.024 1.008 3.936 2.4.528-1.008.816-2.352.816-3.936 0-4.416-1.584-7.248-4.992-7.248-3.408 0-5.04 2.832-5.04 7.248 0 4.392 1.632 7.2 5.04 7.2.576 0 1.104-.048 1.584-.192l.48.816c-.768.288-1.392.432-2.256.432C5.112 19.838 2.4 16.07 2.4 11.582c0-4.512 2.712-8.256 7.728-8.256 5.016 0 7.68 3.744 7.68 8.256 0 2.304-.576 4.272-1.584 5.712.864 1.296 1.824 1.824 2.976 1.824 1.008 0 1.44-.336 1.776-.816l.624.768c-.624.816-1.392 1.44-2.736 1.44-1.728 0-3.072-.72-4.224-2.208-.48.072-1.008.144-1.632.144-.048-.024-.144-.024-.27-.02z" />
  </svg>
  )
})

/**
 * Pinterest Official Icon (P pushpin)
 * Brand Color: #E60023 (Pinterest Red)
 * Source: https://simpleicons.org/?q=pinterest
 */
const PinterestSVG = React.memo(function PinterestSVG({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5 min-w-5", className)}
    aria-label="Pinterest"
    {...props}
    fill="#E60023"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.378-.293 1.194-.332 1.361-.053.218-.173.265-.4.16-1.492-.695-2.424-2.879-2.424-4.635 0-3.77 2.739-7.227 7.9-7.227 4.147 0 7.37 2.955 7.37 6.899 0 4.117-2.596 7.431-6.199 7.431-1.211 0-2.348-.629-2.738-1.373 0 0-.599 2.282-.745 2.838-.269 1.039-1.001 2.34-1.491 3.134C9.571 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
  )
})

// ============================================
// STRATEGY ICONS (Professional, no emojis)
// ============================================

const FlameIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4 text-orange-500"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

const TargetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4 text-emerald-500"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4 text-blue-500"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ImageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4 text-purple-500"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

type Strategy = {
  icon: React.ReactNode
  title: string
  desc: string
}

const getStrategy = (platform: string, rank: number): Strategy => {
  // PINTEREST LOGIC (Visuals)
  if (platform.toLowerCase().includes("pinterest")) {
    return {
      icon: <ImageIcon />,
      title: "Visual Intent Gap",
      desc: "Visual Intent. Add Infographics to rank.",
    }
  }

  // FORUM LOGIC (Reddit/Quora)
  // Rank 1-3: Parasite SEO
  if (rank <= 3) {
    return {
      icon: <FlameIcon />,
      title: "Parasite SEO Opportunity",
      desc: "High Traffic. Comment to hijack views.",
    }
  }

  // Rank 4-7: Content Gap
  if (rank <= 7) {
    return {
      icon: <TargetIcon />,
      title: "Content Quality Gap",
      desc: "Weak Content. Better guide wins easily.",
    }
  }

  // Rank 8-10: Filler Result
  if (rank >= 8) {
    return {
      icon: <ShieldIcon />,
      title: "Weak Competition",
      desc: "Space Filler. Basic SEO beats this.",
    }
  }

  return {
    icon: <TargetIcon />,
    title: "Opportunity",
    desc: "Analyze intent and publish content that better matches the query.",
  }
}

// ============================================
// TYPES
// ============================================

interface WeakSpotColumnProps {
  weakSpots: WeakSpots
  className?: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WeakSpotColumn({ weakSpots, className }: WeakSpotColumnProps) {
  // Check if any weak spots exist
  const hasReddit = weakSpots.reddit !== null && weakSpots.reddit <= 10
  const hasQuora = weakSpots.quora !== null && weakSpots.quora <= 10
  const hasPinterest = weakSpots.pinterest !== null && weakSpots.pinterest <= 10

  const redditRank = hasReddit ? weakSpots.reddit : null
  const quoraRank = hasQuora ? weakSpots.quora : null
  const pinterestRank = hasPinterest ? weakSpots.pinterest : null

  // No weak spots - return dash
  if (redditRank === null && quoraRank === null && pinterestRank === null) {
    return <span className={cn("text-muted-foreground text-xs", className)}>—</span>
  }

  const platformItems: Array<{ platform: "Reddit" | "Quora" | "Pinterest"; rank: number }> = []
  if (typeof redditRank === "number") platformItems.push({ platform: "Reddit", rank: redditRank })
  if (typeof quoraRank === "number") platformItems.push({ platform: "Quora", rank: quoraRank })
  if (typeof pinterestRank === "number") platformItems.push({ platform: "Pinterest", rank: pinterestRank })

  const tooltipLabel = `Strategic Analysis: ${platformItems.map((p) => p.platform).join(", ")}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center gap-3 px-2.5 py-1 h-7",
            "rounded-md border cursor-help",
            "border-gray-300 bg-gray-100",
            "dark:border-zinc-700 dark:bg-zinc-800/80",
            className
          )}
          aria-label={tooltipLabel}
        >
          {/* Reddit */}
          {hasReddit && (
            <div className="flex items-center gap-1.5" title={`Reddit Rank #${weakSpots.reddit}`}>
              <RedditSVG />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">#{weakSpots.reddit}</span>
            </div>
          )}

          {/* Quora */}
          {hasQuora && (
            <div className="flex items-center gap-1.5" title={`Quora Rank #${weakSpots.quora}`}>
              <QuoraSVG />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">#{weakSpots.quora}</span>
            </div>
          )}

          {/* Pinterest */}
          {hasPinterest && (
            <div className="flex items-center gap-1.5" title={`Pinterest Rank #${weakSpots.pinterest}`}>
              <PinterestSVG />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">#{weakSpots.pinterest}</span>
            </div>
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" sideOffset={6} className="w-80 p-0">
        <div className="p-3">
          <p className="font-semibold text-xs border-b border-zinc-200/60 dark:border-white/10 pb-2 mb-3 text-gray-800 dark:text-gray-100">
            Strategic Analysis
          </p>

          <div className="flex flex-col gap-3">
            {platformItems.map(({ platform, rank }) => {
              const strategy = getStrategy(platform, rank)
              const platformLabel = platform === "Pinterest" ? "Pinterest" : platform

              const PlatformBrandIcon =
                platform === "Reddit" ? RedditSVG : platform === "Quora" ? QuoraSVG : PinterestSVG

              return (
                <div
                  key={`${platform}-${rank}`}
                  className="rounded-md border border-border/60 bg-muted/30 p-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">{strategy.icon}</div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-5">
                          {strategy.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <PlatformBrandIcon className="w-3.5 h-3.5 min-w-3.5" />
                          <span className="text-[11px] text-gray-600 dark:text-gray-300">
                            {platformLabel} #{rank}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1 text-xs leading-4 text-gray-600 dark:text-gray-300">
                        {strategy.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default WeakSpotColumn
