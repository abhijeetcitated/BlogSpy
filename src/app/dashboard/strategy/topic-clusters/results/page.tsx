"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { 
  ArrowLeft, 
  Loader2, 
  Crown, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Layers,
  PenLine,
  Zap,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Circle,
  Flame,
  X,
  ArrowUpDown,
  Save,
  Check,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  generateTopicClusters, 
  ClusteringResult, 
  Topic,
  ClusterKeyword,
  PageWithCluster
} from "@/lib/clustering-algorithm"
import { cn } from "@/lib/utils"

// ============================================
// CONSTANTS
// ============================================
const VOLUME_PRESETS = [
  { label: "All", min: 0, max: 1000000 },
  { label: "0-100", min: 0, max: 100 },
  { label: "100-1K", min: 100, max: 1000 },
  { label: "1K-10K", min: 1000, max: 10000 },
  { label: "10K+", min: 10000, max: 1000000 },
]

const KD_LEVELS = [
  { label: "All", min: 0, max: 100, color: "bg-muted-foreground", range: "0-100%" },
  { label: "Very Easy", min: 0, max: 14, color: "bg-green-500", range: "0-14%" },
  { label: "Easy", min: 15, max: 29, color: "bg-emerald-500", range: "15-29%" },
  { label: "Possible", min: 30, max: 49, color: "bg-yellow-500", range: "30-49%" },
  { label: "Difficult", min: 50, max: 69, color: "bg-orange-500", range: "50-69%" },
  { label: "Hard", min: 70, max: 84, color: "bg-red-500", range: "70-84%" },
  { label: "Very Hard", min: 85, max: 100, color: "bg-red-700", range: "85-100%" },
]

const INTENT_OPTIONS = [
  { value: "informational", label: "Informational", desc: "How-to, Guide" },
  { value: "commercial", label: "Commercial", desc: "Best, Review" },
  { value: "transactional", label: "Transactional", desc: "Buy, Price" },
]

const SORT_OPTIONS = [
  { value: "volume-desc", label: "Volume: High to Low" },
  { value: "volume-asc", label: "Volume: Low to High" },
  { value: "kd-asc", label: "KD: Easy to Hard" },
  { value: "kd-desc", label: "KD: Hard to Easy" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "keywords-desc", label: "Keywords: Most" },
]

// ============================================
// QUICK WIN BADGE
// ============================================
function QuickWinBadge({ kd, volume }: { kd: number; volume: number }) {
  // Show badge if KD < 35 AND Volume > 500
  if (kd >= 35 || volume <= 500) return null
  
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-linear-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold shadow-sm animate-pulse">
      <Flame className="w-3 h-3" />
      Quick Win
    </span>
  )
}

// ============================================
// LOADING SCREEN
// ============================================
function LoadingScreen({ progress, stage }: { progress: number; stage: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Layers className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Building Topic Clusters</h2>
          <p className="text-sm text-muted-foreground mt-1">{stage}</p>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4">
          <LoadStep label="Analyzing keywords" done={progress >= 30} active={progress < 30} />
          <LoadStep label="Identifying pillars" done={progress >= 60} active={progress >= 30 && progress < 60} />
          <LoadStep label="Creating topic groups" done={progress >= 100} active={progress >= 60} />
        </div>
      </div>
    </div>
  )
}

function LoadStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 text-sm transition-colors",
      done ? "text-green-600 dark:text-green-400" : active ? "text-primary" : "text-muted-foreground"
    )}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
      {label}
    </div>
  )
}

// ============================================
// INTENT BADGE
// ============================================
function IntentBadge({ intent }: { intent?: string }) {
  if (!intent) return null
  
  const colors: Record<string, string> = {
    informational: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    commercial: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    transactional: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    navigational: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
  }
  
  const short: Record<string, string> = {
    informational: "Info",
    commercial: "Comm",
    transactional: "Trans",
    navigational: "Nav"
  }
  
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colors[intent] || colors.informational)}>
      {short[intent] || intent?.slice(0, 4)}
    </span>
  )
}

// ============================================
// SUPPORTING KEYWORD (Clickable row with Vol & KD)
// ============================================
function SupportingKeywordRow({ keyword, onClick }: { keyword: ClusterKeyword; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-amber-500/30"
    >
      <Circle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-muted-foreground group-hover:text-amber-400 shrink-0 transition-colors" />
      <span className="flex-1 text-foreground truncate text-xs sm:text-sm font-medium group-hover:text-amber-400 transition-colors">
        {keyword.keyword}
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 tabular-nums bg-green-50 dark:bg-green-950/30 px-1.5 sm:px-2 py-0.5 rounded">
          {(keyword.volume ?? 0).toLocaleString()}
        </span>
        <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 tabular-nums bg-orange-50 dark:bg-orange-950/30 px-1.5 sm:px-2 py-0.5 rounded">
          {keyword.kd ?? 0}%
        </span>
        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-amber-400 transition-colors hidden sm:block" />
      </div>
    </div>
  )
}

