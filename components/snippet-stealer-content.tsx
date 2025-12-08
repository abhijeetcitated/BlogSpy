"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Scissors,
  FileText,
  List,
  Table2,
  Search,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Type,
  BookOpen,
  Hash,
  Save,
  Loader2,
  PenLine,
  Monitor,
  TrendingUp,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
interface SnippetOpportunity {
  id: string
  keyword: string
  snippetType: "paragraph" | "list" | "table"
  volume: number
  status: "unclaimed" | "ranking"
  currentRank?: number
  competitorSnippet: string
  competitorWordCount: number
  competitorReadingLevel: string
  competitorKeywords: number
  targetKeywords: string[]
}

type ViewMode = "editor" | "preview"
type FilterType = "all" | "paragraph" | "list" | "table"

// ============================================
// MOCK DATA
// ============================================
const opportunities: SnippetOpportunity[] = [
  {
    id: "1",
    keyword: "how to bake sourdough",
    snippetType: "paragraph",
    volume: 15000,
    status: "ranking",
    currentRank: 4,
    competitorSnippet:
      "To bake sourdough bread, mix flour and water with your starter, let it rise for 4-12 hours, shape the dough, proof overnight in the fridge, then bake at 450°F in a Dutch oven for 45 minutes.",
    competitorWordCount: 42,
    competitorReadingLevel: "Grade 6",
    competitorKeywords: 4,
    targetKeywords: ["sourdough", "starter", "flour", "bake", "dough", "proof", "oven"],
  },
  {
    id: "2",
    keyword: "best time to post on instagram",
    snippetType: "list",
    volume: 22000,
    status: "unclaimed",
    competitorSnippet:
      "The best times to post on Instagram are: Tuesday 11am-2pm, Wednesday 11am, Friday 10-11am. Avoid posting on Sundays. Engagement peaks during lunch hours and mid-week.",
    competitorWordCount: 35,
    competitorReadingLevel: "Grade 5",
    competitorKeywords: 3,
    targetKeywords: ["instagram", "post", "engagement", "time", "tuesday", "wednesday", "friday"],
  },
  {
    id: "3",
    keyword: "how to remove red wine stain",
    snippetType: "list",
    volume: 8500,
    status: "unclaimed",
    competitorSnippet:
      "Blot the stain immediately with a clean cloth. Apply salt or baking soda to absorb the wine. Mix dish soap with hydrogen peroxide and apply. Rinse with cold water and repeat if needed.",
    competitorWordCount: 38,
    competitorReadingLevel: "Grade 5",
    competitorKeywords: 5,
    targetKeywords: ["stain", "wine", "blot", "salt", "baking soda", "rinse", "cloth"],
  },
  {
    id: "4",
    keyword: "what is machine learning",
    snippetType: "paragraph",
    volume: 45000,
    status: "ranking",
    currentRank: 7,
    competitorSnippet:
      "Machine learning is a subset of artificial intelligence that enables computers to learn from data and improve over time without being explicitly programmed. It uses algorithms to identify patterns and make predictions.",
    competitorWordCount: 36,
    competitorReadingLevel: "Grade 8",
    competitorKeywords: 4,
    targetKeywords: ["machine learning", "AI", "artificial intelligence", "algorithms", "data", "patterns", "predictions"],
  },
  {
    id: "5",
    keyword: "how to meditate for beginners",
    snippetType: "list",
    volume: 18000,
    status: "unclaimed",
    competitorSnippet:
      "Find a quiet space, sit comfortably, close your eyes, focus on your breath, and let thoughts pass without judgment. Start with 5 minutes daily and gradually increase the duration.",
    competitorWordCount: 33,
    competitorReadingLevel: "Grade 6",
    competitorKeywords: 3,
    targetKeywords: ["meditate", "breath", "quiet", "focus", "mindfulness", "relax", "beginners"],
  },
  {
    id: "6",
    keyword: "calories in an avocado",
    snippetType: "table",
    volume: 12000,
    status: "ranking",
    currentRank: 3,
    competitorSnippet:
      "A medium avocado (150g) contains approximately 240 calories, 22g of fat, 12g of carbohydrates, and 3g of protein. It's also rich in potassium, fiber, and healthy monounsaturated fats.",
    competitorWordCount: 34,
    competitorReadingLevel: "Grade 7",
    competitorKeywords: 4,
    targetKeywords: ["avocado", "calories", "fat", "protein", "carbohydrates", "potassium", "fiber"],
  },
  {
    id: "7",
    keyword: "how to tie a tie",
    snippetType: "list",
    volume: 33000,
    status: "unclaimed",
    competitorSnippet:
      "Cross the wide end over the narrow end, loop it underneath, bring it across again, pull through the loop around your neck, and tighten. The Four-in-Hand knot is the easiest for beginners.",
    competitorWordCount: 40,
    competitorReadingLevel: "Grade 5",
    competitorKeywords: 4,
    targetKeywords: ["tie", "knot", "loop", "cross", "tighten", "wide end", "narrow end"],
  },
  {
    id: "8",
    keyword: "what is cryptocurrency",
    snippetType: "paragraph",
    volume: 55000,
    status: "ranking",
    currentRank: 5,
    competitorSnippet:
      "Cryptocurrency is a digital or virtual currency that uses cryptography for security and operates on decentralized blockchain technology. Bitcoin, created in 2009, was the first cryptocurrency.",
    competitorWordCount: 30,
    competitorReadingLevel: "Grade 9",
    competitorKeywords: 3,
    targetKeywords: ["cryptocurrency", "bitcoin", "blockchain", "digital", "decentralized", "cryptography", "currency"],
  },
  {
    id: "9",
    keyword: "how to cook rice perfectly",
    snippetType: "paragraph",
    volume: 27000,
    status: "unclaimed",
    competitorSnippet:
      "Rinse rice until water runs clear, use a 1:1.5 rice-to-water ratio, bring to boil, reduce heat and simmer covered for 18 minutes. Let rest 5 minutes before fluffing with a fork.",
    competitorWordCount: 39,
    competitorReadingLevel: "Grade 5",
    competitorKeywords: 5,
    targetKeywords: ["rice", "cook", "boil", "simmer", "water", "rinse", "fluff"],
  },
  {
    id: "10",
    keyword: "benefits of drinking water",
    snippetType: "list",
    volume: 19000,
    status: "ranking",
    currentRank: 6,
    competitorSnippet:
      "Drinking water improves physical performance, boosts brain function, aids digestion, helps with weight loss, flushes toxins, and keeps skin healthy. Aim for 8 glasses daily.",
    competitorWordCount: 29,
    competitorReadingLevel: "Grade 6",
    competitorKeywords: 4,
    targetKeywords: ["water", "hydration", "health", "digestion", "skin", "toxins", "performance"],
  },
  {
    id: "11",
    keyword: "how to save money fast",
    snippetType: "list",
    volume: 31000,
    status: "unclaimed",
    competitorSnippet:
      "Track expenses, create a budget, cut subscriptions, cook at home, automate savings, use cashback apps, and avoid impulse purchases. Setting specific goals helps maintain motivation.",
    competitorWordCount: 28,
    competitorReadingLevel: "Grade 6",
    competitorKeywords: 3,
    targetKeywords: ["save", "money", "budget", "expenses", "savings", "goals", "cashback"],
  },
  {
    id: "12",
    keyword: "what causes hiccups",
    snippetType: "paragraph",
    volume: 9500,
    status: "unclaimed",
    competitorSnippet:
      "Hiccups occur when your diaphragm involuntarily contracts, causing a sudden intake of air that's stopped by the closure of your vocal cords. Common triggers include eating too fast, carbonated drinks, and sudden excitement.",
    competitorWordCount: 41,
    competitorReadingLevel: "Grade 7",
    competitorKeywords: 4,
    targetKeywords: ["hiccups", "diaphragm", "breathing", "spasm", "carbonated", "eating", "triggers"],
  },
]

// AI-generated responses
const aiResponses: Record<string, string> = {
  "1": "To bake sourdough, mix active starter with flour and water in a large bowl. Let the dough ferment for 4-6 hours until doubled in size. Shape into a round loaf, proof overnight in the fridge, then bake at 450°F in a preheated Dutch oven for 40-45 minutes until golden brown with a crispy crust.",
  "2": "The best times to post on Instagram for maximum engagement are Tuesday and Wednesday between 10am-1pm, Thursday at 11am, and Friday from 10-11am. Avoid posting late nights and Sundays when engagement drops significantly. Use Instagram Insights to find your specific audience's peak activity times.",
  "3": "To remove a red wine stain, act immediately by blotting with a clean white cloth. Cover the stain with salt or baking soda to absorb excess wine. Mix one tablespoon dish soap with one tablespoon hydrogen peroxide, apply to the stain, let sit for 30 minutes, then rinse with cold water.",
  "4": "Machine learning is a branch of artificial intelligence where computers learn patterns from data without explicit programming. It uses algorithms to analyze datasets, identify patterns, and make predictions or decisions. Applications include recommendation systems, image recognition, natural language processing, and autonomous vehicles.",
  "5": "To meditate as a beginner, find a quiet space and sit comfortably with your back straight. Close your eyes, breathe naturally, and focus attention on your breath. When thoughts arise, acknowledge them without judgment and return focus to breathing. Start with 5-10 minutes daily, gradually increasing duration.",
  "6": "A medium avocado (150g) contains approximately 240 calories, 22g of healthy fats, 12g of carbohydrates, 10g of fiber, and 3g of protein. Avocados are also rich in potassium (more than bananas), vitamin K, vitamin E, vitamin C, and heart-healthy monounsaturated fats.",
  "7": "To tie a tie using the Four-in-Hand knot: Start with the wide end on your right, crossing over the narrow end. Loop the wide end underneath and back across. Pull the wide end up through the neck loop from behind, then down through the front knot. Tighten by holding the narrow end and sliding the knot up.",
  "8": "Cryptocurrency is a decentralized digital currency secured by cryptography and recorded on blockchain technology. Unlike traditional currencies, it operates without central banks or governments. Bitcoin, launched in 2009, was the first cryptocurrency. Today, thousands exist including Ethereum, Litecoin, and stablecoins pegged to fiat currencies.",
  "9": "To cook perfect rice, rinse thoroughly until water runs clear to remove excess starch. Use a 1:1.5 ratio of rice to water. Bring to a boil, then reduce heat to low and cover tightly. Simmer for 18 minutes without lifting the lid. Remove from heat and let rest 5 minutes before fluffing with a fork.",
  "10": "Drinking adequate water provides numerous health benefits: improves physical performance and energy levels, boosts brain function and concentration, aids digestion and prevents constipation, supports kidney function and flushes toxins, promotes healthy skin, and can assist with weight management by reducing hunger. Aim for 8 glasses (2 liters) daily.",
  "11": "To save money fast: Track all expenses for one month to identify spending patterns. Create a realistic budget allocating income to needs, wants, and savings. Cancel unused subscriptions. Cook meals at home instead of dining out. Automate transfers to savings accounts. Use cashback apps and coupons. Avoid impulse purchases by implementing a 24-hour waiting rule.",
  "12": "Hiccups occur when the diaphragm muscle involuntarily contracts, causing a sudden intake of breath that's abruptly stopped by the closure of the vocal cords, producing the characteristic 'hic' sound. Common triggers include eating too quickly, consuming carbonated beverages, sudden temperature changes, excitement, and swallowing air.",
}

