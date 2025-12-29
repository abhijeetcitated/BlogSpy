"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopicClusterContent } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { 
  FolderOpen, Plus, MoreVertical, Trash2, Copy, ArrowLeft,
  Sparkles, Clock, Target, TrendingUp, Layers, FolderCheck, ExternalLink
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

// ============================================
// TYPES
// ============================================
interface TopicProject {
  id: string
  name: string
  description?: string
  keywordCount: number
  totalVolume: number
  avgKd: number
  status: "draft" | "clustered"
  createdAt: Date
  updatedAt: Date
}

interface SavedClusterProject {
  id: string
  name: string
  createdAt: string
  data: unknown
  statistics: {
    topics: number
    keywords: number
    pillars: number
  }
}

// ============================================
// MOCK DATA - Demo Projects
// ============================================
const INITIAL_PROJECTS: TopicProject[] = [
  {
    id: "proj_1",
    name: "SEO Tools Guide",
    description: "Complete SEO tools comparison and guide",
    keywordCount: 8,
    totalVolume: 48199,
    avgKd: 59,
    status: "draft",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "proj_2", 
    name: "Email Marketing Strategy",
    description: "Email marketing content cluster",
    keywordCount: 0,
    totalVolume: 0,
    avgKd: 0,
    status: "draft",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }
]

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function TopicClustersPage() {
  const router = useRouter()
  
  // State
  const [projects, setProjects] = useState<TopicProject[]>(INITIAL_PROJECTS)
  const [savedClusters, setSavedClusters] = useState<SavedClusterProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; projectId: string | null }>({
    open: false,
    projectId: null
  })
  const [deleteSavedConfirm, setDeleteSavedConfirm] = useState<{ open: boolean; projectId: string | null }>({
    open: false,
    projectId: null
  })

  // Load saved clusters from localStorage
  useEffect(() => {
    const loadSavedClusters = () => {
      try {
        const saved = localStorage.getItem("topic_cluster_projects")
        if (saved) {
          setSavedClusters(JSON.parse(saved))
        }
      } catch {
        console.error("Failed to load saved clusters")
      }
    }
    loadSavedClusters()
  }, [])

  // Get selected project
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Create project
  const handleCreateProject = useCallback(() => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name")
      return
    }

    const newProject: TopicProject = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      keywordCount: 0,
      totalVolume: 0,
      avgKd: 0,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setProjects(prev => [...prev, newProject])
    setSelectedProjectId(newProject.id) // Open the new project
    setNewProjectName("")
    setNewProjectDescription("")
    setIsCreateModalOpen(false)
    toast.success("Project created! Now add keywords to your topic cluster.")
  }, [newProjectName, newProjectDescription])

  // Delete project
  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null)
    }
    setDeleteConfirm({ open: false, projectId: null })
    toast.success("Project deleted")
  }, [selectedProjectId])

  // Duplicate project
  const handleDuplicateProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const duplicated: TopicProject = {
      ...project,
      id: `proj_${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setProjects(prev => [...prev, duplicated])
    toast.success("Project duplicated")
  }, [projects])

  // Open saved cluster (load data into sessionStorage and navigate)
  const handleOpenSavedCluster = useCallback((cluster: SavedClusterProject) => {
    // Store the cluster data to be loaded by results page
    sessionStorage.setItem("saved_cluster_data", JSON.stringify(cluster.data))
    sessionStorage.setItem("saved_cluster_name", cluster.name)
    router.push("/dashboard/strategy/topic-clusters/results?source=saved")
  }, [router])

  // Delete saved cluster
  const handleDeleteSavedCluster = useCallback((clusterId: string) => {
    const updated = savedClusters.filter(c => c.id !== clusterId)
    setSavedClusters(updated)
    localStorage.setItem("topic_cluster_projects", JSON.stringify(updated))
    setDeleteSavedConfirm({ open: false, projectId: null })
    toast.success("Saved cluster deleted")
  }, [savedClusters])

  // ============================================
  // RENDER: Project Detail View (OLD Table Interface)
  // ============================================
  if (selectedProjectId && selectedProject) {
    return (
      <div className="flex flex-col h-full -m-3 sm:-m-4 md:-m-6">
        {/* Header with Back Button */}
        <div className="border-b bg-background/95 backdrop-blur px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {/* Mobile: Stack vertically, Desktop: Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Back Button - Always on left */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedProjectId(null)}
              className="gap-2 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            
            {/* Divider - Hidden on mobile */}
            <div className="hidden sm:block h-6 w-px bg-border" />
            
            {/* Title & Description */}
            <div className="flex-1">
              <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {selectedProject.name}
              </h1>
              {selectedProject.description && (
                <p className="text-xs sm:text-sm text-muted-foreground">{selectedProject.description}</p>
              )}
            </div>
            
            {/* Badge - Right on desktop, below title on mobile */}
            <Badge variant={selectedProject.status === "clustered" ? "default" : "secondary"} className="w-fit">
              {selectedProject.status === "clustered" ? "Clustered" : "Draft"}
            </Badge>
          </div>
        </div>

        {/* OLD Table Interface */}
        <div className="flex-1 overflow-auto">
          <TopicClusterContent />
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: Project List View
  // ============================================
  return (
    <ErrorBoundary>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            My Topic Clusters
          </h1>
          <p className="text-muted-foreground">
            Create topic projects and organize keywords into content clusters
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Topic
        </Button>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Topics Yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create your first topic cluster to organize keywords and build content strategies
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Topic
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="text-xs line-clamp-1">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  
                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateProject(project.id); }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, projectId: project.id }); }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === "clustered" ? "default" : "secondary"} className="text-xs">
                    {project.status === "clustered" ? (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Clustered
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
                    <Target className="h-3 w-3 text-muted-foreground mb-1" />
                    <span className="font-semibold">{project.keywordCount}</span>
                    <span className="text-muted-foreground">Keywords</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
                    <TrendingUp className="h-3 w-3 text-muted-foreground mb-1" />
                    <span className="font-semibold">{project.totalVolume > 1000 ? `${(project.totalVolume/1000).toFixed(1)}K` : project.totalVolume}</span>
                    <span className="text-muted-foreground">Volume</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
                    <Sparkles className="h-3 w-3 text-muted-foreground mb-1" />
                    <span className="font-semibold">{project.avgKd}%</span>
                    <span className="text-muted-foreground">Avg KD</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Created {formatDistanceToNow(project.createdAt, { addSuffix: true })}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); setSelectedProjectId(project.id); }}>
                    Open
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Saved Clusters Section */}
      {savedClusters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">Saved Clusters</h2>
            <Badge variant="secondary" className="text-xs">{savedClusters.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedClusters.map((cluster) => (
              <Card 
                key={cluster.id}
                className="group hover:border-green-500/50 hover:shadow-md transition-all cursor-pointer border-green-200/50 dark:border-green-900/30"
                onClick={() => handleOpenSavedCluster(cluster)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base group-hover:text-green-600 transition-colors truncate flex items-center gap-2">
                        <FolderCheck className="h-4 w-4 text-green-600 shrink-0" />
                        {cluster.name}
                      </CardTitle>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenSavedCluster(cluster); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); setDeleteSavedConfirm({ open: true, projectId: cluster.id }); }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Clustered
                  </Badge>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
                      <Target className="h-3 w-3 text-muted-foreground mb-1" />
                      <span className="font-semibold">{cluster.statistics.topics}</span>
                      <span className="text-muted-foreground">Topics</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
                      <Layers className="h-3 w-3 text-muted-foreground mb-1" />
                      <span className="font-semibold">{cluster.statistics.pillars}</span>
                      <span className="text-muted-foreground">Pillars</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
                      <TrendingUp className="h-3 w-3 text-muted-foreground mb-1" />
                      <span className="font-semibold">{cluster.statistics.keywords}</span>
                      <span className="text-muted-foreground">Keywords</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Saved {formatDistanceToNow(new Date(cluster.createdAt), { addSuffix: true })}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-green-600" onClick={(e) => { e.stopPropagation(); handleOpenSavedCluster(cluster); }}>
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
            <DialogDescription>
              Give your topic cluster a name. You can add keywords after creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic Name *</label>
              <Input
                placeholder="e.g., SEO Tools Guide"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="Brief description of this topic cluster"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, projectId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this topic cluster and all its keywords. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm.projectId && handleDeleteProject(deleteConfirm.projectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Saved Cluster Confirmation */}
      <AlertDialog open={deleteSavedConfirm.open} onOpenChange={(open) => !open && setDeleteSavedConfirm({ open: false, projectId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Cluster?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved cluster. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteSavedConfirm.projectId && handleDeleteSavedCluster(deleteSavedConfirm.projectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ErrorBoundary>
  )
}









