// Topic Clusters Feature - Barrel Export

// OLD: Legacy keyword pool system (keeping for backward compatibility)
export { TopicClusterContent } from "./topic-cluster-content"

// NEW: Project-based Topic Cluster System
export { TopicClusterPage } from "./topic-cluster-page"
export { TopicClusterManager } from "./components/topic-cluster-manager"

// Types
export type { 
  ViewMode, 
  ColorMode, 
  ClusterKeyword, 
  ClusterData, 
  RankingPotential 
} from "./types"

// NEW: Project System Types
export type {
  TopicProject,
  ProjectKeyword,
  PillarResult,
  ProjectStatus,
  KeywordType,
  KeywordSource,
  CreateProjectDto,
  AddKeywordDto,
  ClusteringResult
} from "./types/project.types"

// Constants
export { VIEW_MODE_OPTIONS, MOCK_CLUSTERS, KD_DIFFICULTY_LEGEND } from "./constants"

// Utils
export { getRankingPotential, filterClusters, parseVolume } from "./utils/cluster-utils"

// Services
export { projectService } from "./services/project.service"

// Hooks
export { useProjects, useProjectDetail, useProjectState } from "./hooks/use-project"

// Components
export {
  TopToolbar,
  ZoomControls,
  DifficultyLegend,
  ClusterInspector,
  EmptyState,
  BackgroundEffects,
  ClusterListView,
  NetworkGraph,
  // NEW: Project System Components
  ProjectList,
  ProjectDetail,
  ClusterResults,
  CreateProjectModal,
  AddKeywordsModal,
} from "./components"
