// ============================================
// RANK TRACKER - Edit Keyword Modal
// ============================================

"use client"

import { useState, useEffect, useCallback } from "react"
import { Edit2, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WORLDWIDE, TIER1_COUNTRIES } from "../../constants/countries"
import type { RankData } from "../../types"

interface EditKeywordModalProps {
  keyword: RankData | null
  onClose: () => void
  onSave: (keywordId: string, newKeyword: string, newCountry: string) => Promise<void | boolean>
  isEditing: boolean
}

export function EditKeywordModal({
  keyword,
  onClose,
  onSave,
  isEditing,
}: EditKeywordModalProps) {
  const [editKeywordText, setEditKeywordText] = useState("")
  const [editKeywordCountry, setEditKeywordCountry] = useState("")
  // Sync state when keyword changes
  useEffect(() => {
    if (keyword) {
      setEditKeywordText(keyword.keyword)
      setEditKeywordCountry(keyword.country || "US")
    }
  }, [keyword])

  const handleSave = useCallback(async () => {
    if (!keyword || !editKeywordText.trim()) return
    await onSave(keyword.id, editKeywordText.trim(), editKeywordCountry)
  }, [keyword, editKeywordText, editKeywordCountry, onSave])

  const handleClose = useCallback(() => {
    if (!isEditing) {
      setEditKeywordText("")
      setEditKeywordCountry("")
      onClose()
    }
  }, [isEditing, onClose])

  return (
    <Dialog open={!!keyword} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-emerald-400" />
            Edit Keyword
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update keyword text and target country
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editKeyword" className="text-sm">Keyword</Label>
            <Input
              id="editKeyword"
              value={editKeywordText}
              onChange={(e) => setEditKeywordText(e.target.value)}
              placeholder="Enter keyword"
              className="bg-background border-border"
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCountry" className="text-sm">Target Country</Label>
            <Select 
              value={editKeywordCountry} 
              onValueChange={setEditKeywordCountry}
              disabled={isEditing}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {/* Worldwide */}
                <SelectItem value={WORLDWIDE.code}>
                  {WORLDWIDE.flag} {WORLDWIDE.name}
                </SelectItem>
                {/* Tier 1 Countries */}
                {TIER1_COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isEditing}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isEditing || !editKeywordText.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isEditing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
