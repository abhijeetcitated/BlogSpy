"use client"

// ============================================
// AI TOOLS PANEL - All 18 AI Writer Features
// Card-based, Animated, Responsive Design
// ============================================

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sparkles,
  Shield,
  Bot,
  FileSearch,
  Wand2,
  Eye,
  Code2,
  Target,
  Search,
  Link2,
  Quote,
  Award,
  Users,
  ImageIcon,
  BarChart3,
  FileText,
  Zap,
  TrendingUp,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================

interface AITool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  score?: number
  badge?: string
  color: string
}

interface AIToolsPanelProps {
  content: string
  targetKeyword: string
  onToolSelect?: (toolId: string) => void
}

// ============================================
// TOOLS DATA
// ============================================

const getAllTools = (): AITool[] => [
  // Content Quality
  { id: 'readability', name: 'Readability Analyzer', description: 'Check reading level and improve clarity', icon: <FileText className="h-4 w-4" />, category: 'Content Quality', score: 72, badge: 'Grade 8', color: 'text-blue-500' },
  { id: 'plagiarism', name: 'Plagiarism Checker', description: 'Detect duplicate content', icon: <Shield className="h-4 w-4" />, category: 'Content Quality', score: 96, badge: 'Original', color: 'text-green-500' },
  { id: 'ai-detector', name: 'AI Content Detector', description: 'Check if content appears AI-generated', icon: <Bot className="h-4 w-4" />, category: 'Content Quality', score: 35, badge: 'Human-like', color: 'text-purple-500' },
  { id: 'humanizer', name: 'Content Humanizer', description: 'Make AI content more natural', icon: <Wand2 className="h-4 w-4" />, category: 'Content Quality', color: 'text-pink-500' },
  
  // SEO Optimization
  { id: 'topic-gap', name: 'Topic Gap Analysis', description: 'Find missing topics vs competitors', icon: <BarChart3 className="h-4 w-4" />, category: 'SEO Optimization', score: 68, badge: '5 gaps', color: 'text-orange-500' },
  { id: 'snippet-optimizer', name: 'Snippet Optimizer', description: 'Optimize for featured snippets', icon: <Target className="h-4 w-4" />, category: 'SEO Optimization', score: 45, color: 'text-yellow-500' },
  { id: 'schema-markup', name: 'Schema Generator', description: 'Generate structured data markup', icon: <Code2 className="h-4 w-4" />, category: 'SEO Optimization', badge: 'FAQ, HowTo', color: 'text-cyan-500' },
  { id: 'ai-overview', name: 'AI Overview Visibility', description: 'Optimize for AI search results', icon: <Eye className="h-4 w-4" />, category: 'SEO Optimization', score: 52, color: 'text-violet-500' },
  
  // Content Enhancement
  { id: 'entity-coverage', name: 'Entity Coverage', description: 'Analyze entity mentions', icon: <Users className="h-4 w-4" />, category: 'Content Enhancement', score: 78, badge: '12 entities', color: 'text-teal-500' },
  { id: 'eeat', name: 'E-E-A-T Analyzer', description: 'Check expertise, authority, trust', icon: <Award className="h-4 w-4" />, category: 'Content Enhancement', score: 65, color: 'text-amber-500' },
  { id: 'citation', name: 'Citation Manager', description: 'Add and manage source citations', icon: <Quote className="h-4 w-4" />, category: 'Content Enhancement', badge: '3 sources', color: 'text-indigo-500' },
  { id: 'internal-linking', name: 'Internal Linking', description: 'Suggest internal link opportunities', icon: <Link2 className="h-4 w-4" />, category: 'Content Enhancement', badge: '8 links', color: 'text-emerald-500' },
  
  // Content Creation
  { id: 'content-brief', name: 'Content Brief', description: 'Generate comprehensive content brief', icon: <FileSearch className="h-4 w-4" />, category: 'Content Creation', color: 'text-rose-500' },
  { id: 'paa', name: 'People Also Ask', description: 'Find related questions to answer', icon: <Search className="h-4 w-4" />, category: 'Content Creation', badge: '15 questions', color: 'text-sky-500' },
  { id: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyze top ranking competitors', icon: <TrendingUp className="h-4 w-4" />, category: 'Content Creation', badge: 'Top 10', color: 'text-red-500' },
  { id: 'image-optimization', name: 'Image Optimization', description: 'Optimize images for SEO', icon: <ImageIcon className="h-4 w-4" />, category: 'Content Creation', badge: '4 images', color: 'text-lime-500' },
  
  // Productivity
  { id: 'auto-optimize', name: 'Auto Optimize', description: 'One-click content optimization', icon: <Sparkles className="h-4 w-4" />, category: 'Productivity', badge: 'AI Powered', color: 'text-yellow-500' },
  { id: 'slash-commands', name: 'Slash Commands', description: 'Quick actions with / shortcuts', icon: <Code2 className="h-4 w-4" />, category: 'Productivity', badge: '20+ commands', color: 'text-gray-500' },
]

// ============================================
// TOOL CONTENT COMPONENTS
// ============================================

function ReadabilityContent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">171</p>
          <p className="text-xs text-muted-foreground">Words</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">9</p>
          <p className="text-xs text-muted-foreground">Sentences</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">19</p>
          <p className="text-xs text-muted-foreground">Avg Words/Sentence</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">1 min</p>
          <p className="text-xs text-muted-foreground">Reading Time</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Recommendations</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>Good sentence length variation</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <span>Consider breaking long paragraphs</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <span>Add more transition words</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlagiarismContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Originality Score</span>
        <Badge variant="outline" className="text-green-500 border-green-500/30">96% Original</Badge>
      </div>
      <Progress value={96} className="h-2" />
      <div className="space-y-2">
        <p className="text-sm font-medium">Analysis</p>
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <span>No significant matches found</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <span>4% common phrases detected</span>
        </div>
      </div>
    </div>
  )
}

function AIDetectorContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Human Score</span>
        <Badge variant="outline" className="text-purple-500 border-purple-500/30">65% Human</Badge>
      </div>
      <Progress value={65} className="h-2" />
      <div className="space-y-2">
        <p className="text-sm font-medium">Detection Results</p>
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <span>Natural sentence structure</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <span>Some patterns may appear AI-generated</span>
        </div>
      </div>
    </div>
  )
}

function GenericToolContent({ tool }: { tool: AITool }) {
  return (
    <div className="space-y-4">
      {tool.score !== undefined && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Score</span>
            <Badge variant="outline" className={cn(
              tool.score >= 80 ? "text-green-500 border-green-500/30" :
              tool.score >= 60 ? "text-yellow-500 border-yellow-500/30" :
              "text-orange-500 border-orange-500/30"
            )}>
              {tool.score}%
            </Badge>
          </div>
          <Progress value={tool.score} className="h-2" />
        </>
      )}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{tool.description}</p>
        <Button size="sm" className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Run Analysis
        </Button>
      </div>
    </div>
  )
}

// ============================================
// EXPANDABLE TOOL CARD
// ============================================

function ToolCard({ tool, isExpanded, onToggle }: { 
  tool: AITool
  isExpanded: boolean
  onToggle: () => void 
}) {
  const renderContent = () => {
    switch (tool.id) {
      case 'readability': return <ReadabilityContent />
      case 'plagiarism': return <PlagiarismContent />
      case 'ai-detector': return <AIDetectorContent />
      default: return <GenericToolContent tool={tool} />
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-300 ease-out overflow-hidden",
        isExpanded ? "shadow-lg ring-1 ring-primary/20" : "hover:shadow-md hover:border-primary/30"
      )}
    >
      {/* Tool Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={cn(
          "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          isExpanded ? "bg-primary/10" : "bg-muted/50"
        )}>
          <span className={tool.color}>{tool.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{tool.name}</span>
            {tool.badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {tool.badge}
              </Badge>
            )}
          </div>
          {!isExpanded && (
            <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
          )}
        </div>

        {tool.score !== undefined && (
          <span className={cn(
            "text-sm font-semibold shrink-0",
            tool.score >= 80 ? "text-green-500" :
            tool.score >= 60 ? "text-yellow-500" :
            tool.score >= 40 ? "text-orange-500" : "text-red-500"
          )}>
            {tool.score}%
          </span>
        )}

        <div className={cn(
          "shrink-0 transition-transform duration-300",
          isExpanded && "rotate-180"
        )}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-0">
            <div className="border-t pt-3">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN PANEL COMPONENT
// ============================================

export function AIToolsPanel({ content, targetKeyword, onToolSelect }: AIToolsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const tools = getAllTools()
  const categories = [...new Set(tools.map(t => t.category))]

  const filteredTools = activeCategory 
    ? tools.filter(t => t.category === activeCategory)
    : tools

  const handleToolToggle = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId)
    onToolSelect?.(toolId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border",
            "bg-pink-500/20 text-pink-500 dark:text-pink-400 border-pink-500/50",
            "shadow-sm hover:shadow-md",
            "hover:bg-pink-500/25 active:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
        >
          <Sparkles className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", "text-pink-500 dark:text-pink-400")} />
          <span className="hidden sm:inline">AI Tools</span>
          <span
            className={cn(
              "text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-4.5 text-center",
              "bg-pink-500 text-white"
            )}
          >
            18
          </span>
        </button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:w-95 md:w-105 p-0 flex flex-col min-h-0"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base pr-8">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Writing Tools
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0.5">
              18 tools
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Category Filters */}
        <div className="px-3 py-2 border-b shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            <Button
              variant={activeCategory === null ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5 whitespace-nowrap"
                onClick={() => setActiveCategory(cat)}
              >
                {cat.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Tools List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-2">
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isExpanded={expandedTool === tool.id}
                onToggle={() => handleToolToggle(tool.id)}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="px-4 py-3 border-t bg-muted/30 shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Content: {content?.length || 0} chars</span>
            <span>Keyword: {targetKeyword || 'Not set'}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ============================================
// QUICK ACCESS BAR (Optional Export)
// ============================================

export function AIToolsQuickBar({ content, targetKeyword }: { content: string; targetKeyword: string }) {
  const quickTools = [
    { id: 'plagiarism', icon: <Shield className="h-4 w-4" />, label: 'Plagiarism', score: 96, color: 'text-green-500' },
    { id: 'ai-detector', icon: <Bot className="h-4 w-4" />, label: 'AI Check', score: 65, color: 'text-purple-500' },
    { id: 'readability', icon: <FileText className="h-4 w-4" />, label: 'Readability', score: 72, color: 'text-blue-500' },
    { id: 'eeat', icon: <Award className="h-4 w-4" />, label: 'E-E-A-T', score: 68, color: 'text-amber-500' },
  ]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/30 rounded-lg">
        {quickTools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2">
                <span className={tool.color}>{tool.icon}</span>
                <span className={cn(
                  "text-xs font-medium",
                  tool.score >= 80 ? "text-green-500" :
                  tool.score >= 60 ? "text-yellow-500" : "text-orange-500"
                )}>
                  {tool.score}%
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
