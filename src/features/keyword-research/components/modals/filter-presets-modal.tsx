"use client"

// ============================================
// FILTER PRESETS MODAL - Save/load filter presets
// ============================================

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"
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
import { Save, Trash2, Check, Star } from "lucide-react"
import { useKeywordStore } from "../../store"
import {
  saveFilterPreset,
  getFilterPresets,
  deleteFilterPreset,
  setDefaultPreset,
} from "../../actions/filter-presets"

interface FilterPresetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterPresetsModal({
  open,
  onOpenChange,
}: FilterPresetsModalProps) {
  const [newPresetName, setNewPresetName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filters = useKeywordStore((state) => state.filters)
  const presets = useKeywordStore((state) => state.presets)
  const setPresets = useKeywordStore((state) => state.setPresets)
  const addPreset = useKeywordStore((state) => state.addPreset)
  const removePreset = useKeywordStore((state) => state.removePreset)
  const applyPreset = useKeywordStore((state) => state.applyPreset)

  const { executeAsync: executeSave } = useAction(saveFilterPreset)
  const { executeAsync: executeFetch } = useAction(getFilterPresets)
  const { executeAsync: executeDelete } = useAction(deleteFilterPreset)
  const { executeAsync: executeDefault } = useAction(setDefaultPreset)

  const handleSave = () => {
    if (newPresetName.trim()) {
      void (async () => {
        setIsLoading(true)
        const result = await executeSave({
          name: newPresetName.trim(),
          filters: filters as unknown as Record<string, unknown>,
        })
        setIsLoading(false)

        if (result?.data?.success) {
          addPreset(result.data.preset)
          setNewPresetName("")
        }
      })()
    }
  }

  const handleLoad = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId)
    if (!preset) return
    applyPreset(preset)
    onOpenChange(false)
  }

  const handleDelete = (presetId: string) => {
    void (async () => {
      const result = await executeDelete({ id: presetId })
      if (result?.data?.success) {
        removePreset(presetId)
      }
    })()
  }

  const handleSetDefault = (presetId: string) => {
    void (async () => {
      const result = await executeDefault({ id: presetId })
      if (result?.data?.success) {
        const updated = result.data.preset
        setPresets(
          presets.map((item) => ({
            ...item,
            isDefault: item.id === updated.id,
          }))
        )
      }
    })()
  }

  useEffect(() => {
    if (!open) return
    void (async () => {
      setIsLoading(true)
      const result = await executeFetch({})
      setIsLoading(false)
      if (result?.data?.success) {
        setPresets(result.data.presets)
      }
    })()
  }, [open, executeFetch, setPresets])

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
              <Button onClick={handleSave} disabled={!newPresetName.trim() || isLoading}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Saved presets */}
          <div className="space-y-2">
            <Label>Saved Presets</Label>
            {presets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {isLoading ? "Loading presets..." : "No saved presets yet"}
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
                          onClick={() => handleLoad(preset.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(preset.id)}
                        >
                          <Star
                            className={
                              preset.isDefault
                                ? "h-4 w-4 text-amber-500"
                                : "h-4 w-4 text-muted-foreground"
                            }
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(preset.id)}
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
