"use client"

// ============================================
// CREATE PROJECT MODAL
// ============================================
// Modal for creating new topic cluster project

import { useState } from "react"
import { CreateProjectDto } from "../types/project.types"
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
import { Loader2, FolderPlus } from "lucide-react"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateProjectDto) => Promise<void>
}

export function CreateProjectModal({ open, onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError("Project name is required")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      await onCreate({ name: name.trim(), description: description.trim() || undefined })
      // Reset form
      setName("")
      setDescription("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setName("")
      setDescription("")
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Create a new topic cluster project to organize and analyze your keywords
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., SEO Guide 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your topic cluster project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectModal
