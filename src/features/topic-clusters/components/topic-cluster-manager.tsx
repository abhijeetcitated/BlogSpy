"use client"

// ============================================
// TOPIC CLUSTER MANAGER
// ============================================
// Main orchestrator component that manages:
// - Project list view
// - Project detail view
// - Cluster results view
// - All modals and state

import { useState, useCallback } from "react"
import { useProjects, useProjectDetail, useProjectState } from "../hooks/use-project"
import { ProjectList } from "./project-list"
import { ProjectDetail } from "./project-detail"
import { ClusterResults } from "./cluster-results"
import { CreateProjectModal } from "./create-project-modal"
import { AddKeywordsModal } from "./add-keywords-modal"
import { CreateProjectDto, AddKeywordDto } from "../types/project.types"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface TopicClusterManagerProps {
  userId?: string
}

export function TopicClusterManager({ userId = "user_123" }: TopicClusterManagerProps) {
  console.log("[TopicClusterManager] Rendering with userId:", userId)
  
  // Project state (view, selection, modals)
  const {
    currentView,
    selectedProjectId,
    goToProjectList,
    goToProjectDetail,
    goToClusterView,
    selectedKeywordIds,
    toggleKeywordSelection,
    selectAllKeywords,
    clearSelection,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    isAddKeywordsModalOpen,
    openAddKeywordsModal,
    closeAddKeywordsModal
  } = useProjectState()

  // Projects data
  const {
    projects,
    isLoading: isLoadingProjects,
    createProject,
    deleteProject: deleteProjectAction,
    duplicateProject
  } = useProjects(userId)

  console.log("[TopicClusterManager] View:", currentView, "Projects:", projects.length, "Loading:", isLoadingProjects)

  // Project detail data (only when viewing a project)
  const {
    project,
    isLoading: isLoadingProject,
    addKeywordsBulk,
    removeKeywordsBulk,
    generateClusters,
    isGenerating,
    refetch: refetchProject
  } = useProjectDetail(selectedProjectId || "")

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; projectId: string | null }>({
    open: false,
    projectId: null
  })

  // ============================================
  // HANDLERS
  // ============================================

  // Create project
  const handleCreateProject = useCallback(async (data: CreateProjectDto) => {
    const newProject = await createProject(data)
    if (newProject) {
      toast.success("Project created successfully!")
      goToProjectDetail(newProject.id)
    }
  }, [createProject, goToProjectDetail])

  // Delete project
  const handleDeleteProject = useCallback((projectId: string) => {
    setDeleteConfirm({ open: true, projectId })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (deleteConfirm.projectId) {
      const success = await deleteProjectAction(deleteConfirm.projectId)
      if (success) {
        toast.success("Project deleted")
        if (selectedProjectId === deleteConfirm.projectId) {
          goToProjectList()
        }
      }
    }
    setDeleteConfirm({ open: false, projectId: null })
  }, [deleteConfirm.projectId, deleteProjectAction, selectedProjectId, goToProjectList])

  // Duplicate project
  const handleDuplicateProject = useCallback(async (projectId: string) => {
    const newProject = await duplicateProject(projectId)
    if (newProject) {
      toast.success("Project duplicated!")
    }
  }, [duplicateProject])

  // Add keywords
  const handleAddKeywords = useCallback(async (keywords: AddKeywordDto[]) => {
    const added = await addKeywordsBulk(keywords)
    if (added.length > 0) {
      toast.success(`Added ${added.length} keyword${added.length > 1 ? "s" : ""}`)
    }
  }, [addKeywordsBulk])

  // Remove keywords
  const handleRemoveKeywords = useCallback(async (keywordIds: string[]) => {
    const count = await removeKeywordsBulk(keywordIds)
    if (count > 0) {
      toast.success(`Removed ${count} keyword${count > 1 ? "s" : ""}`)
      clearSelection()
    }
  }, [removeKeywordsBulk, clearSelection])

  // Generate clusters
  const handleGenerateClusters = useCallback(async () => {
    try {
      const result = await generateClusters()
      if (result?.success) {
        toast.success(`Clustering complete! Found ${result.pillars.length} pillar${result.pillars.length > 1 ? "s" : ""}`)
        goToClusterView(selectedProjectId!)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Clustering failed")
    }
  }, [generateClusters, goToClusterView, selectedProjectId])

  // Regenerate clusters (from cluster view)
  const handleRegenerate = useCallback(async () => {
    await handleGenerateClusters()
  }, [handleGenerateClusters])

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="w-full">
      {/* Project List View */}
      {currentView === "list" && (
        <ProjectList
          projects={projects}
          isLoading={isLoadingProjects}
          onSelectProject={goToProjectDetail}
          onCreateProject={openCreateModal}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
        />
      )}

      {/* Project Detail View */}
      {currentView === "detail" && selectedProjectId && (
        isLoadingProject || !project ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <ProjectDetail
            project={project}
            selectedKeywordIds={selectedKeywordIds}
            onBack={goToProjectList}
            onAddKeywords={openAddKeywordsModal}
            onRemoveKeywords={handleRemoveKeywords}
            onToggleKeyword={toggleKeywordSelection}
            onSelectAll={selectAllKeywords}
            onClearSelection={clearSelection}
            onGenerateClusters={handleGenerateClusters}
            onViewClusters={() => goToClusterView(selectedProjectId)}
            isGenerating={isGenerating}
          />
        )
      )}

      {/* Cluster Results View */}
      {currentView === "clusters" && selectedProjectId && project && (
        <ClusterResults
          project={project}
          onBack={() => goToProjectDetail(selectedProjectId)}
          onRegenerate={handleRegenerate}
          isRegenerating={isGenerating}
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreateProject}
      />

      {/* Add Keywords Modal */}
      <AddKeywordsModal
        open={isAddKeywordsModalOpen}
        onClose={closeAddKeywordsModal}
        onAdd={handleAddKeywords}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => !open && setDeleteConfirm({ open: false, projectId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All keywords and clustering data for this project will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TopicClusterManager