// ============================================
// TREE NODE - PILLAR PAGE
// ============================================
function PillarNode({ 
  page, 
  isExpanded,
  onToggle,
  onWriteClick,
  onKeywordClick,
  hasSubpages,
  subpagesCount
}: { 
  page: PageWithCluster
  isExpanded: boolean
  onToggle: () => void
  onWriteClick: (kw: string, type: "pillar" | "cluster", volume: number, kd: number, supportingKeywords?: string[], parentPillar?: string, clusterCount?: number) => void
  onKeywordClick: (kw: string) => void
  hasSubpages: boolean
  subpagesCount: number
}) {
  const { mainKeyword, keywordCluster, totalVolume, avgKd } = page
  const totalKw = 1 + keywordCluster.length

  return (
    <div className="relative">
      {/* Vertical line to subpages */}
      {hasSubpages && (
        <div className="absolute left-[15px] sm:left-[19px] top-8 sm:top-10 bottom-0 w-0.5 bg-border" />
      )}
      
      {/* Node Content */}
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Node Icon */}
        <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-md">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pb-3 sm:pb-4">
          {/* Main Row */}
          <div 
            className="p-2.5 sm:p-3 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
            onClick={onToggle}
          >
            {/* Title Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 h-4 sm:h-5 shrink-0">
                PILLAR
              </Badge>
              <QuickWinBadge kd={avgKd} volume={totalVolume} />
              <h4 className="font-semibold text-sm sm:text-base text-foreground truncate flex-1">{mainKeyword.keyword}</h4>
              
              {/* Expand */}
              {keywordCluster.length > 0 && (
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              )}
            </div>
            
            {/* Stats Row - Wraps on mobile */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
              <span className="font-medium text-muted-foreground">{totalKw} kw</span>
              <span className="text-muted-foreground/50 hidden sm:inline">•</span>
              {mainKeyword.intent && <><IntentBadge intent={mainKeyword.intent} /><span className="text-muted-foreground/50 hidden sm:inline">•</span></>}
              <span className="font-semibold text-orange-600 dark:text-orange-400">{avgKd}% KD</span>
              <span className="text-muted-foreground/50 hidden sm:inline">•</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{totalVolume.toLocaleString()} vol</span>
              
              <div className="flex-1 min-w-[20px]" />
              
              {/* Dynamic AI Write Button */}
              <Button 
                size="sm" 
                className="relative overflow-hidden bg-linear-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white h-6 sm:h-7 gap-1 sm:gap-1.5 shrink-0 text-[10px] sm:text-xs font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 group px-2 sm:px-3"
                onClick={(e) => { e.stopPropagation(); onWriteClick(mainKeyword.keyword, "pillar", totalVolume, avgKd, keywordCluster.map(k => k.keyword), undefined, subpagesCount) }}
              >
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:animate-pulse" />
                <span className="hidden xs:inline">AI Write</span>
                <span className="xs:hidden">Write</span>
                <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </div>

          </div>

          {/* Supporting Keywords - Full Expand */}
          {isExpanded && keywordCluster.length > 0 && (
            <div className="mt-2 ml-2 sm:ml-4 p-2 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 font-medium">
                Supporting Keywords ({keywordCluster.length})
              </p>
              <div className="space-y-1">
                {keywordCluster.map(kw => (
                  <SupportingKeywordRow key={kw.id} keyword={kw} onClick={() => onKeywordClick(kw.keyword)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// TREE NODE - SUBPAGE
// ============================================
function SubpageNode({ 
  page, 
  index,
  isExpanded,
  onToggle,
  onWriteClick,
  onKeywordClick,
  isLast,
  parentPillar
}: { 
  page: PageWithCluster
  index: number
  isExpanded: boolean
  onToggle: () => void
  onWriteClick: (kw: string, type: "pillar" | "cluster", volume: number, kd: number, supportingKeywords?: string[], parentPillar?: string, clusterCount?: number) => void
  onKeywordClick: (kw: string) => void
  isLast: boolean
  parentPillar: string
}) {
  const { mainKeyword, keywordCluster, totalVolume, avgKd } = page
  const totalKw = 1 + keywordCluster.length

  return (
    <div className="relative">
      {/* Vertical line continues if not last */}
      {!isLast && (
        <div className="absolute left-[15px] sm:left-[19px] top-0 bottom-0 w-0.5 bg-border" />
      )}
      {/* Vertical line for current node */}
      <div className="absolute left-[15px] sm:left-[19px] top-0 h-4 sm:h-5 w-0.5 bg-border" />
      {/* Horizontal connector */}
      <div className="absolute left-[15px] sm:left-[19px] top-4 sm:top-5 w-5 sm:w-6 h-0.5 bg-border" />
      
      {/* Node Content */}
      <div className="flex items-start gap-2 sm:gap-3 pl-8 sm:pl-10">
        {/* Node Icon */}
        <div className="relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pb-2 sm:pb-3">
          {/* Main Row */}
          <div 
            className="p-2 sm:p-2.5 rounded-lg border border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
            onClick={onToggle}
          >
            {/* Title Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
              <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 h-4 sm:h-5 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 shrink-0">
                SUB {index}
              </Badge>
              <QuickWinBadge kd={avgKd} volume={totalVolume} />
              <h5 className="font-medium text-foreground text-xs sm:text-sm truncate flex-1">{mainKeyword.keyword}</h5>
              
              {/* Expand */}
              {keywordCluster.length > 0 && (
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              )}
            </div>
            
            {/* Stats Row - Wraps on mobile */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[11px]">
              <span className="font-medium text-muted-foreground">{totalKw} kw</span>
              <span className="text-muted-foreground/50 hidden sm:inline">•</span>
              {mainKeyword.intent && <><IntentBadge intent={mainKeyword.intent} /><span className="text-muted-foreground/50 hidden sm:inline">•</span></>}
              <span className="font-semibold text-orange-600 dark:text-orange-400">{avgKd}%</span>
              <span className="text-muted-foreground/50 hidden sm:inline">•</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{totalVolume.toLocaleString()}</span>
              
              <div className="flex-1 min-w-[10px]" />
              
              {/* Dynamic AI Write Button */}
              <Button 
                size="sm" 
                className="relative overflow-hidden bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white h-5 sm:h-6 gap-1 shrink-0 text-[9px] sm:text-[10px] font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 hover:scale-105 group px-1.5 sm:px-2"
                onClick={(e) => { e.stopPropagation(); onWriteClick(mainKeyword.keyword, "cluster", totalVolume, avgKd, keywordCluster.map(k => k.keyword), parentPillar) }}
              >
                <PenLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:animate-pulse" />
                <span>Write</span>
                <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </div>
          </div>

          {/* Supporting Keywords - Full Expand */}
          {isExpanded && keywordCluster.length > 0 && (
            <div className="mt-1.5 sm:mt-2 ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-md bg-muted/20 border border-dashed border-border">
              <p className="text-[9px] sm:text-[11px] text-muted-foreground mb-1 sm:mb-1.5">
                Supporting ({keywordCluster.length})
              </p>
              <div className="space-y-1">
                {keywordCluster.map(kw => (
                  <SupportingKeywordRow key={kw.id} keyword={kw} onClick={() => onKeywordClick(kw.keyword)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// TOPIC TREE CARD
// ============================================
function TopicTreeCard({ 
  topic, 
  index,
  isExpanded,
  onToggle,
  openPages,
  togglePage,
  onWriteClick,
  onKeywordClick
}: { 
  topic: Topic
  index: number
  isExpanded: boolean
  onToggle: () => void
  openPages: Set<string>
  togglePage: (id: string) => void
  onWriteClick: (kw: string, type: "pillar" | "cluster", volume: number, kd: number, supportingKeywords?: string[], parentPillar?: string, clusterCount?: number) => void
  onKeywordClick: (kw: string) => void
}) {
  const { name, pillar, subpages, totalVolume, avgKd, totalKeywords, totalPages } = topic

  return (
    <Card className="overflow-hidden">
      {/* Topic Header */}
      <div 
        className={cn(
          "flex items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-colors",
          isExpanded ? "bg-primary/5 border-b border-border" : "hover:bg-muted/30"
        )}
        onClick={onToggle}
      >
        {/* Topic Number */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm sm:text-base font-bold text-primary">{index + 1}</span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <span>{totalPages} articles</span>
            <span>•</span>
            <span>{totalKeywords} kw</span>
          </div>
        </div>

        {/* Stats - Hidden on mobile, visible on tablet+ */}
        <div className="hidden sm:flex items-center gap-3 md:gap-5 shrink-0">
          <div className="text-right">
            <p className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">{totalVolume.toLocaleString()}</p>
            <p className="text-[9px] md:text-[10px] text-muted-foreground">Volume</p>
          </div>
          <div className="text-right">
            <p className="text-sm md:text-base font-bold text-orange-600 dark:text-orange-400">{avgKd}%</p>
            <p className="text-[9px] md:text-[10px] text-muted-foreground">Avg KD</p>
          </div>
        </div>

        {/* Expand Icon */}
        <div className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0",
          isExpanded ? "bg-primary/10" : "bg-muted"
        )}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>

      {/* Mobile Stats - Only show when collapsed */}
      {!isExpanded && (
        <div className="sm:hidden flex items-center gap-3 px-3 pb-2.5 text-xs">
          <span className="text-green-600 dark:text-green-400 font-semibold">{totalVolume.toLocaleString()} vol</span>
          <span className="text-orange-600 dark:text-orange-400 font-semibold">{avgKd}% KD</span>
        </div>
      )}

      {/* Tree Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 pt-4 sm:pt-5">
          {/* Pillar Node */}
          <PillarNode
            page={pillar}
            isExpanded={openPages.has(pillar.id)}
            onToggle={() => togglePage(pillar.id)}
            onWriteClick={onWriteClick}
            onKeywordClick={onKeywordClick}
            hasSubpages={subpages.length > 0}
            subpagesCount={subpages.length}
          />
          
          {/* Subpage Nodes */}
          {subpages.map((subpage, idx) => (
            <SubpageNode
              key={subpage.id}
              page={subpage}
              index={idx + 1}
              isExpanded={openPages.has(subpage.id)}
              onToggle={() => togglePage(subpage.id)}
              onWriteClick={onWriteClick}
              onKeywordClick={onKeywordClick}
              isLast={idx === subpages.length - 1}
              parentPillar={pillar.mainKeyword.keyword}
            />
          ))}

          {/* No Subpages */}
          {subpages.length === 0 && (
            <div className="ml-10 py-3 text-sm text-muted-foreground italic">
              No subpages — Focus on pillar page only
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function ClusterResultsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Starting...")
  const [results, setResults] = useState<ClusteringResult | null>(null)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [openPages, setOpenPages] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  
  // Filter Popover States
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  
  // Smart Filter Tab State (Semrush-style)
  const [smartFilter, setSmartFilter] = useState<"all" | "quick-wins" | "high-roi" | "easy-start" | "traffic-boost">("all")
  
  // Filter Values
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 1000000])
  const [kdRange, setKdRange] = useState<[number, number]>([0, 100])
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  
  // Temp states for popovers
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>([0, 1000000])
  const [tempKdRange, setTempKdRange] = useState<[number, number]>([0, 100])
  const [tempSelectedIntents, setTempSelectedIntents] = useState<string[]>([])
  const [volumePreset, setVolumePreset] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("volume-desc")
  const [displayCount, setDisplayCount] = useState(15)
  
  // Save Project States
  const [saveOpen, setSaveOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null)

  const handleWriteClick = (keyword: string, type: "pillar" | "cluster", volume: number, kd: number, supportingKeywords?: string[], parentPillar?: string, clusterCount?: number) => {
    // Build URL params for AI Writer with FULL context
    const params = new URLSearchParams()
    params.set("source", "topic-clusters")
    params.set("keyword", keyword)
    params.set("type", type) // "pillar" or "cluster" - determines which card shows
    params.set("volume", volume.toString())
    params.set("kd", kd.toString())
    
    // Recommended word count based on type
    const recWords = type === "pillar" ? 3500 : 1800
    const recHeadings = type === "pillar" ? 8 : 5
    params.set("rec_words", recWords.toString())
    params.set("rec_headings", recHeadings.toString())
    
    // For Pillar: Set actual cluster count (number of subpages)
    if (type === "pillar" && clusterCount !== undefined) {
      params.set("cluster_count", clusterCount.toString())
    }
    
    // Encode supporting keywords with SEO placements
    if (supportingKeywords && supportingKeywords.length > 0) {
      // Assign placements based on position for best SEO:
      // First 2 = H2 (main sections), Next 2 = H3 (sub-sections), Next 2 = BODY, Rest = FAQ
      const getPlacement = (idx: number): string => {
        if (idx < 2) return "H2"
        if (idx < 4) return "H3"
        if (idx < 6) return "BODY"
        return "FAQ"
      }
      
      const subKwParam = supportingKeywords.slice(0, 8).map((kw, i) => 
        `${kw}:${getPlacement(i)}:0`
      ).join("|")
      params.set("sub_keywords", subKwParam)
    }
    
    // For cluster/sub-page: add pillar link instruction
    if (type === "cluster") {
      params.set("pillar_keyword", parentPillar || "Main Pillar Article")
      // Use first 2-3 words of keyword as anchor text
      const anchorWords = keyword.split(" ").slice(0, 3).join(" ")
      params.set("pillar_anchor", anchorWords)
    }
    
    // Also store in sessionStorage for backup
    sessionStorage.setItem("ai_writer_keyword", keyword)
    sessionStorage.setItem("ai_writer_type", type)
    
    router.push(`/ai-writer?${params.toString()}`)
  }

  // Navigate to keyword overview page with keyword data
  const handleKeywordClick = (keyword: string) => {
    // Encode keyword for URL (spaces become hyphens, lowercase)
    const encodedKeyword = encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, '-'))
    router.push(`/dashboard/research/overview/${encodedKeyword}`)
  }

  // Save project to localStorage
  const handleSaveProject = () => {
    if (!results || !projectName.trim()) return
    
    const projects = JSON.parse(localStorage.getItem("topic_cluster_projects") || "[]")
    const newProject = {
      id: Date.now().toString(),
      name: projectName.trim(),
      createdAt: new Date().toISOString(),
      data: results,
      statistics: {
        topics: results.statistics.totalTopics,
        keywords: results.statistics.totalKeywords,
        pillars: results.statistics.totalPillarPages,
      }
    }
    
    projects.unshift(newProject)
    localStorage.setItem("topic_cluster_projects", JSON.stringify(projects))
    
    setIsSaved(true)
    setSavedProjectId(newProject.id)
    setSaveOpen(false)
    
    // Reset after 3 seconds
    setTimeout(() => setIsSaved(false), 3000)
  }

  useEffect(() => {
    const run = async () => {
      // Check if loading from saved cluster
      const savedData = sessionStorage.getItem("saved_cluster_data")
      if (savedData) {
        try {
          const savedResult = JSON.parse(savedData) as ClusteringResult
          setResults(savedResult)
          setIsLoading(false)
          setIsSaved(true) // Mark as already saved
          
          // Get saved name if available
          const savedName = sessionStorage.getItem("saved_cluster_name")
          if (savedName) {
            setProjectName(savedName)
          }
          
          // Clean up
          sessionStorage.removeItem("saved_cluster_data")
          sessionStorage.removeItem("saved_cluster_name")
          
          // Auto-expand first topic
          if (savedResult.topics.length > 0) {
            setExpandedTopics(new Set([savedResult.topics[0].id]))
          }
          return
        } catch {
          console.error("Failed to load saved cluster")
        }
      }
      
      // Normal flow: load from clustering_keywords
      const data = sessionStorage.getItem("clustering_keywords")
      if (!data) {
        router.push("/dashboard/strategy/topic-clusters")
        return
      }

      const keywords: ClusterKeyword[] = JSON.parse(data)

      setStage("Analyzing keywords...")
      setProgress(20)
      await new Promise(r => setTimeout(r, 400))
      
      setProgress(50)
      setStage("Identifying pillars...")
      await new Promise(r => setTimeout(r, 400))
      
      setProgress(80)
      setStage("Creating topic groups...")
      await new Promise(r => setTimeout(r, 300))

      const result = generateTopicClusters(keywords)
      
      setProgress(100)
      setStage("Complete!")
      await new Promise(r => setTimeout(r, 200))

      setResults(result)
      setIsLoading(false)

      if (result.topics.length > 0) {
        setExpandedTopics(new Set([result.topics[0].id]))
      }
    }
    run()
  }, [router])

  // ============================================
  // SEO OPPORTUNITY SCORE CALCULATOR
  // ============================================
  // Industry-standard formula used by Ahrefs, Semrush, Moz
  // Formula: Opportunity Score = (Volume × Intent Multiplier) / (KD + 10)
  // Higher score = Better opportunity to rank and get traffic
  
  const calculateOpportunityScore = (volume: number, kd: number, intent?: string): number => {
    // Intent multiplier based on conversion potential
    // Transactional keywords convert 3x better than informational
    const intentMultiplier: Record<string, number> = {
      transactional: 3.0,  // Buy now, purchase, order
      commercial: 2.5,     // Best, review, comparison
      informational: 1.0,  // How to, what is, guide
      navigational: 0.5,   // Brand searches (low value for new content)
    }
    
    const multiplier = intent ? (intentMultiplier[intent] || 1.0) : 1.0
    
    // Add 10 to KD to avoid division by zero and normalize low KD advantage
    // This makes KD=0 not infinitely better than KD=5
    const score = (volume * multiplier) / (kd + 10)
    
    return Math.round(score)
  }
  
  // ============================================
  // SMART FILTER LOGIC - SEO-Based Authentic Algorithms
  // ============================================
  
  const filteredTopics = useMemo(() => {
    if (!results) return []
    
    let topics = [...results.topics]
    
    // Pre-calculate opportunity scores for all topics
    const topicsWithScores = topics.map(t => ({
      topic: t,
      opportunityScore: calculateOpportunityScore(
        t.pillar.totalVolume, 
        t.pillar.avgKd, 
        t.pillar.mainKeyword.intent
      )
    }))
    
    // ============================================
    // ADAPTIVE THRESHOLDS - Based on user's data distribution
    // ============================================
    // Instead of fixed thresholds, use percentiles of user's actual data
    // This makes filters work well regardless of niche difficulty
    
    const allKds = topics.map(t => t.pillar.avgKd).sort((a, b) => a - b)
    const allVolumes = topics.map(t => t.pillar.totalVolume).sort((a, b) => b - a)
    const allScores = topicsWithScores.map(t => t.opportunityScore).sort((a, b) => b - a)
    
    // Percentile calculations
    const getPercentile = (arr: number[], p: number) => arr[Math.floor(arr.length * p)] || arr[0] || 0
    
    // KD thresholds: Use lower 30% for easy, lower 50% for achievable
    const lowKdThreshold = Math.min(30, getPercentile(allKds, 0.3))   // Easy: bottom 30% KD or max 30
    const medKdThreshold = Math.min(50, getPercentile(allKds, 0.5))  // Achievable: bottom 50% KD or max 50
    
    // Volume thresholds: Use top 30% for high volume
    const highVolumeThreshold = Math.max(500, getPercentile(allVolumes, 0.3))  // High: top 30% or min 500
    const minViableVolume = Math.max(50, getPercentile(allVolumes, 0.9))       // Min: bottom 10% or min 50
    
    // Opportunity score threshold: top 30%
    const top30PercentileScore = getPercentile(allScores, 0.3)
    
    // Smart Filter (SEO-Based Authentic Logic with Adaptive Thresholds)
    switch (smartFilter) {
      case "quick-wins":
        // ============================================
        // QUICK WINS - Best ROI Keywords
        // ============================================
        // Adaptive: Low KD (bottom 30% or max 30) + Good Volume + High Score
        topics = topicsWithScores
          .filter(({ topic: t, opportunityScore }) => 
            t.pillar.avgKd <= lowKdThreshold && 
            t.pillar.totalVolume >= minViableVolume &&
            (opportunityScore >= top30PercentileScore || opportunityScore > 50)
          )
          .sort((a, b) => b.opportunityScore - a.opportunityScore)
          .map(t => t.topic)
        break
        
      case "high-roi":
        // ============================================
        // QUICK CONVERSIONS - Money Keywords
        // ============================================
        // Commercial & Transactional intent = 2.5-3x higher conversion rates
        // Adaptive: KD ≤ medium threshold (achievable difficulty)
        topics = topicsWithScores
          .filter(({ topic: t }) => 
            (t.pillar.mainKeyword.intent === "commercial" || 
             t.pillar.mainKeyword.intent === "transactional") &&
            t.pillar.avgKd <= medKdThreshold &&
            t.pillar.totalVolume >= minViableVolume
          )
          .sort((a, b) => b.opportunityScore - a.opportunityScore)
          .map(t => t.topic)
        break
        
      case "easy-start":
        // ============================================
        // EASY START - Beginner Friendly
        // ============================================
        // Easiest to rank: Bottom 20% KD or max KD 20
        // Even 0-authority domains can rank here
        const veryLowKdThreshold = Math.min(20, getPercentile(allKds, 0.2))
        topics = topicsWithScores
          .filter(({ topic: t }) => 
            t.pillar.avgKd <= veryLowKdThreshold && 
            t.pillar.totalVolume >= minViableVolume
          )
          .sort((a, b) => b.opportunityScore - a.opportunityScore)
          .map(t => t.topic)
        break
        
      case "traffic-boost":
        // ============================================
        // TRAFFIC BOOST - High Volume Opportunities
        // ============================================
        // Top 30% volume keywords with achievable difficulty
        topics = topicsWithScores
          .filter(({ topic: t }) => 
            t.pillar.totalVolume >= highVolumeThreshold && 
            t.pillar.avgKd <= medKdThreshold
          )
          .sort((a, b) => b.topic.totalVolume - a.topic.totalVolume)
          .map(t => t.topic)
        break
        
      default:
        // "all" - Sort by opportunity score
        topics = topicsWithScores
          .sort((a, b) => b.opportunityScore - a.opportunityScore)
          .map(t => t.topic)
    }
    
    // Search filter
    if (search) {
      const q = search.toLowerCase()
      topics = topics.filter(t => {
        if (t.name.toLowerCase().includes(q)) return true
        if (t.pillar.mainKeyword.keyword.toLowerCase().includes(q)) return true
        if (t.pillar.keywordCluster.some(k => k.keyword.toLowerCase().includes(q))) return true
        if (t.subpages.some(s => s.mainKeyword.keyword.toLowerCase().includes(q))) return true
        return false
      })
    }
    
    // Volume filter
    if (volumeRange[0] > 0 || volumeRange[1] < 1000000) {
      topics = topics.filter(t => 
        t.pillar.totalVolume >= volumeRange[0] && t.pillar.totalVolume <= volumeRange[1]
      )
    }
    
    // KD filter
    if (kdRange[0] > 0 || kdRange[1] < 100) {
      topics = topics.filter(t => 
        t.pillar.avgKd >= kdRange[0] && t.pillar.avgKd <= kdRange[1]
      )
    }
    
    // Intent filter
    if (selectedIntents.length > 0) {
      topics = topics.filter(t => 
        t.pillar.mainKeyword.intent && selectedIntents.includes(t.pillar.mainKeyword.intent)
      )
    }
    
    // Sort based on selected option
    switch (sortBy) {
      case "volume-desc":
        topics.sort((a, b) => b.totalVolume - a.totalVolume)
        break
      case "volume-asc":
        topics.sort((a, b) => a.totalVolume - b.totalVolume)
        break
      case "kd-asc":
        topics.sort((a, b) => a.avgKd - b.avgKd)
        break
      case "kd-desc":
        topics.sort((a, b) => b.avgKd - a.avgKd)
        break
      case "name-asc":
        topics.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        topics.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "keywords-desc":
        topics.sort((a, b) => b.totalKeywords - a.totalKeywords)
        break
      default:
        topics.sort((a, b) => b.totalVolume - a.totalVolume)
    }
    
    return topics
  }, [results, search, volumeRange, kdRange, selectedIntents, smartFilter, sortBy])
  
  // ============================================
  // SMART FILTER COUNTS - Using Same Adaptive Thresholds
  // ============================================
  const smartFilterCounts = useMemo(() => {
    if (!results) return { all: 0, quickWins: 0, highRoi: 0, easyStart: 0, trafficBoost: 0 }
    
    const topics = results.topics
    
    // Helper: Percentile calculator (same as filteredTopics)
    const getPercentile = (arr: number[], percentile: number): number => {
      if (arr.length === 0) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const index = Math.ceil(percentile * sorted.length) - 1
      return sorted[Math.max(0, index)]
    }
    
    // Collect all KDs and Volumes from pillars
    const allKds = topics.map(t => t.pillar.avgKd)
    const allVolumes = topics.map(t => t.pillar.totalVolume)
    
    // ADAPTIVE THRESHOLDS (same as filteredTopics)
    const lowKdThreshold = Math.min(35, getPercentile(allKds, 0.4))
    const medKdThreshold = Math.min(50, getPercentile(allKds, 0.6))
    const veryLowKdThreshold = Math.min(20, getPercentile(allKds, 0.2))
    const highVolumeThreshold = Math.max(500, getPercentile(allVolumes, 0.7))
    const minViableVolume = Math.max(50, getPercentile(allVolumes, 0.2))
    
    // Calculate opportunity scores for percentile calculation
    const scores = topics.map(t => calculateOpportunityScore(
      t.pillar.totalVolume, 
      t.pillar.avgKd, 
      t.pillar.mainKeyword.intent
    )).sort((a, b) => b - a)
    const top30PercentileScore = scores[Math.floor(scores.length * 0.3)] || 0
    
    return {
      all: topics.length,
      
      // Quick Wins: Low KD + Good Volume + High Opportunity Score
      quickWins: topics.filter(t => {
        const score = calculateOpportunityScore(t.pillar.totalVolume, t.pillar.avgKd, t.pillar.mainKeyword.intent)
        return t.pillar.avgKd <= lowKdThreshold && 
               t.pillar.totalVolume >= minViableVolume &&
               (score >= top30PercentileScore || score > 50)
      }).length,
      
      // High ROI: Commercial/Transactional Intent + Achievable KD
      highRoi: topics.filter(t => 
        (t.pillar.mainKeyword.intent === "commercial" || 
         t.pillar.mainKeyword.intent === "transactional") &&
        t.pillar.avgKd <= medKdThreshold &&
        t.pillar.totalVolume >= minViableVolume
      ).length,
      
      // Easy Start: Very Low KD (Beginner Friendly)
      easyStart: topics.filter(t => 
        t.pillar.avgKd <= veryLowKdThreshold && 
        t.pillar.totalVolume >= minViableVolume
      ).length,
      
      // Traffic Boost: High Volume + Achievable KD
      trafficBoost: topics.filter(t => 
        t.pillar.totalVolume >= highVolumeThreshold && 
        t.pillar.avgKd <= medKdThreshold
      ).length,
    }
  }, [results])
  
  // Toggle intent in temp state
  const toggleIntent = (value: string) => {
    setTempSelectedIntents(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const togglePage = (id: string) => {
    setOpenPages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (isLoading) return <LoadingScreen progress={progress} stage={stage} />

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">Could not generate clusters</p>
          <Button onClick={() => router.push("/dashboard/strategy/topic-clusters")}>Go Back</Button>
        </div>
      </div>
    )
  }

  const { statistics } = results
  const totalBlogs = statistics.totalPillarPages + statistics.totalSubpages

  return (
    <ErrorBoundary>
    <div className="-m-3 sm:-m-4 md:-m-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/dashboard/strategy/topic-clusters")} 
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground">Topic Clusters</h1>
              <p className="text-xs text-muted-foreground">
                {statistics.totalTopics} topics • {totalBlogs} articles • {statistics.totalKeywords} keywords
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-1.5"
              onClick={() => {
                if (!results) return
                
                // Build CSV data
                const rows: string[] = []
                rows.push("Topic,Type,Main Keyword,Volume,KD,Intent,Supporting Keywords")
                
                results.topics.forEach(topic => {
                  // Pillar
                  const pillarSupporting = topic.pillar.keywordCluster.map(k => k.keyword).join("; ")
                  rows.push(`"${topic.name}","Pillar","${topic.pillar.mainKeyword.keyword}",${topic.pillar.totalVolume},${topic.pillar.avgKd},"${topic.pillar.mainKeyword.intent || ""}","${pillarSupporting}"`)
                  
                  // Subpages
                  topic.subpages.forEach((sub, idx) => {
                    const subSupporting = sub.keywordCluster.map(k => k.keyword).join("; ")
                    rows.push(`"${topic.name}","Subpage ${idx + 1}","${sub.mainKeyword.keyword}",${sub.totalVolume},${sub.avgKd},"${sub.mainKeyword.intent || ""}","${subSupporting}"`)
                  })
                })
                
                // Download
                const csv = rows.join("\n")
                const blob = new Blob([csv], { type: "text/csv" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `topic-clusters-${new Date().toISOString().split("T")[0]}.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            {/* Save Project Button */}
            <Popover open={saveOpen} onOpenChange={setSaveOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={isSaved ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "hidden sm:flex gap-1.5",
                    isSaved && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 bg-card border border-border" align="end">
                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="font-medium text-sm text-foreground">Save Project</h4>
                    <p className="text-xs text-muted-foreground">Save this cluster for later use</p>
                  </div>
                  <Input
                    placeholder="Project name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-9 bg-background text-foreground border-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && projectName.trim()) {
                        handleSaveProject()
                      }
                    }}
                  />
                  <div className="flex justify-center">
                    <Button 
                      size="sm" 
                      disabled={!projectName.trim()}
                      onClick={handleSaveProject}
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 md:p-6 pt-6 sm:pt-8 md:pt-10 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-bold text-foreground">{statistics.totalKeywords}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Keywords</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-bold text-primary">{statistics.totalTopics}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Topics</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-bold text-amber-500">{statistics.totalPillarPages}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Pillars</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-bold text-blue-500">{statistics.totalSubpages}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Subpages</p>
          </div>
        </div>

        {/* Algorithm Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 py-2 bg-muted/30 rounded-lg text-xs">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-muted-foreground">Coverage:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{statistics.coveragePercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-muted-foreground">Confidence:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{statistics.avgConfidence}%</span>
          </div>
        </div>

        {/* Smart Filter Tabs (SEO-Based Authentic Logic) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {/* All Topics */}
          <button
            onClick={() => setSmartFilter("all")}
            className={cn(
              "flex flex-col items-start px-3 py-2 rounded-lg border transition-all",
              smartFilter === "all" 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card border-border hover:bg-muted/50 text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
              All Topics
              <span className={cn(
                "text-[10px] sm:text-xs font-bold",
                smartFilter === "all" ? "text-primary" : "text-muted-foreground"
              )}>{smartFilterCounts.all}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">By opportunity score</span>
          </button>

          {/* Quick Wins */}
          <button
            onClick={() => setSmartFilter("quick-wins")}
            className={cn(
              "flex flex-col items-start px-3 py-2 rounded-lg border transition-all",
              smartFilter === "quick-wins" 
                ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400" 
                : "bg-card border-border hover:bg-muted/50 text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
              <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-500" />
              Quick Wins
              <span className={cn(
                "text-[10px] sm:text-xs font-bold",
                smartFilter === "quick-wins" ? "text-green-500" : "text-muted-foreground"
              )}>{smartFilterCounts.quickWins}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Low KD, High ROI</span>
          </button>

          {/* Easy Start */}
          <button
            onClick={() => setSmartFilter("easy-start")}
            className={cn(
              "flex flex-col items-start px-3 py-2 rounded-lg border transition-all",
              smartFilter === "easy-start" 
                ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400" 
                : "bg-card border-border hover:bg-muted/50 text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
              Easy Start
              <span className={cn(
                "text-[10px] sm:text-xs font-bold",
                smartFilter === "easy-start" ? "text-blue-500" : "text-muted-foreground"
              )}>{smartFilterCounts.easyStart}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Beginner friendly</span>
          </button>

          {/* High ROI */}
          <button
            onClick={() => setSmartFilter("high-roi")}
            className={cn(
              "flex flex-col items-start px-3 py-2 rounded-lg border transition-all",
              smartFilter === "high-roi" 
                ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400" 
                : "bg-card border-border hover:bg-muted/50 text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
              Conversions
              <span className={cn(
                "text-[10px] sm:text-xs font-bold",
                smartFilter === "high-roi" ? "text-amber-500" : "text-muted-foreground"
              )}>{smartFilterCounts.highRoi}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Buyer intent</span>
          </button>

          {/* Traffic Boost */}
          <button
            onClick={() => setSmartFilter("traffic-boost")}
            className={cn(
              "flex flex-col items-start px-3 py-2 rounded-lg border transition-all col-span-2 sm:col-span-1 mx-auto sm:mx-0 max-w-[calc(50%-4px)] sm:max-w-none",
              smartFilter === "traffic-boost" 
                ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400" 
                : "bg-card border-border hover:bg-muted/50 text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
              Traffic Boost
              <span className={cn(
                "text-[10px] sm:text-xs font-bold",
                smartFilter === "traffic-boost" ? "text-purple-500" : "text-muted-foreground"
              )}>{smartFilterCounts.trafficBoost}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">High volume</span>
          </button>
        </div>

        {/* Search + Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-xs order-first">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Sort Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs px-3 shrink-0">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label || "Sort"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 bg-popover border-border" align="start">
              <div className="space-y-0.5">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                      sortBy === option.value 
                        ? "bg-secondary text-foreground font-medium" 
                        : "text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Volume Filter */}
          <Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs px-3 shrink-0">
                Volume
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4 bg-popover border-border" align="start">
              <div className="space-y-4">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Volume Range
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VOLUME_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setTempVolumeRange([preset.min, preset.max])
                        setVolumePreset(preset.label)
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded text-xs font-medium transition-colors border",
                        volumePreset === preset.label
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-1">
                  Custom Range
                </div>
                <Slider
                  value={tempVolumeRange}
                  onValueChange={(v) => {
                    setTempVolumeRange(v as [number, number])
                    setVolumePreset("Custom")
                  }}
                  min={0}
                  max={100000}
                  step={100}
                  className="py-2"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{tempVolumeRange[0].toLocaleString()}</span>
                  <span>{tempVolumeRange[1].toLocaleString()}</span>
                </div>
                <Button 
                  onClick={() => { setVolumeRange(tempVolumeRange); setVolumeOpen(false) }} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* KD Filter */}
          <Popover open={kdOpen} onOpenChange={setKdOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs px-3 shrink-0">
                Difficulty
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4 bg-popover border-border" align="start">
              <div className="space-y-4">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Difficulty Level
                </div>
                <div className="space-y-1">
                  {KD_LEVELS.map((level) => (
                    <button
                      key={level.label}
                      onClick={() => setTempKdRange([level.min, level.max])}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded text-sm transition-colors",
                        tempKdRange[0] === level.min && tempKdRange[1] === level.max 
                          ? "bg-secondary" 
                          : "hover:bg-secondary/50"
                      )}
                    >
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", level.color)} />
                      <span className="flex-1 text-left text-foreground">{level.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{level.range}</span>
                    </button>
                  ))}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-1">
                  Custom Range
                </div>
                <Slider
                  value={tempKdRange}
                  onValueChange={(v) => setTempKdRange(v as [number, number])}
                  min={0}
                  max={100}
                  step={1}
                  className="py-2"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{tempKdRange[0]}%</span>
                  <span>{tempKdRange[1]}%</span>
                </div>
                <Button 
                  onClick={() => { setKdRange(tempKdRange); setKdOpen(false) }} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Intent Filter */}
          <Popover open={intentOpen} onOpenChange={setIntentOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs px-3 shrink-0">
                Intent
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-4 bg-popover border-border" align="start">
              <div className="space-y-4">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Search Intent
                </div>
                <div className="space-y-1">
                  {INTENT_OPTIONS.map((intent) => (
                    <label
                      key={intent.value}
                      onClick={() => toggleIntent(intent.value)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors cursor-pointer",
                        tempSelectedIntents.includes(intent.value) ? "bg-secondary" : "hover:bg-secondary/50"
                      )}
                    >
                      <Checkbox checked={tempSelectedIntents.includes(intent.value)} />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{intent.label}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">({intent.desc})</span>
                      </div>
                    </label>
                  ))}
                </div>
                <Button 
                  onClick={() => { setSelectedIntents(tempSelectedIntents); setIntentOpen(false) }} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Reset Button */}
          {(volumePreset !== "All" || kdRange[0] > 0 || kdRange[1] < 100 || selectedIntents.length > 0) && (
            <button
              onClick={() => {
                setVolumeRange([0, 1000000])
                setTempVolumeRange([0, 1000000])
                setVolumePreset("All")
                setKdRange([0, 100])
                setTempKdRange([0, 100])
                setSelectedIntents([])
                setTempSelectedIntents([])
              }}
              className="h-9 px-2 flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {(volumePreset !== "All" || kdRange[0] > 0 || kdRange[1] < 100 || selectedIntents.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            {volumePreset !== "All" && (
              <Badge 
                variant="secondary" 
                className="h-7 pl-2.5 pr-1.5 gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              >
                <span className="text-xs font-medium">
                  Volume: {volumePreset === "Custom" ? `${volumeRange[0].toLocaleString()}-${volumeRange[1].toLocaleString()}` : volumePreset}
                </span>
                <button 
                  onClick={() => { setVolumeRange([0, 1000000]); setTempVolumeRange([0, 1000000]); setVolumePreset("All") }}
                  className="ml-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(kdRange[0] > 0 || kdRange[1] < 100) && (
              <Badge 
                variant="secondary" 
                className="h-7 pl-2.5 pr-1.5 gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
              >
                <span className="text-xs font-medium">
                  KD: {kdRange[0]}-{kdRange[1]}%
                </span>
                <button 
                  onClick={() => { setKdRange([0, 100]); setTempKdRange([0, 100]) }}
                  className="ml-0.5 hover:bg-orange-200 dark:hover:bg-orange-800 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedIntents.map(intent => (
              <Badge 
                key={intent}
                variant="secondary" 
                className="h-7 pl-2.5 pr-1.5 gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              >
                <span className="text-xs font-medium capitalize">
                  {intent}
                </span>
                <button 
                  onClick={() => { 
                    const newIntents = selectedIntents.filter(i => i !== intent)
                    setSelectedIntents(newIntents)
                    setTempSelectedIntents(newIntents)
                  }}
                  className="ml-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tree Legend */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs px-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-muted-foreground">Pillar</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <FileText className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-muted-foreground">Subpage</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Circle className="w-1.5 h-1.5 text-muted-foreground" />
            <span className="text-muted-foreground">Supporting Keyword</span>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-3">
          {filteredTopics.slice(0, displayCount).map((topic, idx) => (
            <TopicTreeCard
              key={topic.id}
              topic={topic}
              index={idx}
              isExpanded={expandedTopics.has(topic.id)}
              onToggle={() => toggleTopic(topic.id)}
              openPages={openPages}
              togglePage={togglePage}
              onWriteClick={handleWriteClick}
              onKeywordClick={handleKeywordClick}
            />
          ))}
        </div>

        {/* Load More Button */}
        {filteredTopics.length > displayCount && (
          <div className="text-center py-4">
            <Button
              variant="outline"
              onClick={() => setDisplayCount(prev => prev + 15)}
              className="gap-2"
            >
              Show More
              <Badge variant="secondary" className="ml-1">
                {filteredTopics.length - displayCount} remaining
              </Badge>
            </Button>
          </div>
        )}

        {/* Empty States */}
        {filteredTopics.length === 0 && search && (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
            <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">No results found</h3>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        )}

        {/* Empty State for Smart Filters */}
        {filteredTopics.length === 0 && !search && smartFilter !== "all" && (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
            <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">No topics match this filter</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {smartFilter === "quick-wins" && "No topics with KD ≤30 and Volume ≥100 found."}
              {smartFilter === "easy-start" && "No topics with KD ≤20 found."}
              {smartFilter === "high-roi" && "No commercial or transactional intent topics found."}
              {smartFilter === "traffic-boost" && "No topics with Volume ≥1K and KD ≤60 found."}
            </p>
            <Button variant="outline" size="sm" onClick={() => setSmartFilter("all")}>
              View All Topics
            </Button>
          </div>
        )}

        {/* Uncategorized - Only show when "All Topics" filter is selected */}
        {smartFilter === "all" && results.uncategorized.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Uncategorized</h3>
                <p className="text-xs text-muted-foreground">{results.uncategorized.length} keywords</p>
              </div>
            </div>
            <div className="p-3 max-h-60 overflow-y-auto space-y-1">
              {results.uncategorized.slice(0, 15).map(kw => (
                <SupportingKeywordRow key={kw.id} keyword={kw} onClick={() => handleKeywordClick(kw.keyword)} />
              ))}
              {results.uncategorized.length > 15 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{results.uncategorized.length - 15} more
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Quick Guide */}
        <div className="p-3 sm:p-4 rounded-xl bg-muted/20 border border-border">
          <div className="flex items-start gap-2 sm:gap-3">
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h4 className="font-semibold text-foreground mb-1">How to use</h4>
              <ol className="text-muted-foreground space-y-0.5 list-decimal list-inside text-[10px] sm:text-xs">
                <li>Write <span className="text-amber-500 font-medium">Pillar</span> first (3000+ words)</li>
                <li>Write each <span className="text-blue-500 font-medium">Subpage</span> (1500+ words)</li>
                <li>Link Subpages back to Pillar</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  )
}