// ============================================
// HELPER COMPONENTS
// ============================================
const snippetTypeIcons = {
  paragraph: FileText,
  list: List,
  table: Table2,
}

const snippetTypeLabels = {
  paragraph: "Paragraph",
  list: "List",
  table: "Table",
}

// ============================================
// MAIN COMPONENT
// ============================================
export function SnippetStealerContent() {
  // Core state
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetOpportunity>(opportunities[0])
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [userSnippet, setUserSnippet] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("editor")
  
  // Action states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSnippets, setSavedSnippets] = useState<Set<string>>(new Set())
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => 
    opportunities.filter((opp) => filterType === "all" || opp.snippetType === filterType),
    [filterType]
  )

  // Word count calculation
  const wordCount = useMemo(() => {
    const words = userSnippet.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [userSnippet])

  // Keywords used calculation
  const keywordsUsed = useMemo(() => {
    if (!userSnippet.trim()) return 0
    const lowerText = userSnippet.toLowerCase()
    return selectedSnippet.targetKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length
  }, [userSnippet, selectedSnippet.targetKeywords])

  // Word count status
  const getWordCountStatus = useCallback((count: number) => {
    if (count < 30) return { color: "text-red-400", bg: "bg-red-500", label: "Too Short", ideal: false }
    if (count <= 60) return { color: "text-emerald-400", bg: "bg-emerald-500", label: "Ideal", ideal: true }
    return { color: "text-amber-400", bg: "bg-amber-500", label: "Too Long", ideal: false }
  }, [])

  const wordCountStatus = getWordCountStatus(wordCount)
  const progressPercent = Math.min((wordCount / 70) * 100, 100)

  // Show toast notification
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Handle snippet selection
  const handleSelectSnippet = useCallback((snippet: SnippetOpportunity) => {
    setSelectedSnippet(snippet)
    setUserSnippet("")
    setViewMode("editor")
  }, [])

  // Handle AI generation
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const response = aiResponses[selectedSnippet.id] || 
      `${selectedSnippet.keyword.charAt(0).toUpperCase() + selectedSnippet.keyword.slice(1)} is simple when you follow these proven steps. First, prepare your materials and workspace properly. Next, follow the technique carefully for optimal results. The key is consistency and patience. Most people see success within their first few attempts when following this method correctly.`
    
    setUserSnippet(response)
    setIsGenerating(false)
    showNotification("AI snippet generated successfully! ✨")
  }, [selectedSnippet, showNotification])

  // Handle save snippet
  const handleSave = useCallback(async () => {
    if (!userSnippet.trim()) {
      showNotification("Please write or generate a snippet first")
      return
    }
    
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setSavedSnippets(prev => new Set([...prev, selectedSnippet.id]))
    setIsSaving(false)
    showNotification(`Snippet saved to Content Plan for "${selectedSnippet.keyword}" 🎯`)
  }, [selectedSnippet, userSnippet, showNotification])

  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(vol >= 10000 ? 0 : 1)}k`
    return vol.toString()
  }

  const isSnippetSaved = savedSnippets.has(selectedSnippet.id)

  return (
    <main className="flex-1 flex overflow-hidden bg-background">
      {/* Left Panel - Opportunities List */}
      <div className="w-[30%] min-w-[300px] border-r border-border bg-card/50 flex flex-col">
        {/* Left Panel Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-emerald-400" />
              <h2 className="font-semibold text-foreground">Snippet Opportunities</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredOpportunities.length}
              </Badge>
            </div>
          </div>

          {/* Filter Buttons - Standard Slate Style */}
          <div className="flex items-center gap-2">
            <Button
              variant={filterType === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "paragraph" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setFilterType("paragraph")}
            >
              <FileText className="h-3 w-3" />
              Paragraph
            </Button>
            <Button
              variant={filterType === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setFilterType("list")}
            >
              <List className="h-3 w-3" />
              List
            </Button>
            <Button
              variant={filterType === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setFilterType("table")}
            >
              <Table2 className="h-3 w-3" />
              Table
            </Button>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto">
          {filteredOpportunities.map((opp) => {
            const TypeIcon = snippetTypeIcons[opp.snippetType]
            const isSelected = selectedSnippet.id === opp.id
            const isSaved = savedSnippets.has(opp.id)
            
            return (
              <div
                key={opp.id}
                onClick={() => handleSelectSnippet(opp)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer transition-all",
                  isSelected 
                    ? "bg-accent border-l-2 border-l-emerald-500" 
                    : "hover:bg-muted/50 border-l-2 border-l-transparent",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isSaved && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    )}
                    <h3 className={cn(
                      "font-medium text-sm line-clamp-1",
                      isSelected ? "text-emerald-400" : "text-foreground"
                    )}>
                      {opp.keyword}
                    </h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0",
                      opp.status === "unclaimed"
                        ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        : "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
                    )}
                  >
                    {opp.status === "unclaimed" ? "Unclaimed" : `#${opp.currentRank}`}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TypeIcon className="h-3 w-3" />
                    <span>{snippetTypeLabels[opp.snippetType]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{formatVolume(opp.volume)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Workbench */}
      <div className="flex-1 bg-background flex flex-col overflow-hidden">
        {/* Workbench Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg text-foreground">{selectedSnippet.keyword}</h2>
            <Badge variant="secondary" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              {formatVolume(selectedSnippet.volume)} volume
            </Badge>
            {isSnippetSaved && (
              <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
          
          {/* View Mode Toggle - Standard Slate Style */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("editor")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === "editor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PenLine className="h-3.5 w-3.5" />
              Editor
            </button>
            <button
              onClick={() => setViewMode("preview")}
              disabled={!userSnippet.trim()}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                !userSnippet.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              Google Preview
            </button>
          </div>
        </div>

        {/* Workbench Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Zone A: The Enemy - Competitor Snippet */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="font-medium text-foreground">The Enemy</h3>
              <span className="text-xs text-muted-foreground">Current Featured Snippet</span>
            </div>

            {/* Google Snippet Card - Authentic Google Style (White/Light) */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
              <p className="text-slate-900 text-[15px] leading-relaxed font-sans">
                {selectedSnippet.competitorSnippet}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="h-5 w-5 rounded bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600">
                    C
                  </div>
                  <span className="text-red-600">competitor-site.com</span>
                </div>
              </div>
            </div>

            {/* Forensics Bar */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Word Count:</span>
                <span
                  className={cn(
                    "font-mono font-medium",
                    selectedSnippet.competitorWordCount >= 40 && selectedSnippet.competitorWordCount <= 50
                      ? "text-emerald-400"
                      : "text-amber-400",
                  )}
                >
                  {selectedSnippet.competitorWordCount} words
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reading Level:</span>
                <span className="font-medium text-foreground">{selectedSnippet.competitorReadingLevel}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Keywords:</span>
                <span className="font-medium text-foreground">{selectedSnippet.competitorKeywords}</span>
              </div>
            </div>
          </div>

          {/* Conditional Render: Editor or Preview */}
          {viewMode === "editor" ? (
            <>
              {/* Zone B: The Strategy - User Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="font-medium text-foreground">Your Winning Snippet</h3>
                </div>

                {/* Textarea */}
                <Textarea
                  value={userSnippet}
                  onChange={(e) => setUserSnippet(e.target.value)}
                  placeholder="Write your better answer here, or let AI generate one..."
                  className="min-h-[140px] bg-muted/50 border-border resize-none text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />

                {/* Live Stats Bar */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                  <div className="flex items-center gap-4">
                    {/* Word Count */}
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Words:</span>
                      <span className={cn("font-mono font-bold text-sm", wordCountStatus.color)}>
                        {wordCount}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5",
                          wordCountStatus.ideal 
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {wordCountStatus.label}
                      </Badge>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300 ease-out",
                            wordCountStatus.bg
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">40-60 ideal</span>
                    </div>
                    
                    {/* Keywords Used */}
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Keywords:</span>
                      <span className={cn(
                        "font-mono font-bold text-sm",
                        keywordsUsed >= 4 ? "text-emerald-400" : keywordsUsed >= 2 ? "text-amber-400" : "text-red-400"
                      )}>
                        {keywordsUsed}/{selectedSnippet.targetKeywords.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Keywords Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Target Keywords:</span>
                  {selectedSnippet.targetKeywords.map((keyword, idx) => {
                    const isUsed = userSnippet.toLowerCase().includes(keyword.toLowerCase())
                    return (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={cn(
                          "text-xs transition-all",
                          isUsed
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                            : "border-border text-muted-foreground bg-muted/50"
                        )}
                      >
                        {isUsed && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {keyword}
                      </Badge>
                    )
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Generate Button - Distinctive Emerald */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 h-11"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Better Answer
                      </>
                    )}
                  </Button>
                  
                  {/* Save Button - Standard Slate */}
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !userSnippet.trim() || isSnippetSaved}
                    variant="outline"
                    className={cn(
                      "h-11 px-6",
                      isSnippetSaved 
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 cursor-default"
                        : ""
                    )}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : isSnippetSaved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Snippet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Zone C: Google Search Preview - Authentic Google Style */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="font-medium text-foreground">Google Search Preview</h3>
                <span className="text-xs text-muted-foreground">How your snippet will appear</span>
              </div>

              {/* Google Search Results Container - Authentic Google White Style */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 max-w-2xl">
                {/* Search Bar Mock */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-full border border-slate-200">
                  <Search className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">{selectedSnippet.keyword}</span>
                </div>

                {/* Featured Snippet Box */}
                <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50/50">
                  <p className="text-slate-800 text-[15px] leading-relaxed mb-3">
                    {userSnippet}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                      Y
                    </div>
                    <span className="text-emerald-600 font-medium">your-site.com</span>
                    <span className="text-slate-400">
                      › blog › {selectedSnippet.keyword.replace(/\s+/g, "-")}
                    </span>
                  </div>
                </div>

                {/* Your Result */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                      Y
                    </div>
                    <span className="text-emerald-600">your-site.com</span>
                    <span className="text-slate-400">
                      › blog › {selectedSnippet.keyword.replace(/\s+/g, "-")}
                    </span>
                  </div>
                  <h4 className="text-blue-700 text-lg font-medium hover:underline cursor-pointer">
                    {selectedSnippet.keyword.charAt(0).toUpperCase() + selectedSnippet.keyword.slice(1)} - Complete Guide 2024
                  </h4>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {userSnippet.substring(0, 160)}...
                  </p>
                </div>

                {/* Competitor Result (pushed down) */}
                <div className="space-y-1 opacity-60">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-5 w-5 rounded bg-slate-300 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                      C
                    </div>
                    <span className="text-slate-500">competitor-site.com</span>
                  </div>
                  <h4 className="text-blue-600/70 text-base hover:underline cursor-pointer">
                    {selectedSnippet.keyword.charAt(0).toUpperCase() + selectedSnippet.keyword.slice(1)} Tips
                  </h4>
                  <p className="text-slate-500 text-sm line-clamp-2">
                    {selectedSnippet.competitorSnippet.substring(0, 120)}...
                  </p>
                </div>
              </div>

              {/* Success Message */}
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    Your snippet is optimized for Featured Snippet!
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">
                    Word count: {wordCount} • Keywords used: {keywordsUsed}/{selectedSnippet.targetKeywords.length}
                  </p>
                </div>
              </div>

              {/* Back to Editor Button */}
              <Button
                variant="outline"
                onClick={() => setViewMode("editor")}
                className="w-full h-11"
              >
                <PenLine className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-foreground">{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  )
}