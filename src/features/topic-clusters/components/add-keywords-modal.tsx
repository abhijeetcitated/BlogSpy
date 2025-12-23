"use client"

// ============================================
// ADD KEYWORDS MODAL
// ============================================
// Modal for adding keywords to a project
// Supports manual entry, CSV paste, and future API import

import { useState } from "react"
import { AddKeywordDto, KeywordSource } from "../types/project.types"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, FileSpreadsheet, Keyboard, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddKeywordsModalProps {
  open: boolean
  onClose: () => void
  onAdd: (keywords: AddKeywordDto[]) => Promise<void>
}

interface ParsedKeyword {
  keyword: string
  volume?: number
  kd?: number
  cpc?: number
  intent?: string
  valid: boolean
  error?: string
}

export function AddKeywordsModal({ open, onClose, onAdd }: AddKeywordsModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState("")

  // Manual entry state
  const [manualKeywords, setManualKeywords] = useState<AddKeywordDto[]>([
    { keyword: "", source: "manual", sourceTag: "Manual Entry" }
  ])

  // CSV state
  const [csvText, setCsvText] = useState("")
  const [parsedKeywords, setParsedKeywords] = useState<ParsedKeyword[]>([])
  const [csvError, setCsvError] = useState("")

  // ============================================
  // MANUAL ENTRY HANDLERS
  // ============================================

  const addManualRow = () => {
    setManualKeywords([
      ...manualKeywords,
      { keyword: "", source: "manual", sourceTag: "Manual Entry" }
    ])
  }

  const removeManualRow = (index: number) => {
    if (manualKeywords.length > 1) {
      setManualKeywords(manualKeywords.filter((_, i) => i !== index))
    }
  }

  const updateManualKeyword = (index: number, field: keyof AddKeywordDto, value: string | number) => {
    const updated = [...manualKeywords]
    updated[index] = { ...updated[index], [field]: value }
    setManualKeywords(updated)
  }

  // ============================================
  // CSV PARSER
  // ============================================

  const parseCSV = (text: string) => {
    setCsvError("")
    
    if (!text.trim()) {
      setParsedKeywords([])
      return
    }

    const lines = text.trim().split("\n")
    const parsed: ParsedKeyword[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Try to parse as CSV (keyword, volume, kd, cpc, intent)
      // Support both comma and tab separated
      const separator = line.includes("\t") ? "\t" : ","
      const parts = line.split(separator).map(p => p.trim().replace(/"/g, ""))

      if (parts.length === 0 || !parts[0]) continue

      const kw: ParsedKeyword = {
        keyword: parts[0],
        volume: parts[1] ? parseInt(parts[1]) : undefined,
        kd: parts[2] ? parseInt(parts[2]) : undefined,
        cpc: parts[3] ? parseFloat(parts[3]) : undefined,
        intent: parts[4] || undefined,
        valid: true
      }

      // Validate
      if (!kw.keyword) {
        kw.valid = false
        kw.error = "Empty keyword"
      } else if (kw.keyword.length > 200) {
        kw.valid = false
        kw.error = "Keyword too long (max 200 chars)"
      }

      // Validate numbers
      if (kw.volume !== undefined && (isNaN(kw.volume) || kw.volume < 0)) {
        kw.volume = undefined
      }
      if (kw.kd !== undefined && (isNaN(kw.kd) || kw.kd < 0 || kw.kd > 100)) {
        kw.kd = undefined
      }
      if (kw.cpc !== undefined && (isNaN(kw.cpc) || kw.cpc < 0)) {
        kw.cpc = undefined
      }

      parsed.push(kw)
    }

    setParsedKeywords(parsed)

    // Show error if no valid keywords
    const validCount = parsed.filter(p => p.valid).length
    if (parsed.length > 0 && validCount === 0) {
      setCsvError("No valid keywords found. Check your format.")
    }
  }

  // ============================================
  // SUBMIT HANDLERS
  // ============================================

  const handleSubmit = async () => {
    setIsAdding(true)
    setError("")

    try {
      let keywordsToAdd: AddKeywordDto[] = []

      if (activeTab === "manual") {
        // Filter out empty keywords
        keywordsToAdd = manualKeywords.filter(k => k.keyword.trim())
        
        if (keywordsToAdd.length === 0) {
          setError("Please enter at least one keyword")
          setIsAdding(false)
          return
        }

        // Ensure proper source
        keywordsToAdd = keywordsToAdd.map(k => ({
          ...k,
          keyword: k.keyword.trim(),
          source: "manual" as KeywordSource,
          sourceTag: "Manual Entry"
        }))

      } else {
        // CSV mode
        const validKeywords = parsedKeywords.filter(p => p.valid)
        
        if (validKeywords.length === 0) {
          setError("No valid keywords to add")
          setIsAdding(false)
          return
        }

        keywordsToAdd = validKeywords.map(k => ({
          keyword: k.keyword,
          volume: k.volume,
          kd: k.kd,
          cpc: k.cpc,
          intent: k.intent as AddKeywordDto["intent"],
          source: "csv_import" as KeywordSource,
          sourceTag: "CSV Import"
        }))
      }

      await onAdd(keywordsToAdd)
      
      // Reset and close
      handleClose()

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add keywords")
    } finally {
      setIsAdding(false)
    }
  }

  const handleClose = () => {
    if (!isAdding) {
      setManualKeywords([{ keyword: "", source: "manual", sourceTag: "Manual Entry" }])
      setCsvText("")
      setParsedKeywords([])
      setError("")
      setCsvError("")
      setActiveTab("manual")
      onClose()
    }
  }

  // ============================================
  // RENDER
  // ============================================

  const validCsvCount = parsedKeywords.filter(p => p.valid).length
  const canSubmit = activeTab === "manual"
    ? manualKeywords.some(k => k.keyword.trim())
    : validCsvCount > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col w-[calc(100vw-32px)]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Add Keywords</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Add keywords to your project manually or import from CSV
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "csv")} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Keyboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:hidden">Manual</span>
              <span className="hidden sm:inline">Manual Entry</span>
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:hidden">CSV</span>
              <span className="hidden sm:inline">CSV Import</span>
            </TabsTrigger>
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="flex-1 overflow-hidden flex flex-col mt-3 sm:mt-4">
            <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2">
              {manualKeywords.map((kw, index) => (
                <div key={index} className="flex items-start gap-1.5 sm:gap-2">
                  {/* Mobile layout: Stack inputs */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    <div className="col-span-2">
                      <Input
                        placeholder="Keyword"
                        value={kw.keyword}
                        onChange={(e) => updateManualKeyword(index, "keyword", e.target.value)}
                        disabled={isAdding}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <Input
                      type="number"
                      placeholder="Volume"
                      value={kw.volume || ""}
                      onChange={(e) => updateManualKeyword(index, "volume", parseInt(e.target.value) || 0)}
                      disabled={isAdding}
                      className="h-9 sm:h-10 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="KD"
                      value={kw.kd || ""}
                      onChange={(e) => updateManualKeyword(index, "kd", parseInt(e.target.value) || 0)}
                      disabled={isAdding}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeManualRow(index)}
                    disabled={manualKeywords.length <= 1 || isAdding}
                    className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addManualRow}
              disabled={isAdding}
              className="mt-2 sm:mt-3 h-9 sm:h-10 text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Add Row
            </Button>
          </TabsContent>

          {/* CSV Tab */}
          <TabsContent value="csv" className="flex-1 overflow-hidden flex flex-col mt-3 sm:mt-4">
            <div className="space-y-2 sm:space-y-3 flex-1 overflow-hidden flex flex-col">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Paste CSV Data</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Format: keyword, volume, kd, cpc, intent (one per line)
                </p>
                <Textarea
                  placeholder={`seo basics, 12000, 45, 2.5, informational
what is seo, 8000, 35, 1.8, informational
seo tools, 5000, 55, 3.2, commercial`}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value)
                    parseCSV(e.target.value)
                  }}
                  disabled={isAdding}
                  className="min-h-[100px] sm:min-h-[120px] font-mono text-xs sm:text-sm"
                />
              </div>

              {/* Preview */}
              {parsedKeywords.length > 0 && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <Label className="text-sm">Preview</Label>
                    <Badge variant={validCsvCount > 0 ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                      {validCsvCount} valid / {parsedKeywords.length} total
                    </Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto border rounded-lg">
                    <div className="divide-y">
                      {parsedKeywords.slice(0, 10).map((kw, i) => (
                        <div
                          key={i}
                          className={cn(
                            "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-0",
                            !kw.valid && "bg-destructive/10"
                          )}
                        >
                          <span className={cn("truncate", !kw.valid && "text-destructive")}>
                            {kw.keyword}
                          </span>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                            {kw.volume && <span>Vol: {kw.volume.toLocaleString()}</span>}
                            {kw.kd !== undefined && <span>KD: {kw.kd}</span>}
                            {!kw.valid && (
                              <Badge variant="destructive" className="text-[9px] sm:text-[10px]">
                                {kw.error}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {parsedKeywords.length > 10 && (
                        <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground text-center">
                          And {parsedKeywords.length - 10} more...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {csvError && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  {csvError}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="text-xs sm:text-sm text-destructive">{error}</p>
        )}

        <DialogFooter className="mt-3 sm:mt-4 flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isAdding} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isAdding || !canSubmit} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
            {isAdding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add Keywords</span>
                {activeTab === "csv" && validCsvCount > 0 && ` (${validCsvCount})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddKeywordsModal
