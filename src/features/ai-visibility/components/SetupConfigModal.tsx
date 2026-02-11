/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔧 SETUP CONFIG MODAL - AI Visibility First-Time Setup
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Modal dialog for configuring AI Visibility tracking.
 * Shows on first visit or when user wants to update settings.
 * 
 * Collects:
 * - Domain to track (e.g., techyatri.com)
 * - Brand keywords to search for (e.g., "TechYatri", "Tech Yatri")
 * - Optional competitor domains
 * 
 * @example
 * ```tsx
 * <SetupConfigModal 
 *   open={showSetup} 
 *   onClose={() => setShowSetup(false)}
 *   onSave={(config) => saveConfig(config)}
 * />
 * ```
 */

"use client"

import { useEffect, useState } from "react"
import { 
  Globe, 
  Tag, 
  Users, 
  X, 
  Plus, 
  Sparkles,
  CheckCircle2,
  Folder
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { AIVisibilityConfig } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** Simplified user project for the picker */
export interface UserProjectOption {
  id: string
  projectname: string
  domain: string
  icon?: string | null
}

export interface SetupConfigModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when config is saved */
  onSave: (config: Omit<AIVisibilityConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  /** Existing config for editing (optional) */
  existingConfig?: AIVisibilityConfig | null
  /** Loading state during save */
  isSaving?: boolean
  /** Available user projects from userprojects table */
  userProjects?: UserProjectOption[]
  /** 
   * When set, domain/name fields are locked to this sidebar project.
   * Project picker and manual domain entry are hidden.
   */
  linkedProject?: UserProjectOption | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Normalizes domain input (removes protocol, www, paths)
 */
function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, "")
  domain = domain.replace(/^www\./, "")
  domain = domain.split("/")[0]
  domain = domain.split("?")[0]
  return domain
}

/**
 * Validates domain format
 */
