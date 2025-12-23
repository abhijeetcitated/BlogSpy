"use client"

// ============================================
// TOPIC PROJECT HOOKS
// ============================================
// React hooks for Topic/Project system
// Clean abstraction for components

import { useState, useCallback, useEffect } from "react"
import { projectService } from "../services/project.service"
import { 
  TopicProject, 
  ProjectKeyword,
  PillarResult,
  CreateProjectDto,
  AddKeywordDto,
  ClusteringResult
} from "../types/project.types"

// ============================================
// USE PROJECTS HOOK
// ============================================

interface UseProjectsReturn {
  projects: TopicProject[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createProject: (data: CreateProjectDto) => Promise<TopicProject | null>
  deleteProject: (projectId: string) => Promise<boolean>
  duplicateProject: (projectId: string) => Promise<TopicProject | null>
}

export function useProjects(userId: string): UseProjectsReturn {
  const [projects, setProjects] = useState<TopicProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await projectService.getProjects(userId)
      setProjects(response.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchProjects()
    }
  }, [userId, fetchProjects])

  const createProject = useCallback(async (data: CreateProjectDto) => {
    try {
      const newProject = await projectService.createProject(userId, data)
      setProjects(prev => [...prev, newProject])
      return newProject
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
      return null
    }
  }, [userId])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const success = await projectService.deleteProject(projectId)
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project")
      return false
    }
  }, [])

  const duplicateProject = useCallback(async (projectId: string) => {
    try {
      const newProject = await projectService.duplicateProject(projectId)
      if (newProject) {
        setProjects(prev => [...prev, newProject])
      }
      return newProject
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate project")
      return null
    }
  }, [])

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    deleteProject,
    duplicateProject
  }
}

// ============================================
// USE PROJECT DETAIL HOOK
// ============================================

interface UseProjectDetailReturn {
  project: TopicProject | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  // Keyword operations
  addKeyword: (data: AddKeywordDto) => Promise<ProjectKeyword | null>
  addKeywordsBulk: (keywords: AddKeywordDto[]) => Promise<ProjectKeyword[]>
  removeKeyword: (keywordId: string) => Promise<boolean>
  removeKeywordsBulk: (keywordIds: string[]) => Promise<number>
  // Clustering
  generateClusters: () => Promise<ClusteringResult | null>
  isGenerating: boolean
  clusteringError: string | null
}

export function useProjectDetail(projectId: string): UseProjectDetailReturn {
  const [project, setProject] = useState<TopicProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [clusteringError, setClusteringError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await projectService.getProjectById(projectId)
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project")
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId, fetchProject])

  // Keyword operations
  const addKeyword = useCallback(async (data: AddKeywordDto) => {
    try {
      const newKeyword = await projectService.addKeyword(projectId, data)
      if (newKeyword) {
        await fetchProject() // Refresh to get updated stats
      }
      return newKeyword
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add keyword")
      return null
    }
  }, [projectId, fetchProject])

  const addKeywordsBulk = useCallback(async (keywords: AddKeywordDto[]) => {
    try {
      const newKeywords = await projectService.addKeywordsBulk(projectId, { keywords })
      await fetchProject()
      return newKeywords
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add keywords")
      return []
    }
  }, [projectId, fetchProject])

  const removeKeyword = useCallback(async (keywordId: string) => {
    try {
      const success = await projectService.removeKeyword(projectId, keywordId)
      if (success) {
        await fetchProject()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove keyword")
      return false
    }
  }, [projectId, fetchProject])

  const removeKeywordsBulk = useCallback(async (keywordIds: string[]) => {
    try {
      const count = await projectService.removeKeywordsBulk(projectId, keywordIds)
      if (count > 0) {
        await fetchProject()
      }
      return count
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove keywords")
      return 0
    }
  }, [projectId, fetchProject])

  // Clustering
  const generateClusters = useCallback(async () => {
    try {
      setIsGenerating(true)
      setClusteringError(null)
      const result = await projectService.generateClusters(projectId)
      await fetchProject() // Refresh project with clustering results
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clustering failed"
      setClusteringError(message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [projectId, fetchProject])

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
    addKeyword,
    addKeywordsBulk,
    removeKeyword,
    removeKeywordsBulk,
    generateClusters,
    isGenerating,
    clusteringError
  }
}

// ============================================
// USE PROJECT STATE HOOK (for managing UI state)
// ============================================

export type ProjectView = "list" | "detail" | "clusters"

interface UseProjectStateReturn {
  currentView: ProjectView
  selectedProjectId: string | null
  // Navigation
  goToProjectList: () => void
  goToProjectDetail: (projectId: string) => void
  goToClusterView: (projectId: string) => void
  // Selection for tables
  selectedKeywordIds: string[]
  toggleKeywordSelection: (keywordId: string) => void
  selectAllKeywords: (keywordIds: string[]) => void
  clearSelection: () => void
  // Modal states
  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
  isAddKeywordsModalOpen: boolean
  openAddKeywordsModal: () => void
  closeAddKeywordsModal: () => void
}

export function useProjectState(): UseProjectStateReturn {
  const [currentView, setCurrentView] = useState<ProjectView>("list")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddKeywordsModalOpen, setIsAddKeywordsModalOpen] = useState(false)

  // Navigation
  const goToProjectList = useCallback(() => {
    setCurrentView("list")
    setSelectedProjectId(null)
    setSelectedKeywordIds([])
  }, [])

  const goToProjectDetail = useCallback((projectId: string) => {
    setCurrentView("detail")
    setSelectedProjectId(projectId)
    setSelectedKeywordIds([])
  }, [])

  const goToClusterView = useCallback((projectId: string) => {
    setCurrentView("clusters")
    setSelectedProjectId(projectId)
    setSelectedKeywordIds([])
  }, [])

  // Keyword selection
  const toggleKeywordSelection = useCallback((keywordId: string) => {
    setSelectedKeywordIds(prev => 
      prev.includes(keywordId)
        ? prev.filter(id => id !== keywordId)
        : [...prev, keywordId]
    )
  }, [])

  const selectAllKeywords = useCallback((keywordIds: string[]) => {
    setSelectedKeywordIds(keywordIds)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKeywordIds([])
  }, [])

  // Modal controls
  const openCreateModal = useCallback(() => setIsCreateModalOpen(true), [])
  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), [])
  const openAddKeywordsModal = useCallback(() => setIsAddKeywordsModalOpen(true), [])
  const closeAddKeywordsModal = useCallback(() => setIsAddKeywordsModalOpen(false), [])

  return {
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
  }
}
