"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Sparkles } from "lucide-react"
import { AMAZON_CATEGORIES } from "../constants"

interface AddKeywordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (keyword: string, category: string) => Promise<{ success: boolean }>
}

export function AddKeywordDialog({ open, onOpenChange, onAdd }: AddKeywordDialogProps) {
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword")
      return
    }
    if (!category) {
      setError("Please select a category")
      return
    }

    setIsSubmitting(true)
    setError("")

    const result = await onAdd(keyword.trim(), category)
    
    if (result.success) {
      setKeyword("")
      setCategory("")
      onOpenChange(false)
    } else {
      setError("Failed to add keyword. Please try again.")
    }

    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setKeyword("")
      setCategory("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Add Amazon Keyword
          </DialogTitle>
          <DialogDescription>
            Add a new keyword to track on Amazon. We'll fetch rankings, pricing, and competition data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setError("")
              }}
              placeholder="e.g., wireless earbuds, yoga mat"
              disabled={isSubmitting}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setError("") }} disabled={isSubmitting}>
              <SelectTrigger id="category" className="h-10">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {AMAZON_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What we'll track:</p>
            <ul className="space-y-1 text-xs">
              <li>• Product rankings & position changes</li>
              <li>• Average pricing & ratings</li>
              <li>• Competition & sponsored listings</li>
              <li>• Review velocity trends</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Keyword
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