function isValidDomain(domain: string): boolean {
  if (!domain || !domain.includes(".")) return false
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/
  return domainRegex.test(domain)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function SetupConfigModal({
  open,
  onClose,
  onSave,
  existingConfig,
  isSaving = false,
  userProjects = [],
  linkedProject = null,
}: SetupConfigModalProps) {
  // Resolve domain and name from linked project (priority) or existing config
  const resolvedDomain = linkedProject
    ? normalizeDomain(linkedProject.domain)
    : existingConfig?.trackedDomain ?? ""
  const resolvedProjectName = linkedProject?.projectname ?? existingConfig?.projectName ?? ""
  const resolvedProjectId = linkedProject?.id ?? existingConfig?.projectId ?? null

  // Form state — domain/name are read-only when linkedProject is set
  const [domain, setDomain] = useState(resolvedDomain)
  const [domainError, setDomainError] = useState("")

  const [projectName, setProjectName] = useState(resolvedProjectName)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(resolvedProjectId)
  
  const [brandKeywordInput, setBrandKeywordInput] = useState("")
  const [brandKeywords, setBrandKeywords] = useState<string[]>(existingConfig?.brandKeywords ?? [])
  
  const [competitorInput, setCompetitorInput] = useState("")
  const [competitors, setCompetitors] = useState<string[]>(existingConfig?.competitorDomains ?? [])

  // Whether the modal is in "linked project" mode (domain/name locked)
  const isLinkedMode = !!linkedProject

  useEffect(() => {
    if (!open) return
    const d = linkedProject ? normalizeDomain(linkedProject.domain) : existingConfig?.trackedDomain ?? ""
    const n = linkedProject?.projectname ?? existingConfig?.projectName ?? ""
    const pid = linkedProject?.id ?? existingConfig?.projectId ?? null
    setDomain(d)
    setDomainError("")
    setProjectName(n)
    setSelectedProjectId(pid)
    setBrandKeywordInput("")
    setBrandKeywords(existingConfig?.brandKeywords ?? [])
    setCompetitorInput("")
    setCompetitors(existingConfig?.competitorDomains ?? [])

    // Auto-add domain brand keyword if none exist and we have a domain
    if (!existingConfig?.brandKeywords?.length && d) {
      const domainBrand = d.split(".")[0]
      if (domainBrand) setBrandKeywords([domainBrand])
    }
  }, [existingConfig, open, linkedProject])

  /** When user picks an existing project (only in non-linked mode) */
  const handleProjectSelect = (projectId: string) => {
    if (isLinkedMode) return // Locked — can't switch
    if (projectId === "__manual__") {
      setSelectedProjectId(null)
      return
    }
    const project = userProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProjectId(project.id)
      const normalized = normalizeDomain(project.domain)
      setDomain(normalized)
      setDomainError("")
      if (!projectName.trim()) {
        setProjectName(project.projectname)
      }
      if (brandKeywords.length === 0) {
        const domainBrand = normalized.split(".")[0]
        if (domainBrand) setBrandKeywords([domainBrand])
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  const handleDomainChange = (value: string) => {
    setDomain(value)
    setDomainError("")
  }

  const handleDomainBlur = () => {
    if (domain) {
      const normalized = normalizeDomain(domain)
      setDomain(normalized)
      
      if (!isValidDomain(normalized)) {
        setDomainError("Please enter a valid domain (e.g., example.com)")
      }
    }
  }

  const addBrandKeyword = () => {
    const keyword = brandKeywordInput.trim()
    if (keyword && !brandKeywords.includes(keyword)) {
      setBrandKeywords([...brandKeywords, keyword])
      setBrandKeywordInput("")
    }
  }

  const removeBrandKeyword = (keyword: string) => {
    setBrandKeywords(brandKeywords.filter(k => k !== keyword))
  }

  const handleBrandKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addBrandKeyword()
    }
  }

  const addCompetitor = () => {
    const competitor = normalizeDomain(competitorInput)
    if (competitor && isValidDomain(competitor) && !competitors.includes(competitor)) {
      setCompetitors([...competitors, competitor])
      setCompetitorInput("")
    }
  }

  const removeCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor))
  }

  const handleCompetitorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCompetitor()
    }
  }

  const handleSave = () => {
    // Validate
    const normalizedDomain = normalizeDomain(domain)
    
    if (!isValidDomain(normalizedDomain)) {
      setDomainError("Please enter a valid domain")
      return
    }

    const resolvedProjectName = projectName.trim() || normalizedDomain

    if (brandKeywords.length === 0) {
      // Auto-add domain as brand keyword if none provided
      const domainBrand = normalizedDomain.split(".")[0]
      brandKeywords.push(domainBrand)
    }

    onSave({
      projectName: resolvedProjectName,
      trackedDomain: normalizedDomain,
      projectId: selectedProjectId ?? undefined,
      brandKeywords,
      competitorDomains: competitors.length > 0 ? competitors : undefined,
    })
  }

  const isValid = isLinkedMode
    ? true // domain comes from sidebar project, always valid
    : domain && !domainError && isValidDomain(normalizeDomain(domain))

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {existingConfig ? "Update AI Visibility Settings" : "Configure AI Visibility"}
          </DialogTitle>
          <DialogDescription>
            {isLinkedMode
              ? `Configure brand keywords and competitors for ${resolvedDomain}`
              : "Configure which domain and brand to track across AI platforms like ChatGPT, Claude, and Perplexity."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-1">
          {/* ── Linked Project Info (read-only) ── */}
          {isLinkedMode && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Folder className="h-4 w-4 text-muted-foreground" />
                {resolvedProjectName}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                {resolvedDomain}
              </div>
            </div>
          )}

          {/* ── Project Picker (only in non-linked, non-edit mode) ── */}
          {!isLinkedMode && userProjects.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                Link to Existing Project
              </Label>
              <Select
                value={selectedProjectId ?? "__manual__"}
                onValueChange={handleProjectSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__manual__">
                    <span className="text-muted-foreground">Enter manually</span>
                  </SelectItem>
                  {userProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {project.projectname}
                        <span className="text-xs text-muted-foreground">({project.domain})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pick an existing project to auto-fill domain, or enter a new one manually
              </p>
            </div>
          )}

          {/* Project Name — hidden in linked mode */}
          {!isLinkedMode && (
            <div className="space-y-2">
              <Label htmlFor="projectName" className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                Project Name
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </Label>
              <Input
                id="projectName"
                placeholder="Client - Example"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Friendly label to identify this domain in reports
              </p>
            </div>
          )}

          {/* Domain Input — hidden in linked mode */}
          {!isLinkedMode && (
            <div className="space-y-2">
              <Label htmlFor="domain" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Your Domain <span className="text-red-500">*</span>
              </Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                onBlur={handleDomainBlur}
                className={domainError ? "border-red-500" : ""}
              />
              {domainError && (
                <p className="text-sm text-red-500">{domainError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The main domain you want to track in AI responses
              </p>
            </div>
          )}

          {/* Brand Keywords */}
          <div className="space-y-2">
            <Label htmlFor="brandKeywords" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Brand Keywords
            </Label>
            <div className="flex gap-2">
              <Input
                id="brandKeywords"
                placeholder="Add brand name (e.g., TechYatri)"
                value={brandKeywordInput}
                onChange={(e) => setBrandKeywordInput(e.target.value)}
                onKeyPress={handleBrandKeywordKeyPress}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={addBrandKeyword}
                disabled={!brandKeywordInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {brandKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {brandKeywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {keyword}
                    <button
                      onClick={() => removeBrandKeyword(keyword)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Names AI might use to mention you (brand, product names, etc.)
            </p>
          </div>

          {/* Competitor Domains (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="competitors" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Competitor Domains
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </Label>
            <div className="flex gap-2">
              <Input
                id="competitors"
                placeholder="competitor.com"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyPress={handleCompetitorKeyPress}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={addCompetitor}
                disabled={!competitorInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {competitors.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {competitors.map((competitor) => (
                  <Badge 
                    key={competitor} 
                    variant="outline"
                    className="flex items-center gap-1 pr-1"
                  >
                    {competitor}
                    <button
                      onClick={() => removeCompetitor(competitor)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Compare your visibility against competitors
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {existingConfig ? "Update Settings" : "Save & Start Tracking"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SetupConfigModal
