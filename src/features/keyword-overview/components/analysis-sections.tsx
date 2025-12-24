"use client"

import { Monitor, Activity, Target, Flame } from "lucide-react"
import { PixelRankCard, PixelRankBadge } from "@/components/ui/pixel-rank-badge"
import { SERPStackVisualizer } from "@/components/ui/serp-visualizer"
import { RTVCard, RTVBadge, CTRBreakdownChart } from "@/components/ui/rtv-badge"
import { getPixelRankMessage, getRTVMessage, getDecayMessage, getContentAgeLabel } from "../utils/overview-utils"
import type { PixelRankScore } from "@/types/pixel.types"
import type { RTVAnalysis } from "@/types/rtv.types"
import type { CommunityDecayAnalysis } from "@/types/community-decay.types"

interface PixelRankSectionProps {
  score: PixelRankScore
}

export function PixelRankSection({ score }: PixelRankSectionProps) {
  return (
    <div className="bg-card dark:bg-gradient-to-br dark:from-card/80 dark:to-purple-900/20 border border-purple-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <h3 className="text-sm font-medium text-muted-foreground">Pixel Rank</h3>
        </div>
        <PixelRankBadge score={score} showPixels={false} size="sm" />
      </div>
      
      <PixelRankCard score={score} className="bg-transparent border-0 p-0" />
      
      {score.competingElements.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">SERP features above you:</p>
          <SERPStackVisualizer 
            competingElements={score.competingElements}
            yourPosition={score.organicRank}
          />
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-purple-600 dark:text-purple-300">
          {getPixelRankMessage(score.foldStatus)}
        </p>
      </div>
    </div>
  )
}

interface RTVSectionProps {
  analysis: RTVAnalysis
}

export function RTVSection({ analysis }: RTVSectionProps) {
  return (
    <div className="bg-card dark:bg-gradient-to-br dark:from-card/80 dark:to-orange-900/20 border border-orange-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          <h3 className="text-sm font-medium text-muted-foreground">Realizable Traffic</h3>
        </div>
        <RTVBadge 
          rtv={analysis.rtv}
          rawVolume={analysis.rawVolume}
          opportunityLevel={analysis.opportunityLevel}
          size="sm"
        />
      </div>
      
      <RTVCard analysis={analysis} className="bg-transparent border-0 p-0" />
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">CTR Breakdown by SERP Features:</p>
        <CTRBreakdownChart analysis={analysis} />
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-orange-600 dark:text-orange-300">
          {getRTVMessage(analysis.rtvPercentage)}
        </p>
      </div>
    </div>
  )
}

interface DecayOpportunityCardProps {
  analysis: CommunityDecayAnalysis
}

export function DecayOpportunityCard({ analysis }: DecayOpportunityCardProps) {
  return (
    <div className="lg:col-span-1 bg-card dark:bg-gradient-to-br dark:from-card/80 dark:to-orange-900/10 border border-orange-500/20 rounded-xl p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          <h3 className="text-sm font-medium text-muted-foreground">Decay Opportunity</h3>
        </div>
        {analysis.hasCommunityContent && (
          <span className="text-xs text-orange-500 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
            Score: {analysis.decayScore}
          </span>
        )}
      </div>
      
      {analysis.hasCommunityContent ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Community Sources</span>
              <span className="text-lg font-bold text-foreground">{analysis.communityCountInTop10}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(analysis.communityCountInTop10 * 20, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Avg Content Age</span>
              <span className="text-lg font-bold text-orange-500 dark:text-orange-400">
                {analysis.avgContentAge} days
              </span>
            </div>
            <div className="text-xs text-muted-foreground/70">
              {getContentAgeLabel(analysis.avgContentAge)}
            </div>
          </div>
          
          {analysis.bestOpportunity && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Best Target</span>
              </div>
              <p className="text-sm text-foreground/80">
                {analysis.bestOpportunity.platform.charAt(0).toUpperCase() + 
                 analysis.bestOpportunity.platform.slice(1)} at #{analysis.bestOpportunity.rankPosition}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {analysis.bestOpportunity.ageInDays} days old
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Flame className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No community content in SERP</p>
          <p className="text-xs mt-1">No Reddit/Quora opportunities</p>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-orange-600 dark:text-orange-300">
          {getDecayMessage(analysis.decayScore, analysis.hasCommunityContent)}
        </p>
      </div>
    </div>
  )
}
