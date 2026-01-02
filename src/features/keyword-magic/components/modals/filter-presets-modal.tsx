"use client"

// ============================================
// FILTER PRESETS MODAL - Save/load filter presets
// ============================================

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, Trash2, Check } from "lucide-react"
import type { FilterState } from "../../types"

interface FilterPreset {
  id: string
  name: string
  filters: Partial<FilterState>
  createdAt: Date
}

interface FilterPresetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilters: FilterState
  presets: FilterPreset[]
  onSavePreset: (name: string, filters: FilterState) => void
  onLoadPreset: (preset: FilterPreset) => void
  onDeletePreset: (id: string) => void
}

export function FilterPresetsModal({
  open,
  onOpenChange,
  currentFilters,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: FilterPresetsModalProps) {
  const [newPresetName, setNewPresetName] = useState("")

  const handleSave = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim(), currentFilters)
      setNewPresetName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Presets</DialogTitle>
          <DialogDescription>
            Save your current filters or load a saved preset.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Save new preset */}
          <div className="space-y-2">
            <Label>Save Current Filters</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Preset name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
              <Button onClick={handleSave} disabled={!newPresetName.trim()}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Saved presets */}
          <div className="space-y-2">
            <Label>Saved Presets</Label>
            {presets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No saved presets yet
              </p>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 rounded-md border border-border hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onLoadPreset(preset)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeletePreset(preset.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
