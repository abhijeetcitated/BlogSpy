/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * ➕ ADD KEYWORD MODAL - Track New Keyword in AI Visibility
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Modal for adding new keywords to track across AI platforms.
 * User enters a question/keyword and we check if their brand is mentioned in AI responses.
 * 
 * @example
 * ```tsx
 * <AddKeywordModal 
 *   open={showModal} 
 *   onClose={() => setShowModal(false)}
 *   onAdd={(keyword) => trackKeyword(keyword)}
 * />
 * ```
 */

"use client"

import { useState } from "react"
import { 
  Search, 
  Sparkles, 
  Lightbulb,
  TrendingUp,
  HelpCircle
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface AddKeywordModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when keyword is added */
  onAdd: (keyword: string, category?: string) => void
  /** Loading state */
  isAdding?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SUGGESTED KEYWORDS (Examples)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const KEYWORD_SUGGESTIONS = [
  { text: "Best SEO tools 2025", icon: TrendingUp },
  { text: "How to improve website ranking", icon: HelpCircle },
  { text: "Top keyword research tools", icon: Search },
  { text: "AI writing tools comparison", icon: Sparkles },
]

const KEYWORD_CATEGORIES = [
  "Product",
  "Comparison",
  "How-to",
  "Review",
  "Feature",
  "Other",
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function AddKeywordModal({
  open,
  onClose,
  onAdd,
  isAdding = false,
}: AddKeywordModalProps) {
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [error, setError] = useState("")

  const handleClose = () => {
    setKeyword("")
    setCategory(undefined)
    setError("")
    onClose()
  }

  const handleAdd = () => {
    const trimmed = keyword.trim()
    
    if (!trimmed) {
      setError("Please enter a keyword or question")
      return
    }

    if (trimmed.length < 3) {
      setError("Keyword must be at least 3 characters")
      return
    }

    if (trimmed.length > 200) {
      setError("Keyword is too long (max 200 characters)")
      return
    }

    onAdd(trimmed, category)
    handleClose()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setKeyword(suggestion)
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAdding) {
      handleAdd()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Track New Keyword
          </DialogTitle>
          <DialogDescription>
            Enter a keyword or question to track. We&apos;ll check if AI platforms mention your brand when users ask this question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Keyword Input */}
          <div className="space-y-2">
            <Label htmlFor="keyword" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Keyword / Question
            </Label>
            <Input
              id="keyword"
              placeholder="e.g., Best SEO tools for small business"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setError("")
              }}
              onKeyPress={handleKeyPress}
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This is what users might ask AI assistants. We&apos;ll check if you get mentioned.
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Category (Optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setCategory(category === cat ? undefined : cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {KEYWORD_SUGGESTIONS.map((suggestion, i) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-2 p-2 text-left text-sm rounded-md border border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!keyword.trim() || isAdding}>
            {isAdding ? (
              "Adding..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Track Keyword
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddKeywordModal
