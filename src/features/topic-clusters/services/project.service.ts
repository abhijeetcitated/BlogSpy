// ============================================
// TOPIC PROJECT SERVICE
// ============================================
// Complete service layer for Topic/Project system
// Currently uses mock data, replace with real API calls later

import { 
  TopicProject, 
  ProjectKeyword,
  PillarResult,
  CreateProjectDto,
  UpdateProjectDto,
  AddKeywordDto,
  BulkAddKeywordsDto,
  ProjectListResponse,
  ClusteringResult,
  KeywordType
} from "../types/project.types"
import { MOCK_PROJECTS } from "../constants/mock-projects"

// ============================================
// SIMULATED DATABASE (Replace with real DB)
// ============================================
let projectsDB: TopicProject[] = [...MOCK_PROJECTS]

// Helper to generate IDs
const generateId = () => `proj_${Math.random().toString(36).substring(2, 15)}`
const generateKeywordId = () => `kw_${Math.random().toString(36).substring(2, 15)}`

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// PROJECT CRUD OPERATIONS
// ============================================

/**
 * Get all projects for a user
 */
export async function getProjects(userId: string): Promise<ProjectListResponse> {
  console.log("[ProjectService] getProjects called for userId:", userId)
  console.log("[ProjectService] projectsDB:", projectsDB.map(p => ({ id: p.id, userId: p.userId, name: p.name })))
  
  await delay(300) // Simulate API call
  
  const userProjects = projectsDB.filter(p => p.userId === userId)
  console.log("[ProjectService] Found projects:", userProjects.length)
  
  return {
    projects: userProjects,
    total: userProjects.length
  }
}

/**
 * Get single project by ID
 */
export async function getProjectById(projectId: string): Promise<TopicProject | null> {
  await delay(200)
  
  const project = projectsDB.find(p => p.id === projectId)
  return project || null
}

/**
 * Create new project
 */
export async function createProject(userId: string, data: CreateProjectDto): Promise<TopicProject> {
  await delay(300)
  
  const newProject: TopicProject = {
    id: generateId(),
    userId,
    name: data.name,
    description: data.description,
    status: "draft",
    keywords: [],
    keywordCount: 0,
    pillars: [],
    uncategorizedKeywordIds: [],
    totalVolume: 0,
    avgKd: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    clusteredAt: null
  }
  
  projectsDB.push(newProject)
  return newProject
}

/**
 * Update project
 */
export async function updateProject(projectId: string, data: UpdateProjectDto): Promise<TopicProject | null> {
  await delay(200)
  
  const index = projectsDB.findIndex(p => p.id === projectId)
  if (index === -1) return null
  
  projectsDB[index] = {
    ...projectsDB[index],
    ...data,
    updatedAt: new Date()
  }
  
  return projectsDB[index]
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  await delay(200)
  
  const index = projectsDB.findIndex(p => p.id === projectId)
  if (index === -1) return false
  
  projectsDB.splice(index, 1)
  return true
}

/**
 * Duplicate project
 */
export async function duplicateProject(projectId: string): Promise<TopicProject | null> {
  await delay(300)
  
  const original = projectsDB.find(p => p.id === projectId)
  if (!original) return null
  
  const newProject: TopicProject = {
    ...original,
    id: generateId(),
    name: `${original.name} (Copy)`,
    status: "draft",
    keywords: original.keywords.map(kw => ({
      ...kw,
      id: generateKeywordId(),
      keywordType: null,
      parentPillarId: null,
      confidenceScore: null
    })),
    pillars: [],
    uncategorizedKeywordIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    clusteredAt: null
  }
  
  projectsDB.push(newProject)
  return newProject
}

// ============================================
// KEYWORD OPERATIONS
// ============================================

/**
 * Add single keyword to project
 */
export async function addKeyword(projectId: string, data: AddKeywordDto): Promise<ProjectKeyword | null> {
  await delay(150)
  
  const project = projectsDB.find(p => p.id === projectId)
  if (!project) return null
  
  const newKeyword: ProjectKeyword = {
    id: generateKeywordId(),
    projectId,
    keyword: data.keyword,
    volume: data.volume ?? null,
    kd: data.kd ?? null,
    cpc: data.cpc ?? null,
    intent: data.intent ?? null,
    trend: data.trend ?? null,
    trendPercent: data.trendPercent ?? null,
    serpFeatures: data.serpFeatures ?? [],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: data.source,
    sourceTag: data.sourceTag,
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: data.keyword.split(" ").length,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  project.keywords.push(newKeyword)
  project.keywordCount = project.keywords.length
  project.totalVolume = project.keywords.reduce((acc, k) => acc + (k.volume || 0), 0)
  project.avgKd = project.keywords.length > 0 
    ? Math.round(project.keywords.reduce((acc, k) => acc + (k.kd || 0), 0) / project.keywords.length)
    : 0
  project.updatedAt = new Date()
  
  // Reset clustering status when keywords change
  if (project.status === "clustered") {
    project.status = "draft"
    project.pillars = []
    project.clusteredAt = null
  }
  
  return newKeyword
}

/**
 * Add multiple keywords to project
 */
export async function addKeywordsBulk(projectId: string, data: BulkAddKeywordsDto): Promise<ProjectKeyword[]> {
  await delay(500)
  
  const project = projectsDB.find(p => p.id === projectId)
  if (!project) return []
  
  const newKeywords: ProjectKeyword[] = data.keywords.map(kw => ({
    id: generateKeywordId(),
    projectId,
    keyword: kw.keyword,
    volume: kw.volume ?? null,
    kd: kw.kd ?? null,
    cpc: kw.cpc ?? null,
    intent: kw.intent ?? null,
    trend: kw.trend ?? null,
    trendPercent: kw.trendPercent ?? null,
    serpFeatures: kw.serpFeatures ?? [],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: kw.source,
    sourceTag: kw.sourceTag,
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: kw.keyword.split(" ").length,
    createdAt: new Date(),
    updatedAt: new Date()
  }))
  
  project.keywords.push(...newKeywords)
  project.keywordCount = project.keywords.length
  project.totalVolume = project.keywords.reduce((acc, k) => acc + (k.volume || 0), 0)
  project.avgKd = project.keywords.length > 0 
    ? Math.round(project.keywords.reduce((acc, k) => acc + (k.kd || 0), 0) / project.keywords.length)
    : 0
  project.updatedAt = new Date()
  
  // Reset clustering status
  if (project.status === "clustered") {
    project.status = "draft"
    project.pillars = []
    project.clusteredAt = null
  }
  
  return newKeywords
}

/**
 * Remove keyword from project
 */
export async function removeKeyword(projectId: string, keywordId: string): Promise<boolean> {
  await delay(150)
  
  const project = projectsDB.find(p => p.id === projectId)
  if (!project) return false
  
  const index = project.keywords.findIndex(k => k.id === keywordId)
  if (index === -1) return false
  
  project.keywords.splice(index, 1)
  project.keywordCount = project.keywords.length
  project.totalVolume = project.keywords.reduce((acc, k) => acc + (k.volume || 0), 0)
  project.avgKd = project.keywords.length > 0 
    ? Math.round(project.keywords.reduce((acc, k) => acc + (k.kd || 0), 0) / project.keywords.length)
    : 0
  project.updatedAt = new Date()
  
  // Reset clustering status
  if (project.status === "clustered") {
    project.status = "draft"
    project.pillars = []
    project.clusteredAt = null
  }
  
  return true
}

/**
 * Remove multiple keywords
 */
export async function removeKeywordsBulk(projectId: string, keywordIds: string[]): Promise<number> {
  await delay(300)
  
  const project = projectsDB.find(p => p.id === projectId)
  if (!project) return 0
  
  const initialCount = project.keywords.length
  project.keywords = project.keywords.filter(k => !keywordIds.includes(k.id))
  const removedCount = initialCount - project.keywords.length
  
  project.keywordCount = project.keywords.length
  project.totalVolume = project.keywords.reduce((acc, k) => acc + (k.volume || 0), 0)
  project.avgKd = project.keywords.length > 0 
    ? Math.round(project.keywords.reduce((acc, k) => acc + (k.kd || 0), 0) / project.keywords.length)
    : 0
  project.updatedAt = new Date()
  
  // Reset clustering status
  if (project.status === "clustered" && removedCount > 0) {
    project.status = "draft"
    project.pillars = []
    project.clusteredAt = null
  }
  
  return removedCount
}

// ============================================
// CLUSTERING OPERATIONS
// ============================================

/**
 * Generate clusters for a project
 * This is where the magic happens!
 * 
 * TODO: Replace with real clustering API/algorithm
 * Current implementation uses simple mathematical rules:
 * - Pillar: wordCount <= 3 AND volume >= 5000 AND kd >= 40
 * - Supporting: contains pillar keyword AND wordCount 3-5 AND volume >= 1000
 * - Cluster: wordCount > 4 AND volume < 5000 AND kd < 40
 */
export async function generateClusters(projectId: string): Promise<ClusteringResult | null> {
  await delay(1500) // Simulate processing time
  
  const project = projectsDB.find(p => p.id === projectId)
  if (!project) return null
  
  if (project.keywords.length < 5) {
    throw new Error("Minimum 5 keywords required for clustering")
  }
  
  // Reset previous clustering
  project.keywords.forEach(kw => {
    kw.keywordType = null
    kw.parentPillarId = null
    kw.confidenceScore = null
  })
  project.pillars = []
  project.uncategorizedKeywordIds = []
  
  // Step 1: Identify Pillar Candidates
  const pillarCandidates = project.keywords
    .filter(kw => 
      kw.wordCount <= 3 && 
      (kw.volume || 0) >= 3000 &&
      (kw.kd || 0) >= 30
    )
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 5) // Max 5 pillars
  
  // Step 2: For each pillar, find supporting and cluster keywords
  const pillars: PillarResult[] = []
  const assignedKeywordIds = new Set<string>()
  
  for (const pillarKw of pillarCandidates) {
    if (assignedKeywordIds.has(pillarKw.id)) continue
    
    // Mark as pillar
    pillarKw.keywordType = "pillar"
    pillarKw.confidenceScore = calculatePillarConfidence(pillarKw)
    assignedKeywordIds.add(pillarKw.id)
    
    // Find supporting keywords (contain pillar keyword, explain/define it)
    const supportingKws = project.keywords.filter(kw => 
      !assignedKeywordIds.has(kw.id) &&
      kw.keyword.toLowerCase().includes(pillarKw.keyword.toLowerCase().split(" ")[0]) &&
      kw.wordCount >= 3 &&
      kw.wordCount <= 5 &&
      (kw.volume || 0) >= 500 &&
      isExplanatoryKeyword(kw.keyword)
    )
    
    supportingKws.forEach(kw => {
      kw.keywordType = "supporting"
      kw.parentPillarId = pillarKw.id
      kw.confidenceScore = 70 + Math.random() * 20
      assignedKeywordIds.add(kw.id)
    })
    
    // Find cluster keywords (related, long-tail)
    const clusterKws = project.keywords.filter(kw =>
      !assignedKeywordIds.has(kw.id) &&
      (
        kw.keyword.toLowerCase().includes(pillarKw.keyword.toLowerCase().split(" ")[0]) ||
        hasWordOverlap(kw.keyword, pillarKw.keyword, 1)
      ) &&
      kw.wordCount >= 4 &&
      (kw.kd || 100) < 50
    )
    
    clusterKws.forEach(kw => {
      kw.keywordType = "cluster"
      kw.parentPillarId = pillarKw.id
      kw.confidenceScore = 60 + Math.random() * 25
      assignedKeywordIds.add(kw.id)
    })
    
    // Create pillar result
    const allRelatedKws = [pillarKw, ...supportingKws, ...clusterKws]
    const pillarResult: PillarResult = {
      id: `pillar_${generateKeywordId()}`,
      projectId: project.id,
      keywordId: pillarKw.id,
      keyword: pillarKw.keyword,
      volume: pillarKw.volume || 0,
      kd: pillarKw.kd || 0,
      confidenceScore: pillarKw.confidenceScore || 80,
      supportingKeywordIds: supportingKws.map(k => k.id),
      clusterKeywordIds: clusterKws.map(k => k.id),
      totalVolume: allRelatedKws.reduce((acc, k) => acc + (k.volume || 0), 0),
      avgKd: Math.round(allRelatedKws.reduce((acc, k) => acc + (k.kd || 0), 0) / allRelatedKws.length),
      keywordCount: allRelatedKws.length,
      createdAt: new Date()
    }
    
    pillars.push(pillarResult)
  }
  
  // Step 3: Handle uncategorized keywords
  const uncategorizedIds = project.keywords
    .filter(kw => !assignedKeywordIds.has(kw.id))
    .map(kw => kw.id)
  
  // Update project
  project.pillars = pillars
  project.uncategorizedKeywordIds = uncategorizedIds
  project.status = "clustered"
  project.clusteredAt = new Date()
  project.updatedAt = new Date()
  
  // Return result
  return {
    success: true,
    pillars,
    uncategorizedKeywordIds: uncategorizedIds,
    stats: {
      totalKeywords: project.keywords.length,
      pillarCount: pillars.length,
      supportingCount: project.keywords.filter(k => k.keywordType === "supporting").length,
      clusterCount: project.keywords.filter(k => k.keywordType === "cluster").length,
      uncategorizedCount: uncategorizedIds.length
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate confidence score for pillar keyword
 */
function calculatePillarConfidence(kw: ProjectKeyword): number {
  let score = 50
  
  // Word count (shorter = better pillar)
  if (kw.wordCount === 1) score += 20
  else if (kw.wordCount === 2) score += 15
  else if (kw.wordCount === 3) score += 10
  
  // Volume (higher = better pillar)
  const volume = kw.volume || 0
  if (volume >= 10000) score += 20
  else if (volume >= 5000) score += 15
  else if (volume >= 3000) score += 10
  
  // KD (higher = more competitive = important topic)
  const kd = kw.kd || 0
  if (kd >= 50) score += 10
  else if (kd >= 40) score += 5
  
  return Math.min(score, 100)
}

/**
 * Check if keyword is explanatory (what is, how does, meaning, etc.)
 */
function isExplanatoryKeyword(keyword: string): boolean {
  const explanatoryPhrases = [
    "what is", "what are", "how does", "how do", "how to",
    "meaning", "definition", "basics", "guide", "explained",
    "introduction", "overview", "tutorial"
  ]
  const lowerKeyword = keyword.toLowerCase()
  return explanatoryPhrases.some(phrase => lowerKeyword.includes(phrase))
}

/**
 * Check word overlap between two keywords
 */
function hasWordOverlap(kw1: string, kw2: string, minOverlap: number): boolean {
  const words1 = kw1.toLowerCase().split(" ")
  const words2 = kw2.toLowerCase().split(" ")
  
  // Remove common stop words
  const stopWords = ["a", "an", "the", "is", "are", "was", "were", "to", "for", "in", "on", "of", "and", "or"]
  const filtered1 = words1.filter(w => !stopWords.includes(w) && w.length > 2)
  const filtered2 = words2.filter(w => !stopWords.includes(w) && w.length > 2)
  
  const overlap = filtered1.filter(w => filtered2.includes(w)).length
  return overlap >= minOverlap
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export const projectService = {
  // Project CRUD
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
  
  // Keywords
  addKeyword,
  addKeywordsBulk,
  removeKeyword,
  removeKeywordsBulk,
  
  // Clustering
  generateClusters
}

export default projectService
