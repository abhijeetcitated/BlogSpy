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

import { useState } from "react"
import { 
  Globe, 
  Tag, 
  Users, 
  X, 
  Plus, 
  Sparkles,
  CheckCircle2
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

import type { AIVisibilityConfig } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

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
}: SetupConfigModalProps) {
  // Form state - initialize from existingConfig
  const [domain, setDomain] = useState(existingConfig?.trackedDomain ?? "")
  const [domainError, setDomainError] = useState("")
  
  const [brandKeywordInput, setBrandKeywordInput] = useState("")
  const [brandKeywords, setBrandKeywords] = useState<string[]>(existingConfig?.brandKeywords ?? [])
  
  const [competitorInput, setCompetitorInput] = useState("")
  const [competitors, setCompetitors] = useState<string[]>(existingConfig?.competitorDomains ?? [])

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

    if (brandKeywords.length === 0) {
      // Auto-add domain as brand keyword if none provided
      const domainBrand = normalizedDomain.split(".")[0]
      brandKeywords.push(domainBrand)
    }

    onSave({
      trackedDomain: normalizedDomain,
      brandKeywords,
      competitorDomains: competitors.length > 0 ? competitors : undefined,
    })
  }

  const isValid = domain && !domainError && isValidDomain(normalizeDomain(domain))

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {existingConfig ? "Update AI Visibility Settings" : "Setup AI Visibility Tracking"}
          </DialogTitle>
          <DialogDescription>
            Configure which domain and brand to track across AI platforms like ChatGPT, Claude, and Perplexity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Domain Input */}
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
                {existingConfig ? "Update Settings" : "Start Tracking"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SetupConfigModal
