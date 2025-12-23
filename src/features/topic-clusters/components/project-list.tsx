"use client"

// ============================================
// PROJECT LIST COMPONENT
// ============================================
// Shows all projects in a grid layout

import { TopicProject } from "../types/project.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  FolderOpen, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit, 
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Layers
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface ProjectListProps {
  projects: TopicProject[]
  isLoading: boolean
  onSelectProject: (projectId: string) => void
  onCreateProject: () => void
  onDeleteProject: (projectId: string) => void
  onDuplicateProject: (projectId: string) => void
}

export function ProjectList({
  projects,
  isLoading,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject
}: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-sm">
            Create your first topic cluster project to organize and analyze your keywords
          </p>
          <Button onClick={onCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Topic Clusters</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Create topic projects and organize keywords into content clusters
            </p>
          </div>
        </div>
        <Button onClick={onCreateProject} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="sm:hidden">New Topic</span>
          <span className="hidden sm:inline">New Topic</span>
        </Button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => onSelectProject(project.id)}
            onDelete={() => onDeleteProject(project.id)}
            onDuplicate={() => onDuplicateProject(project.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// PROJECT CARD
// ============================================

interface ProjectCardProps {
  project: TopicProject
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
}

function ProjectCard({ project, onSelect, onDelete, onDuplicate }: ProjectCardProps) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Edit }> = {
    draft: {
      label: "Draft",
      variant: "secondary",
      icon: Edit
    },
    clustered: {
      label: "Clustered",
      variant: "default",
      icon: Sparkles
    },
    archived: {
      label: "Archived",
      variant: "secondary",
      icon: Clock
    }
  }

  const status = statusConfig[project.status] || statusConfig.draft
  const StatusIcon = status.icon

  return (
    <Card 
      className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <CardTitle className="text-sm sm:text-base group-hover:text-primary transition-colors truncate">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="text-[11px] sm:text-xs line-clamp-1">
                {project.description}
              </CardDescription>
            )}
          </div>
          
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Badge variant={status.variant} className="text-[10px] sm:text-xs">
            <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
            {status.label}
          </Badge>
          {project.clusteredAt && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {formatDistanceToNow(project.clusteredAt, { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-1.5 sm:p-2">
            <div className="text-sm sm:text-lg font-semibold">{project.keywordCount}</div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Keywords</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-1.5 sm:p-2">
            <div className="text-sm sm:text-lg font-semibold">
              {project.totalVolume >= 1000 
                ? `${(project.totalVolume / 1000).toFixed(1)}K` 
                : project.totalVolume}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Volume</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-1.5 sm:p-2">
            <div className={cn(
              "text-sm sm:text-lg font-semibold",
              project.avgKd >= 60 ? "text-red-500" :
              project.avgKd >= 40 ? "text-orange-500" :
              "text-green-500"
            )}>
              {project.avgKd}%
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">Avg KD</div>
          </div>
        </div>

        {/* Pillars Count (if clustered) */}
        {project.status === "clustered" && project.pillars.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-primary/5 rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5">
            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
            <span>
              <strong className="text-foreground">{project.pillars.length}</strong> Pillars identified
            </span>
          </div>
        )}

        {/* Footer with Created Date and Open Button */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Created {formatDistanceToNow(project.createdAt, { addSuffix: true })}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            Open →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectList
