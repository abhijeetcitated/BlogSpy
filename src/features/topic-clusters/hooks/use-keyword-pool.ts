/**
 * ============================================
 * TOPIC CLUSTERS - KEYWORD POOL HOOK
 * ============================================
 * 
 * Centralized state management for the keyword pool feature
 */

import { useState, useMemo, useCallback, useEffect } from "react"
import { toast } from "sonner"
import type { 
  Keyword, 
  SortField, 
  SortDirection, 
  BusinessPotential,
  Project 
} from "../types/keyword-types"
import { 
  calculatePriorityScore, 
  generateKeywordData 
} from "../utils/keyword-utils"

// Initial demo projects
const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "SEO Tools",
    description: "All SEO tools and software keywords",
    keywordCount: 0,
    totalVolume: 0,
    avgKd: 0,
    status: "draft",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    color: "#8B5CF6",
  },
  {
    id: "proj-2",
    name: "Content Marketing",
    description: "Content strategy keywords",
    keywordCount: 0,
    totalVolume: 0,
    avgKd: 0,
    status: "draft",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    color: "#10B981",
  },
]

export function useKeywordPool() {
  // Core keyword state
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualText, setManualText] = useState("")
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false)
  const [pendingImportKeywords, setPendingImportKeywords] = useState<Keyword[]>([])
  const [importStep, setImportStep] = useState<"choose" | "create" | "select">("choose")
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  // Projects
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  
  // Side panel state
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  
  // Content brief state
  const [showContentBrief, setShowContentBrief] = useState(false)
  const [briefKeywords, setBriefKeywords] = useState<Keyword[]>([])
  
  // Filter state
  const [volumeMin, setVolumeMin] = useState("")
  const [volumeMax, setVolumeMax] = useState("")
  const [kdMin, setKdMin] = useState("")
  const [kdMax, setKdMax] = useState("")
  const [intentFilters, setIntentFilters] = useState<string[]>([])
  const [sourceFilters, setSourceFilters] = useState<string[]>([])
  const [serpFilters, setSerpFilters] = useState<string[]>([])
  
  // Sort state
  const [sortField, setSortField] = useState<SortField>("volume")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Timer for refreshing
  useEffect(() => {
    const timer = setInterval(() => {
      setKeywords(prev => prev.map(kw => ({
        ...kw,
        isRefreshing: false
      })))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Derived data
  const selectedCount = useMemo(
    () => keywords.filter(k => k.isSelected).length, 
    [keywords]
  )
  
  const totalVolume = useMemo(
    () => keywords.reduce((acc, k) => acc + (k.volume || 0), 0), 
    [keywords]
  )
  
  const avgKd = useMemo(
    () => {
      const withKd = keywords.filter(k => k.kd !== null)
      if (withKd.length === 0) return 0
      return Math.round(withKd.reduce((acc, k) => acc + (k.kd || 0), 0) / withKd.length)
    }, 
    [keywords]
  )
  
  const avgCpc = useMemo(
    () => {
      const withCpc = keywords.filter(k => k.cpc !== null)
      if (withCpc.length === 0) return 0
      return (withCpc.reduce((acc, k) => acc + (k.cpc || 0), 0) / withCpc.length).toFixed(2)
    }, 
    [keywords]
  )

  // Filtered & Sorted keywords
  const filteredKeywords = useMemo(() => {
    let result = [...keywords]
    
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(k => 
        k.keyword.toLowerCase().includes(query) ||
        k.source.toLowerCase().includes(query) ||
        k.parentTopic?.toLowerCase().includes(query)
      )
    }
    
    // Volume filter
    if (volumeMin) {
      result = result.filter(k => (k.volume || 0) >= parseInt(volumeMin))
    }
    if (volumeMax) {
      result = result.filter(k => (k.volume || 0) <= parseInt(volumeMax))
    }
    
    // KD filter
    if (kdMin) {
      result = result.filter(k => (k.kd || 0) >= parseInt(kdMin))
    }
    if (kdMax) {
      result = result.filter(k => (k.kd || 0) <= parseInt(kdMax))
    }
    
    // Intent filter
    if (intentFilters.length > 0) {
      result = result.filter(k => k.intent && intentFilters.includes(k.intent))
    }
    
    // Source filter
    if (sourceFilters.length > 0) {
      result = result.filter(k => sourceFilters.includes(k.source))
    }
    
    // SERP filter
    if (serpFilters.length > 0) {
      result = result.filter(k => 
        k.serpFeatures.some(f => serpFilters.includes(f))
      )
    }
    
    // Sorting
    result.sort((a, b) => {
      let aVal: number | string | Date | null = null
      let bVal: number | string | Date | null = null
      
      switch (sortField) {
        case "keyword":
          aVal = a.keyword
          bVal = b.keyword
          break
        case "volume":
          aVal = a.volume ?? 0
          bVal = b.volume ?? 0
          break
        case "kd":
          aVal = a.kd ?? 0
          bVal = b.kd ?? 0
          break
        case "cpc":
          aVal = a.cpc ?? 0
          bVal = b.cpc ?? 0
          break
        case "trafficPotential":
          aVal = a.trafficPotential ?? 0
          bVal = b.trafficPotential ?? 0
          break
        case "position":
          aVal = a.position ?? 999
          bVal = b.position ?? 999
          break
        case "clicks":
          aVal = a.clicks ?? 0
          bVal = b.clicks ?? 0
          break
        case "wordCount":
          aVal = a.wordCount
          bVal = b.wordCount
          break
        case "businessPotential":
          aVal = a.businessPotential
          bVal = b.businessPotential
          break
        case "source":
          aVal = a.source
          bVal = b.source
          break
        case "lastUpdated":
          aVal = a.lastUpdated?.getTime() ?? 0
          bVal = b.lastUpdated?.getTime() ?? 0
          break
        case "priorityScore":
          aVal = calculatePriorityScore(a)
          bVal = calculatePriorityScore(b)
          break
      }
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === "asc" 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number)
    })
    
    return result
  }, [
    keywords, searchQuery, volumeMin, volumeMax, kdMin, kdMax,
    intentFilters, sourceFilters, serpFilters, sortField, sortDirection
  ])

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }, [sortField])
  
  const toggleSelect = useCallback((id: string) => {
    setKeywords(prev => prev.map(k => 
      k.id === id ? { ...k, isSelected: !k.isSelected } : k
    ))
  }, [])
  
  const selectAll = useCallback(() => {
    const allSelected = filteredKeywords.every(k => k.isSelected)
    setKeywords(prev => prev.map(k => ({
      ...k,
      isSelected: filteredKeywords.some(fk => fk.id === k.id) ? !allSelected : k.isSelected
    })))
  }, [filteredKeywords])
  
  const updateBusinessPotential = useCallback((id: string, value: BusinessPotential) => {
    setKeywords(prev => prev.map(k => 
      k.id === id ? { ...k, businessPotential: value } : k
    ))
  }, [])

  const handleImport = useCallback((sourceId: string) => {
    const newKeywords = generateKeywordData(sourceId)
    setKeywords(prev => [...prev, ...newKeywords])
    toast.success(`Imported ${newKeywords.length} keywords`)
  }, [])
  
  const handleDeleteSelected = useCallback(() => {
    const count = keywords.filter(k => k.isSelected).length
    setKeywords(prev => prev.filter(k => !k.isSelected))
    toast.success(`Deleted ${count} keywords`)
  }, [keywords])
  
  const handleClearAll = useCallback(() => {
    setKeywords([])
    toast.success("Cleared all keywords")
  }, [])
  
  const handleManualAdd = useCallback(() => {
    if (!manualText.trim()) {
      toast.error("Enter at least one keyword")
      return
    }
    
    const lines = manualText.split("\n").filter(l => l.trim())
    const newKeywords: Keyword[] = lines.map(line => {
      const parts = line.split(",").map(p => p.trim())
      const kw = parts[0]
      const volume = parseInt(parts[1]) || Math.floor(Math.random() * 10000) + 500
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        keyword: kw,
        source: "Manual Entry",
        sourceTag: "User Added",
        isSelected: false,
        volume,
        kd: parseInt(parts[2]) || Math.floor(Math.random() * 80) + 10,
        cpc: parseFloat(parts[3]) || Math.random() * 5,
        intent: (["informational", "transactional", "commercial", "navigational"] as const)[Math.floor(Math.random() * 4)],
        trend: (["up", "down", "stable"] as const)[Math.floor(Math.random() * 3)],
        trendPercent: Math.floor(Math.random() * 30) - 10,
        trafficPotential: Math.floor(volume * 1.2),
        clicks: null,
        cps: null,
        businessPotential: 0,
        position: null,
        positionChange: null,
        rankingUrl: null,
        serpFeatures: [],
        hasFeaturedSnippet: false,
        parentTopic: null,
        wordCount: kw.split(" ").length,
        competition: null,
        results: null,
        lastUpdated: new Date(),
      }
    })
    
    setKeywords(prev => [...prev, ...newKeywords])
    setManualText("")
    setShowManualInput(false)
    toast.success(`Added ${newKeywords.length} keywords`)
  }, [manualText])
  
  const openKeywordPanel = useCallback((keyword: Keyword) => {
    setSelectedKeyword(keyword)
    setShowSidePanel(true)
  }, [])
  
  const closeKeywordPanel = useCallback(() => {
    setShowSidePanel(false)
    setSelectedKeyword(null)
  }, [])
  
  const clearFilters = useCallback(() => {
    setVolumeMin("")
    setVolumeMax("")
    setKdMin("")
    setKdMax("")
    setIntentFilters([])
    setSourceFilters([])
    setSerpFilters([])
    setSearchQuery("")
  }, [])

  return {
    // State
    keywords,
    setKeywords,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    showManualInput,
    setShowManualInput,
    manualText,
    setManualText,
    showImportModal,
    setShowImportModal,
    pendingImportKeywords,
    setPendingImportKeywords,
    importStep,
    setImportStep,
    newProjectName,
    setNewProjectName,
    newProjectDescription,
    setNewProjectDescription,
    selectedProjectId,
    setSelectedProjectId,
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    selectedKeyword,
    setSelectedKeyword,
    showSidePanel,
    setShowSidePanel,
    showContentBrief,
    setShowContentBrief,
    briefKeywords,
    setBriefKeywords,
    
    // Filter state
    volumeMin,
    setVolumeMin,
    volumeMax,
    setVolumeMax,
    kdMin,
    setKdMin,
    kdMax,
    setKdMax,
    intentFilters,
    setIntentFilters,
    sourceFilters,
    setSourceFilters,
    serpFilters,
    setSerpFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    
    // Derived
    selectedCount,
    totalVolume,
    avgKd,
    avgCpc,
    filteredKeywords,
    
    // Handlers
    handleSort,
    toggleSelect,
    selectAll,
    updateBusinessPotential,
    handleImport,
    handleDeleteSelected,
    handleClearAll,
    handleManualAdd,
    openKeywordPanel,
    closeKeywordPanel,
    clearFilters,
  }
}
