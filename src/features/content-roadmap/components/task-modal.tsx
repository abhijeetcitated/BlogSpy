"use client"

// ============================================
// Add/Edit Task Modal Component
// ============================================

import { useState, useEffect } from "react"
import {
  Plus,
  Pencil,
  Calendar,
  Tag,
  User,
  FileText,
  Target,
  Hash,
  TrendingUp,
  Sparkles,
  FileEdit,
  Lightbulb,
  PenTool,
  Flame,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { TaskCard, TaskStatus, TaskTag } from "../types"
import { TAG_COLORS, TAG_LABELS, ASSIGNEES } from "../types"

interface TaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (task: Partial<TaskCard>) => void
  editTask?: TaskCard | null
  mode: "add" | "edit"
}

const ALL_TAGS: TaskTag[] = ["blog", "guide", "tutorial", "review", "comparison", "listicle", "news", "case-study"]

export function TaskModal({ open, onClose, onSave, editTask, mode }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [keyword, setKeyword] = useState("")
  const [volume, setVolume] = useState("")
  const [kd, setKd] = useState("")
  const [status, setStatus] = useState<TaskStatus>("backlog")
  const [assignee, setAssignee] = useState("ME")
  const [dueDate, setDueDate] = useState("")
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>([])
  const [targetWordCount, setTargetWordCount] = useState("")
  const [notes, setNotes] = useState("")
  const [progress, setProgress] = useState(0)
  const [wordCount, setWordCount] = useState("")

  // Reset/populate form when modal opens
  useEffect(() => {
    if (open && mode === "edit" && editTask) {
      setTitle(editTask.title)
      setKeyword(editTask.keyword)
      setVolume(editTask.volume.toString())
      setKd(editTask.kd.toString())
      setStatus(editTask.status)
      setAssignee(editTask.assignee)
      setDueDate(editTask.dueDate || "")
      setSelectedTags(editTask.tags || [])
      setTargetWordCount(editTask.targetWordCount?.toString() || "")
      setNotes(editTask.notes || "")
      setProgress(editTask.progress || 0)
      setWordCount(editTask.wordCount?.toString() || "")
    } else if (open && mode === "add") {
      // Reset form for new task
      setTitle("")
      setKeyword("")
      setVolume("")
      setKd("")
      setStatus("backlog")
      setAssignee("ME")
      setDueDate("")
      setSelectedTags([])
      setTargetWordCount("2000")
      setNotes("")
      setProgress(0)
      setWordCount("")
    }
  }, [open, mode, editTask])

  const toggleTag = (tag: TaskTag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    if (!title.trim() || !keyword.trim()) return

    const volumeNum = parseInt(volume) || 0
    const kdNum = parseInt(kd) || 30
    const priorityScore = kdNum > 0 ? Math.min(99, Math.max(50, Math.round((volumeNum / kdNum) / 10))) : 75

    const taskData: Partial<TaskCard> = {
      ...(mode === "edit" && editTask ? { id: editTask.id } : {}),
      title: title.trim(),
      keyword: keyword.trim(),
      volume: volumeNum,
      volumeDisplay: volumeNum >= 1000 ? `${(volumeNum / 1000).toFixed(1)}k` : volumeNum.toString(),
      kd: kdNum,
      priorityScore,
      status,
      assignee,
      dueDate: dueDate || undefined,
      tags: selectedTags,
      targetWordCount: parseInt(targetWordCount) || 2000,
      notes: notes.trim() || undefined,
      progress: mode === "edit" ? progress : 0,
      wordCount: parseInt(wordCount) || 0,
      updatedAt: new Date().toISOString(),
      ...(mode === "add" ? {
        id: `task-${Date.now()}`,
        comments: [],
        createdAt: new Date().toISOString(),
      } : {}),
    }

    onSave(taskData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-xl mx-auto">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/50">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold text-foreground">
            {mode === "add" ? (
              <>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Plus className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <span>Add New Content</span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Pencil className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span>Edit Content</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Form Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Content Title <span className="text-red-500 dark:text-red-400">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="How to optimize for Google AI Overviews in 2025"
              className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
            />
          </div>

          {/* Keyword */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-muted-foreground" />
              Target Keyword <span className="text-red-500 dark:text-red-400">*</span>
            </Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ai overview seo"
              className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
            />
          </div>

          {/* Volume, KD, Word Count Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Search Volume
              </Label>
              <Input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="5400"
                className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Keyword Difficulty
              </Label>
              <Input
                type="number"
                value={kd}
                onChange={(e) => setKd(e.target.value)}
                placeholder="35"
                min="0"
                max="100"
                className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Target Words
              </Label>
              <Input
                type="number"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(e.target.value)}
                placeholder="2000"
                className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 rounded-lg"
              />
            </div>
          </div>

          {/* Status, Assignee, Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={(v: TaskStatus) => setStatus(v)}>
                <SelectTrigger className="h-9 bg-muted border-border text-foreground rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-2xl rounded-lg">
                  <SelectItem value="backlog" className="text-sm text-popover-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                      Backlog
                    </div>
                  </SelectItem>
                  <SelectItem value="ready" className="text-sm text-popover-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      Ready to Write
                    </div>
                  </SelectItem>
                  <SelectItem value="progress" className="text-sm text-popover-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="published" className="text-sm text-popover-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      Published
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                Assignee
              </Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="h-9 bg-muted border-border text-foreground rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-2xl rounded-lg">
                  {ASSIGNEES.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-sm text-popover-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", a.color)} />
                        {a.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Due Date
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 bg-muted border-border text-foreground focus:border-purple-500/50 rounded-lg"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Content Type Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                const colors = TAG_COLORS[tag]
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all px-3 py-1 rounded-md",
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border}`
                        : "bg-muted text-muted-foreground border-border hover:border-border/80 hover:text-foreground"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {isSelected && "✓ "}
                    {TAG_LABELS[tag]}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileEdit className="h-4 w-4 text-muted-foreground" />
              Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes, outline, or brief for this content..."
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 min-h-[80px] resize-none rounded-lg"
            />
          </div>

          {/* Progress (Edit mode only) */}
          {mode === "edit" && (
            <div className="p-3 sm:p-4 bg-muted/50 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Writing Progress</Label>
                <span className="text-sm font-bold text-purple-500 dark:text-purple-400">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not Started</span>
                <span>Complete</span>
              </div>
              {/* Current Word Count */}
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <Label className="text-sm text-muted-foreground">Current Words:</Label>
                <Input
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  placeholder="0"
                  className="bg-muted border-border text-foreground w-24 h-8 text-sm rounded-lg"
                />
                <span className="text-xs text-muted-foreground">/ {targetWordCount || 2000} target</span>
              </div>
            </div>
          )}

          {/* Quick Import (Add mode only) */}
          {mode === "add" && (
            <div className="p-3 sm:p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-3">Or import from:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg"
                  disabled
                >
                  🔮 Keyword Magic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg"
                  disabled
                >
                  📈 Trend Spotter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg"
                  disabled
                >
                  🎯 Topic Clusters
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Coming soon - Import keywords directly from other tools</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !keyword.trim()}
            className={cn(
              "gap-2 rounded-lg shadow-lg font-medium",
              mode === "add"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/25"
            )}
          >
            {mode === "add" ? (
              <>
                <Plus className="h-4 w-4" />
                Add Content
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
