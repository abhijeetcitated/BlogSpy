"use client"

// ============================================
// IMPORT KEYWORDS MODAL
// ============================================
// Modal for importing keywords from Keyword Explorer
// Allows selecting existing project or creating new one

import { useState } from "react"
import { AddKeywordDto, CreateProjectDto } from "../types/project.types"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, FolderPlus, Import, Folder, Circle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description?: string
  keywordCount: number
}

interface ImportKeywordsModalProps {
  open: boolean
  onClose: () => void
  keywords: AddKeywordDto[]
  projects: Project[]
  onImport: (keywords: AddKeywordDto[], projectId: string) => Promise<void>
  onCreateProject: (data: CreateProjectDto) => Promise<string | null>
}

export function ImportKeywordsModal({ 
  open, 
  onClose, 
  keywords, 
  projects,
  onImport,
  onCreateProject
}: ImportKeywordsModalProps) {
  const [mode, setMode] = useState<"existing" | "new">("new")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [newProjectName, setNewProjectName] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")

  const handleImport = async () => {
    setError("")
    setIsImporting(true)

    try {
      let targetProjectId = selectedProjectId

      // Create new project if needed
      if (mode === "new") {
        if (!newProjectName.trim()) {
          setError("Project name is required")
          setIsImporting(false)
          return
        }
        const newId = await onCreateProject({ name: newProjectName.trim() })
        if (!newId) {
          setError("Failed to create project")
          setIsImporting(false)
          return
        }
        targetProjectId = newId
      }

      if (!targetProjectId) {
        setError("Please select or create a project")
        setIsImporting(false)
        return
      }

      await onImport(keywords, targetProjectId)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    if (!isImporting) {
      setMode("new")
      setSelectedProjectId("")
      setNewProjectName("")
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-violet-500" />
            Import from Keyword Explorer
          </DialogTitle>
          <DialogDescription>
            Import <Badge variant="secondary" className="mx-1">{keywords.length}</Badge> 
            keywords to a topic cluster project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Keywords Preview */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Keywords to import:</Label>
            <ScrollArea className="h-24 rounded-md border p-2 bg-muted/30">
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 20).map((k, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {k.keyword}
                  </Badge>
                ))}
                {keywords.length > 20 && (
                  <Badge variant="secondary" className="text-xs">
                    +{keywords.length - 20} more
                  </Badge>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Select Mode */}
          <div className="space-y-3">
            {/* New Project Option */}
            <button
              type="button"
              onClick={() => setMode("new")}
              className={cn(
                "w-full flex items-start space-x-3 p-3 rounded-lg border transition-colors text-left",
                mode === "new" ? "border-violet-500 bg-violet-500/5" : "border-border hover:border-muted-foreground/30"
              )}
            >
              {mode === "new" ? (
                <CheckCircle2 className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-violet-500" />
                  Create New Project
                </div>
                {mode === "new" && (
                  <Input
                    placeholder="Enter project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isImporting}
                    autoFocus
                  />
                )}
              </div>
            </button>

            {/* Existing Project Option */}
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={cn(
                "w-full flex items-start space-x-3 p-3 rounded-lg border transition-colors text-left",
                mode === "existing" ? "border-violet-500 bg-violet-500/5" : "border-border hover:border-muted-foreground/30"
              )}
            >
              {mode === "existing" ? (
                <CheckCircle2 className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <Folder className="h-4 w-4 text-amber-500" />
                  Add to Existing Project
                </div>
                {mode === "existing" && (
                  <>
                    {projects.length > 0 ? (
                      <ScrollArea className="h-32 rounded-md border" onClick={(e) => e.stopPropagation()}>
                        <div className="p-1 space-y-1">
                          {projects.map((project) => (
                            <div
                              key={project.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedProjectId(project.id)
                              }}
                              className={cn(
                                "w-full text-left p-2 rounded-md transition-colors cursor-pointer",
                                selectedProjectId === project.id 
                                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <div className="font-medium text-sm">{project.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {project.keywordCount} keywords
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2 text-center">
                        No existing projects. Create a new one above.
                      </div>
                    )}
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || (mode === "existing" && !selectedProjectId) || (mode === "new" && !newProjectName.trim())}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Import className="mr-2 h-4 w-4" />
                Import {keywords.length} Keywords
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
