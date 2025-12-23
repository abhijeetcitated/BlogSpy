/**
 * Entity Coverage Analysis Utilities
 * 
 * Functions for analyzing entity coverage in content:
 * - Named entity recognition (NER)
 * - Entity relationship extraction
 * - Clustering and grouping
 * - Coverage scoring
 */

import {
  Entity,
  EntityType,
  EntityImportance,
  EntityStatus,
  EntityPosition,
  EntityRelationship,
  RelationshipType,
  EntityCluster,
  EntityCoverageMetrics,
  EntityGap,
  EntityRecommendation,
  EntitySuggestion,
  EntityCoverageAnalysis,
  EntityCoverageSummary,
  EntityScoreBreakdown,
  EntityCoverageSettings,
  CompetitorEntityData,
  DEFAULT_ENTITY_COVERAGE_SETTINGS,
  ENTITY_IMPORTANCE_WEIGHTS,
  EntityExportFormat
} from '@/src/features/ai-writer/types/tools/entity-coverage.types';

// =============================================================================
// ENTITY EXTRACTION
// =============================================================================

/**
 * Entity pattern definitions
 */
const ENTITY_PATTERNS: Record<EntityType, RegExp[]> = {
  person: [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, // "John Smith"
  ],
  organization: [
    /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*(?:\s+(?:Inc|Corp|LLC|Ltd|Company|Co|Group|Foundation|Association|Institute|University|College)))\b/g,
    /\b((?:The\s+)?[A-Z][A-Z]+(?:\s+[A-Z][A-Z]+)*)\b/g, // Acronyms like "NASA", "FBI"
  ],
  location: [
    /\b([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?(?:,\s*[A-Z]{2})?)\b/g, // "New York", "San Francisco, CA"
  ],
  product: [
    /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*(?:\s+(?:\d+|Pro|Plus|Max|Ultra|Mini|Air|SE|XR|XS)))\b/g,
  ],
  brand: [
    /\b((?:Apple|Google|Microsoft|Amazon|Meta|Facebook|Twitter|Instagram|LinkedIn|Samsung|Sony|Nike|Adidas|BMW|Mercedes|Tesla|Netflix|Spotify|Uber|Airbnb)(?:\s+[A-Za-z]+)?)\b/gi,
  ],
  technology: [
    /\b((?:AI|ML|API|SDK|REST|GraphQL|SQL|NoSQL|React|Vue|Angular|Node\.js|Python|Java|JavaScript|TypeScript|CSS|HTML|Docker|Kubernetes|AWS|Azure|GCP|SEO|SaaS|PaaS|IaaS))\b/gi,
  ],
  concept: [],
  event: [
    /\b(\d{4}(?:\s+[A-Z][a-z]+)*(?:\s+(?:Conference|Summit|Expo|Fair|Festival|Olympics|Championship|World Cup)))\b/g,
  ],
  quantity: [
    /\b(\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|trillion|thousand|hundred|k|M|B))?)\b/gi,
  ],
  time: [
    /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|am|pm))?)\b/g,
    /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s+\d{4})?)\b/g,
  ],
  money: [
    /\b(\$\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:million|billion|trillion|thousand|hundred|k|M|B))?)\b/gi,
  ],
  percent: [
    /\b(\d+(?:\.\d+)?%)\b/g,
  ],
  attribute: [],
  action: [],
  topic: [],
  subtopic: [],
  custom: []
};

/**
 * Common/important entities by topic
 */
const DOMAIN_ENTITIES: Record<string, Array<{ text: string; type: EntityType; importance: EntityImportance }>> = {
  seo: [
    { text: 'search engine optimization', type: 'concept', importance: 'critical' },
    { text: 'keywords', type: 'concept', importance: 'critical' },
    { text: 'backlinks', type: 'concept', importance: 'high' },
    { text: 'SERP', type: 'concept', importance: 'high' },
    { text: 'Google', type: 'brand', importance: 'critical' },
    { text: 'PageRank', type: 'concept', importance: 'medium' },
    { text: 'meta tags', type: 'concept', importance: 'high' },
    { text: 'anchor text', type: 'concept', importance: 'medium' },
    { text: 'crawling', type: 'concept', importance: 'medium' },
    { text: 'indexing', type: 'concept', importance: 'high' },
  ],
  marketing: [
    { text: 'conversion rate', type: 'concept', importance: 'critical' },
    { text: 'ROI', type: 'concept', importance: 'critical' },
    { text: 'customer acquisition', type: 'concept', importance: 'high' },
    { text: 'brand awareness', type: 'concept', importance: 'high' },
    { text: 'target audience', type: 'concept', importance: 'critical' },
  ],
  technology: [
    { text: 'artificial intelligence', type: 'technology', importance: 'critical' },
    { text: 'machine learning', type: 'technology', importance: 'high' },
    { text: 'cloud computing', type: 'technology', importance: 'high' },
    { text: 'API', type: 'technology', importance: 'medium' },
  ]
};

/**
 * Generate unique ID
 */
function generateId(): string {
  return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalize entity text
 */
function normalizeEntity(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calculate entity importance based on various factors
 */
function calculateImportance(
  entity: Partial<Entity>,
  keyword: string,
  contentLength: number
): EntityImportance {
  const normalizedEntity = normalizeEntity(entity.text || '');
  const normalizedKeyword = normalizeEntity(keyword);
  
  // Is it the main keyword?
  if (normalizedEntity === normalizedKeyword || normalizedKeyword.includes(normalizedEntity)) {
    return 'critical';
  }
  
  // High confidence entities
  if ((entity.confidence || 0) > 90) {
    return 'high';
  }
  
  // Frequently mentioned
  const density = ((entity.count || 0) / (contentLength / 100));
  if (density > 1) {
    return 'high';
  }
  
  // Type-based importance
  if (['concept', 'technology', 'brand'].includes(entity.type || '')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Determine entity status based on count and importance
 */
function determineStatus(
  count: number,
  importance: EntityImportance,
  expectedMentions: number = 3
): EntityStatus {
  if (count === 0) return 'missing';
  
  const minMentions = importance === 'critical' ? 3 : importance === 'high' ? 2 : 1;
  const maxMentions = importance === 'critical' ? 10 : importance === 'high' ? 7 : 5;
  
  if (count < minMentions) return 'mentioned';
  if (count > maxMentions) return 'overused';
  return 'covered';
}

/**
 * Extract entities from HTML content
 */
export function extractEntities(
  content: string,
  keyword: string,
  settings: EntityCoverageSettings = DEFAULT_ENTITY_COVERAGE_SETTINGS
): Entity[] {
  const entities: Map<string, Entity> = new Map();
  const textContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const contentLength = textContent.split(/\s+/).length;
  
  // Extract entities using patterns
  for (const type of settings.entityTypes) {
    const patterns = ENTITY_PATTERNS[type] || [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      
      while ((match = regex.exec(textContent)) !== null) {
        const text = match[1] || match[0];
        
        if (text.length < settings.minEntityLength) continue;
        if (settings.ignoreList.includes(text.toLowerCase())) continue;
        
        const normalized = normalizeEntity(text);
        
        if (entities.has(normalized)) {
          const existing = entities.get(normalized)!;
          existing.count++;
          existing.positions.push({
            start: match.index,
            end: match.index + text.length,
            line: textContent.substring(0, match.index).split('\n').length,
            context: textContent.substring(
              Math.max(0, match.index - 30),
              Math.min(textContent.length, match.index + text.length + 30)
            )
          });
        } else {
          const entity: Entity = {
            id: generateId(),
            text,
            normalizedText: normalized,
            type,
            importance: 'medium',
            status: 'mentioned',
            count: 1,
            positions: [{
              start: match.index,
              end: match.index + text.length,
              line: textContent.substring(0, match.index).split('\n').length,
              context: textContent.substring(
                Math.max(0, match.index - 30),
                Math.min(textContent.length, match.index + text.length + 30)
              )
            }],
            confidence: 75,
            seoRelevance: 50
          };
          
          entity.importance = calculateImportance(entity, keyword, contentLength);
          entity.status = determineStatus(entity.count, entity.importance);
          
          entities.set(normalized, entity);
        }
      }
    }
  }
  
  // Add custom entities
  for (const customEntity of settings.customEntities) {
    const normalized = normalizeEntity(customEntity);
    if (!entities.has(normalized)) {
      const regex = new RegExp(`\\b${customEntity}\\b`, 'gi');
      const matches = textContent.match(regex) || [];
      
      const entity: Entity = {
        id: generateId(),
        text: customEntity,
        normalizedText: normalized,
        type: 'custom',
        importance: 'medium',
        status: matches.length > 0 ? 'covered' : 'missing',
        count: matches.length,
        positions: [],
        confidence: 100,
        seoRelevance: 60
      };
      
      entities.set(normalized, entity);
    }
  }
  
  // Add domain-specific entities
  const detectedDomain = detectDomain(keyword);
  const domainEntities = DOMAIN_ENTITIES[detectedDomain] || [];
  
  for (const domainEntity of domainEntities) {
    const normalized = normalizeEntity(domainEntity.text);
    
    if (!entities.has(normalized)) {
      const regex = new RegExp(`\\b${domainEntity.text}\\b`, 'gi');
      const matches = textContent.match(regex) || [];
      
      const entity: Entity = {
        id: generateId(),
        text: domainEntity.text,
        normalizedText: normalized,
        type: domainEntity.type,
        importance: domainEntity.importance,
        status: matches.length > 0 ? 'covered' : 'missing',
        count: matches.length,
        positions: [],
        confidence: 85,
        seoRelevance: 70,
        isCompetitorEntity: false
      };
      
      entities.set(normalized, entity);
    }
  }
  
  // Calculate final metrics and limit results
  const results = Array.from(entities.values())
    .filter(e => e.confidence >= settings.minConfidence)
    .sort((a, b) => {
      const importanceA = ENTITY_IMPORTANCE_WEIGHTS[a.importance];
      const importanceB = ENTITY_IMPORTANCE_WEIGHTS[b.importance];
      if (importanceB !== importanceA) return importanceB - importanceA;
      return b.count - a.count;
    })
    .slice(0, settings.maxEntities);
  
  return results;
}

/**
 * Detect content domain
 */
function detectDomain(keyword: string): string {
  const seoTerms = ['seo', 'search engine', 'ranking', 'backlink', 'keyword'];
  const marketingTerms = ['marketing', 'conversion', 'campaign', 'audience', 'brand'];
  const techTerms = ['software', 'code', 'programming', 'api', 'developer'];
  
  const lower = keyword.toLowerCase();
  
  if (seoTerms.some(t => lower.includes(t))) return 'seo';
  if (marketingTerms.some(t => lower.includes(t))) return 'marketing';
  if (techTerms.some(t => lower.includes(t))) return 'technology';
  
  return 'general';
}

// =============================================================================
// RELATIONSHIP EXTRACTION
// =============================================================================

/**
 * Relationship patterns
 */
const RELATIONSHIP_PATTERNS: Array<{
  pattern: RegExp;
  type: RelationshipType;
}> = [
  { pattern: /(\w+)\s+is\s+a\s+(\w+)/gi, type: 'is_a' },
  { pattern: /(\w+)\s+(?:is\s+)?part\s+of\s+(\w+)/gi, type: 'part_of' },
  { pattern: /(\w+)\s+(?:is\s+)?related\s+to\s+(\w+)/gi, type: 'related_to' },
  { pattern: /(\w+)\s+(?:causes?|leads?\s+to)\s+(\w+)/gi, type: 'causes' },
  { pattern: /(\w+)\s+(?:is\s+)?similar\s+to\s+(\w+)/gi, type: 'similar_to' },
  { pattern: /(\w+)\s+(?:works?\s+for|employed\s+by)\s+(\w+)/gi, type: 'works_for' },
  { pattern: /(\w+)\s+(?:competes?\s+with|vs\.?)\s+(\w+)/gi, type: 'competes_with' },
  { pattern: /(?:for\s+)?example[,:]?\s+(\w+)/gi, type: 'example_of' },
];

/**
 * Extract entity relationships
 */
export function extractRelationships(
  content: string,
  entities: Entity[],
  settings: EntityCoverageSettings
): EntityRelationship[] {
  if (!settings.extractRelationships) return [];
  
  const relationships: EntityRelationship[] = [];
  const textContent = content.replace(/<[^>]+>/g, ' ');
  const entityMap = new Map(entities.map(e => [e.normalizedText, e]));
  
  // Extract using patterns
  for (const { pattern, type } of RELATIONSHIP_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    
    while ((match = regex.exec(textContent)) !== null) {
      const [, source, target] = match;
      const sourceNorm = normalizeEntity(source);
      const targetNorm = normalizeEntity(target);
      
      const sourceEntity = entityMap.get(sourceNorm);
      const targetEntity = entityMap.get(targetNorm);
      
      if (sourceEntity && targetEntity) {
        relationships.push({
          id: generateId(),
          sourceId: sourceEntity.id,
          sourceText: sourceEntity.text,
          targetId: targetEntity.id,
          targetText: targetEntity.text,
          type,
          label: `${sourceEntity.text} ${type.replace(/_/g, ' ')} ${targetEntity.text}`,
          confidence: 70,
          context: textContent.substring(
            Math.max(0, match.index - 50),
            Math.min(textContent.length, match.index + match[0].length + 50)
          )
        });
      }
    }
  }
  
  // Add co-occurrence relationships
  const sentences = textContent.split(/[.!?]+/);
  for (const sentence of sentences) {
    const sentenceEntities: Entity[] = [];
    
    for (const entity of entities) {
      if (sentence.toLowerCase().includes(entity.normalizedText)) {
        sentenceEntities.push(entity);
      }
    }
    
    // Create relationships between co-occurring entities
    for (let i = 0; i < sentenceEntities.length; i++) {
      for (let j = i + 1; j < sentenceEntities.length; j++) {
        const existing = relationships.find(
          r => (r.sourceId === sentenceEntities[i].id && r.targetId === sentenceEntities[j].id) ||
               (r.sourceId === sentenceEntities[j].id && r.targetId === sentenceEntities[i].id)
        );
        
        if (!existing) {
          relationships.push({
            id: generateId(),
            sourceId: sentenceEntities[i].id,
            sourceText: sentenceEntities[i].text,
            targetId: sentenceEntities[j].id,
            targetText: sentenceEntities[j].text,
            type: 'related_to',
            label: `${sentenceEntities[i].text} related to ${sentenceEntities[j].text}`,
            confidence: 50,
            context: sentence.trim()
          });
        }
      }
    }
  }
  
  return relationships;
}

// =============================================================================
// CLUSTERING
// =============================================================================

/**
 * Cluster entities into topic groups
 */
export function clusterEntities(
  entities: Entity[],
  relationships: EntityRelationship[],
  settings: EntityCoverageSettings
): EntityCluster[] {
  if (!settings.enableClustering) return [];
  
  const clusters: EntityCluster[] = [];
  const clusteredIds = new Set<string>();
  
  // Build adjacency map from relationships
  const adjacency = new Map<string, Set<string>>();
  for (const entity of entities) {
    adjacency.set(entity.id, new Set());
  }
  
  for (const rel of relationships) {
    adjacency.get(rel.sourceId)?.add(rel.targetId);
    adjacency.get(rel.targetId)?.add(rel.sourceId);
  }
  
  // Group by entity type first
  const typeGroups = new Map<EntityType, Entity[]>();
  for (const entity of entities) {
    if (!typeGroups.has(entity.type)) {
      typeGroups.set(entity.type, []);
    }
    typeGroups.get(entity.type)!.push(entity);
  }
  
  // Create clusters by type
  for (const [type, typeEntities] of typeGroups) {
    if (typeEntities.length >= settings.minClusterSize) {
      const clusterEntityIds = typeEntities.map(e => e.id);
      const coveredCount = typeEntities.filter(e => e.status === 'covered').length;
      
      clusters.push({
        id: generateId(),
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Entities`,
        mainTopic: type,
        entityIds: clusterEntityIds,
        coherenceScore: 70,
        coveragePercent: Math.round((coveredCount / typeEntities.length) * 100),
        suggestedEntities: []
      });
      
      clusterEntityIds.forEach(id => clusteredIds.add(id));
    }
  }
  
  // Create relationship-based clusters
  for (const entity of entities) {
    if (clusteredIds.has(entity.id)) continue;
    
    const related = adjacency.get(entity.id);
    if (!related || related.size < settings.minClusterSize - 1) continue;
    
    const clusterEntityIds = [entity.id, ...related];
    const clusterEntities = entities.filter(e => clusterEntityIds.includes(e.id));
    const coveredCount = clusterEntities.filter(e => e.status === 'covered').length;
    
    clusters.push({
      id: generateId(),
      name: `${entity.text} Cluster`,
      mainTopic: entity.text,
      entityIds: clusterEntityIds,
      coherenceScore: 60,
      coveragePercent: Math.round((coveredCount / clusterEntities.length) * 100),
      suggestedEntities: []
    });
    
    clusterEntityIds.forEach(id => clusteredIds.add(id));
  }
  
  return clusters;
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

/**
 * Calculate entity coverage metrics
 */
export function calculateEntityMetrics(
  entities: Entity[],
  relationships: EntityRelationship[],
  clusters: EntityCluster[]
): EntityCoverageMetrics {
  const entitiesByType: Record<EntityType, number> = {
    person: 0, organization: 0, location: 0, product: 0, brand: 0,
    concept: 0, technology: 0, event: 0, quantity: 0, time: 0,
    money: 0, percent: 0, attribute: 0, action: 0, topic: 0,
    subtopic: 0, custom: 0
  };
  
  const entitiesByStatus: Record<EntityStatus, number> = {
    covered: 0, mentioned: 0, missing: 0, overused: 0
  };
  
  const entitiesByImportance: Record<EntityImportance, number> = {
    critical: 0, high: 0, medium: 0, low: 0
  };
  
  let totalConfidence = 0;
  const criticalEntities: Entity[] = [];
  const missingCritical: string[] = [];
  
  for (const entity of entities) {
    entitiesByType[entity.type]++;
    entitiesByStatus[entity.status]++;
    entitiesByImportance[entity.importance]++;
    totalConfidence += entity.confidence;
    
    if (entity.importance === 'critical') {
      criticalEntities.push(entity);
      if (entity.status === 'missing') {
        missingCritical.push(entity.text);
      }
    }
  }
  
  // Calculate overall score
  const coveredCount = entitiesByStatus.covered;
  const totalCount = entities.length;
  const coverageRatio = totalCount > 0 ? coveredCount / totalCount : 0;
  
  const criticalCoveredCount = criticalEntities.filter(e => e.status === 'covered').length;
  const criticalRatio = criticalEntities.length > 0 
    ? criticalCoveredCount / criticalEntities.length 
    : 1;
  
  const overallScore = Math.round(
    (coverageRatio * 50) + (criticalRatio * 50)
  );
  
  return {
    overallScore,
    totalEntities: totalCount,
    entitiesByType,
    entitiesByStatus,
    entitiesByImportance,
    criticalEntitiesCovered: criticalCoveredCount,
    criticalEntitiesTotal: criticalEntities.length,
    missingCriticalEntities: missingCritical,
    competitorCoverage: 0, // Will be updated if competitor data available
    knowledgeGraphAlignment: 70, // Placeholder
    entityDensity: 0, // Will be calculated based on content length
    relationshipCount: relationships.length,
    clusterCount: clusters.length,
    uniqueEntityTypes: Object.values(entitiesByType).filter(c => c > 0).length,
    averageConfidence: totalCount > 0 ? Math.round(totalConfidence / totalCount) : 0
  };
}

// =============================================================================
// GAP ANALYSIS
// =============================================================================

/**
 * Identify entity gaps
 */
export function identifyEntityGaps(
  entities: Entity[],
  competitorData: CompetitorEntityData[] = []
): EntityGap[] {
  const gaps: EntityGap[] = [];
  
  // Find missing entities
  for (const entity of entities) {
    if (entity.status === 'missing' && entity.importance !== 'low') {
      gaps.push({
        id: generateId(),
        entity: entity.text,
        type: entity.type,
        importance: entity.importance,
        reason: 'missing',
        competitorsWithEntity: [],
        avgCompetitorMentions: 0,
        suggestedContext: `Consider adding "${entity.text}" to improve entity coverage.`,
        priority: ENTITY_IMPORTANCE_WEIGHTS[entity.importance]
      });
    }
  }
  
  // Find undermentioned entities
  for (const entity of entities) {
    if (entity.status === 'mentioned' && entity.importance === 'critical') {
      gaps.push({
        id: generateId(),
        entity: entity.text,
        type: entity.type,
        importance: entity.importance,
        reason: 'undermentioned',
        competitorsWithEntity: [],
        avgCompetitorMentions: 0,
        suggestedContext: `"${entity.text}" needs more coverage (mentioned ${entity.count} times).`,
        priority: 3
      });
    }
  }
  
  // Find competitor-only entities
  if (competitorData.length > 0) {
    const yourEntities = new Set(entities.map(e => e.normalizedText));
    
    for (const competitor of competitorData) {
      for (const compEntity of competitor.uniqueEntities) {
        if (!yourEntities.has(normalizeEntity(compEntity))) {
          const existingGap = gaps.find(g => g.entity.toLowerCase() === compEntity.toLowerCase());
          
          if (existingGap) {
            existingGap.competitorsWithEntity.push(competitor.domain);
          } else {
            gaps.push({
              id: generateId(),
              entity: compEntity,
              type: 'concept',
              importance: 'medium',
              reason: 'competitor_only',
              competitorsWithEntity: [competitor.domain],
              avgCompetitorMentions: 1,
              suggestedContext: `Competitors mention "${compEntity}" - consider adding it.`,
              priority: 2
            });
          }
        }
      }
    }
  }
  
  // Sort by priority
  return gaps.sort((a, b) => b.priority - a.priority);
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Generate entity recommendations
 */
export function generateEntityRecommendations(
  entities: Entity[],
  metrics: EntityCoverageMetrics,
  gaps: EntityGap[]
): EntityRecommendation[] {
  const recommendations: EntityRecommendation[] = [];
  
  // Missing critical entities
  for (const missing of metrics.missingCriticalEntities) {
    recommendations.push({
      id: generateId(),
      type: 'add',
      target: missing,
      targetType: 'concept',
      title: `Add critical entity: ${missing}`,
      description: `This entity is critical for topic coverage but is missing from your content.`,
      impact: 'critical',
      effort: 'medium',
      suggestedAction: `Add "${missing}" with relevant context and explanation.`
    });
  }
  
  // Undermentioned important entities
  const undermentioned = entities.filter(
    e => e.status === 'mentioned' && ['critical', 'high'].includes(e.importance)
  );
  
  for (const entity of undermentioned.slice(0, 5)) {
    recommendations.push({
      id: generateId(),
      type: 'expand',
      target: entity.text,
      targetType: entity.type,
      title: `Expand coverage of "${entity.text}"`,
      description: `Currently mentioned ${entity.count} times. Consider adding more context.`,
      impact: entity.importance,
      effort: 'low',
      suggestedAction: `Add 1-2 more mentions with detailed explanation.`
    });
  }
  
  // Overused entities
  const overused = entities.filter(e => e.status === 'overused');
  
  for (const entity of overused) {
    recommendations.push({
      id: generateId(),
      type: 'reduce',
      target: entity.text,
      targetType: entity.type,
      title: `Reduce mentions of "${entity.text}"`,
      description: `Mentioned ${entity.count} times - may appear as keyword stuffing.`,
      impact: 'medium',
      effort: 'low',
      suggestedAction: `Reduce mentions and use synonyms or related terms.`
    });
  }
  
  // Link suggestions
  const linkableEntities = entities.filter(
    e => e.shouldLink && !e.suggestedLinkUrl && e.importance !== 'low'
  );
  
  for (const entity of linkableEntities.slice(0, 3)) {
    recommendations.push({
      id: generateId(),
      type: 'link',
      target: entity.text,
      targetType: entity.type,
      title: `Add link for "${entity.text}"`,
      description: `This entity could benefit from a supporting link.`,
      impact: 'medium',
      effort: 'low',
      suggestedAction: `Add internal or external link to authoritative source.`
    });
  }
  
  // Gap-based recommendations
  for (const gap of gaps.slice(0, 5)) {
    if (gap.reason === 'competitor_only') {
      recommendations.push({
        id: generateId(),
        type: 'add',
        target: gap.entity,
        targetType: gap.type,
        title: `Add competitor entity: ${gap.entity}`,
        description: `${gap.competitorsWithEntity.length} competitors mention this entity.`,
        impact: 'high',
        effort: 'medium',
        suggestedAction: gap.suggestedContext
      });
    }
  }
  
  return recommendations;
}

// =============================================================================
// SUGGESTIONS
// =============================================================================

/**
 * Generate entity suggestions
 */
export function generateEntitySuggestions(
  keyword: string,
  entities: Entity[],
  gaps: EntityGap[]
): EntitySuggestion[] {
  const suggestions: EntitySuggestion[] = [];
  const existingEntities = new Set(entities.map(e => e.normalizedText));
  
  // Suggest from gaps
  for (const gap of gaps) {
    if (!existingEntities.has(normalizeEntity(gap.entity))) {
      suggestions.push({
        entity: gap.entity,
        type: gap.type,
        reason: gap.suggestedContext,
        context: `Add this entity to improve ${gap.reason === 'competitor_only' ? 'competitive' : 'topic'} coverage.`,
        relevance: gap.priority * 25,
        relatedTo: [],
        source: gap.reason === 'competitor_only' ? 'competitor' : 'semantic'
      });
    }
  }
  
  // Suggest related entities based on keyword
  const domain = detectDomain(keyword);
  const domainEntities = DOMAIN_ENTITIES[domain] || [];
  
  for (const domainEntity of domainEntities) {
    if (!existingEntities.has(normalizeEntity(domainEntity.text))) {
      suggestions.push({
        entity: domainEntity.text,
        type: domainEntity.type,
        reason: `Common entity for ${domain} content.`,
        context: `Consider adding for comprehensive topic coverage.`,
        relevance: ENTITY_IMPORTANCE_WEIGHTS[domainEntity.importance] * 20,
        relatedTo: [],
        source: 'semantic'
      });
    }
  }
  
  return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
}

// =============================================================================
// SUMMARY GENERATION
// =============================================================================

/**
 * Generate coverage summary
 */
export function generateEntitySummary(
  metrics: EntityCoverageMetrics,
  gaps: EntityGap[]
): EntityCoverageSummary {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const quickWins: string[] = [];
  const priorityActions: string[] = [];
  
  // Analyze strengths
  if (metrics.overallScore >= 80) {
    strengths.push('Excellent overall entity coverage');
  }
  if (metrics.criticalEntitiesCovered === metrics.criticalEntitiesTotal && metrics.criticalEntitiesTotal > 0) {
    strengths.push('All critical entities are covered');
  }
  if (metrics.relationshipCount > 10) {
    strengths.push('Strong entity relationships identified');
  }
  if (metrics.uniqueEntityTypes >= 5) {
    strengths.push('Diverse entity types included');
  }
  
  // Analyze weaknesses
  if (metrics.missingCriticalEntities.length > 0) {
    weaknesses.push(`Missing ${metrics.missingCriticalEntities.length} critical entities`);
    priorityActions.push(`Add missing critical entities: ${metrics.missingCriticalEntities.slice(0, 3).join(', ')}`);
  }
  if (metrics.entitiesByStatus.overused > 0) {
    weaknesses.push(`${metrics.entitiesByStatus.overused} entities are overused`);
    quickWins.push('Reduce overused entity mentions');
  }
  if (metrics.averageConfidence < 70) {
    weaknesses.push('Low average entity confidence');
  }
  if (gaps.filter(g => g.reason === 'competitor_only').length > 3) {
    weaknesses.push('Missing entities that competitors cover');
    quickWins.push('Add competitor-mentioned entities');
  }
  
  // Determine verdict
  let verdict: EntityCoverageSummary['verdict'];
  if (metrics.overallScore >= 85) verdict = 'excellent';
  else if (metrics.overallScore >= 70) verdict = 'good';
  else if (metrics.overallScore >= 55) verdict = 'average';
  else if (metrics.overallScore >= 40) verdict = 'needs_work';
  else verdict = 'poor';
  
  // Main finding
  const mainFinding = metrics.overallScore >= 70
    ? `Good entity coverage with ${metrics.totalEntities} entities identified.`
    : `Entity coverage needs improvement. ${metrics.entitiesByStatus.missing} entities are missing.`;
  
  return {
    mainFinding,
    strengths,
    weaknesses,
    quickWins,
    priorityActions,
    verdict
  };
}

/**
 * Calculate score breakdown
 */
export function calculateScoreBreakdown(
  entities: Entity[],
  metrics: EntityCoverageMetrics,
  competitorData: CompetitorEntityData[] = []
): EntityScoreBreakdown {
  // Breadth: variety of entity types
  const breadthScore = Math.min(100, metrics.uniqueEntityTypes * 12);
  
  // Depth: average coverage per entity
  const coveredRatio = metrics.totalEntities > 0 
    ? metrics.entitiesByStatus.covered / metrics.totalEntities 
    : 0;
  const depthScore = Math.round(coveredRatio * 100);
  
  // Relevance: importance distribution
  const importantEntities = metrics.entitiesByImportance.critical + metrics.entitiesByImportance.high;
  const relevanceScore = metrics.totalEntities > 0
    ? Math.round((importantEntities / metrics.totalEntities) * 100)
    : 50;
  
  // Relationships
  const relationshipScore = Math.min(100, metrics.relationshipCount * 5);
  
  // Competitor parity
  const competitorParityScore = competitorData.length > 0
    ? metrics.competitorCoverage
    : 70; // Default if no competitor data
  
  // Knowledge graph
  const knowledgeGraphScore = metrics.knowledgeGraphAlignment;
  
  return {
    breadthScore,
    depthScore,
    relevanceScore,
    relationshipScore,
    competitorParityScore,
    knowledgeGraphScore
  };
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform full entity coverage analysis
 */
export function analyzeEntityCoverage(
  content: string,
  keyword: string,
  settings: EntityCoverageSettings = DEFAULT_ENTITY_COVERAGE_SETTINGS
): EntityCoverageAnalysis {
  // Extract entities
  const entities = extractEntities(content, keyword, settings);
  
  // Extract relationships
  const relationships = extractRelationships(content, entities, settings);
  
  // Cluster entities
  const clusters = clusterEntities(entities, relationships, settings);
  
  // Calculate metrics
  const metrics = calculateEntityMetrics(entities, relationships, clusters);
  
  // Calculate entity density
  const wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
  metrics.entityDensity = Math.round((entities.length / wordCount) * 100 * 10) / 10;
  
  // Identify gaps
  const gaps = identifyEntityGaps(entities);
  
  // Generate recommendations
  const recommendations = generateEntityRecommendations(entities, metrics, gaps);
  
  // Generate suggestions
  const suggestions = generateEntitySuggestions(keyword, entities, gaps);
  
  // Generate summary
  const summary = generateEntitySummary(metrics, gaps);
  
  // Calculate score breakdown
  const scoreBreakdown = calculateScoreBreakdown(entities, metrics);
  
  return {
    timestamp: new Date(),
    keyword,
    contentLength: wordCount,
    metrics,
    entities,
    relationships,
    clusters,
    gaps,
    recommendations,
    suggestions,
    summary,
    scoreBreakdown
  };
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export entity coverage report
 */
export function exportEntityReport(
  analysis: EntityCoverageAnalysis,
  format: EntityExportFormat = 'markdown'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(analysis, null, 2);
      
    case 'csv':
      const headers = ['Entity', 'Type', 'Status', 'Importance', 'Count', 'Confidence'];
      const rows = analysis.entities.map(e => [
        e.text, e.type, e.status, e.importance, e.count.toString(), e.confidence.toString()
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    case 'markdown':
    default:
      return `# Entity Coverage Report

## Summary
- **Overall Score:** ${analysis.metrics.overallScore}/100
- **Verdict:** ${analysis.summary.verdict}
- **Total Entities:** ${analysis.metrics.totalEntities}
- **Entity Density:** ${analysis.metrics.entityDensity} per 100 words

## Key Finding
${analysis.summary.mainFinding}

## Strengths
${analysis.summary.strengths.map(s => `- ${s}`).join('\n') || '- No significant strengths identified'}

## Weaknesses
${analysis.summary.weaknesses.map(w => `- ${w}`).join('\n') || '- No significant weaknesses identified'}

## Quick Wins
${analysis.summary.quickWins.map(q => `- ${q}`).join('\n') || '- No quick wins identified'}

## Score Breakdown
| Category | Score |
|----------|-------|
| Breadth | ${analysis.scoreBreakdown.breadthScore}/100 |
| Depth | ${analysis.scoreBreakdown.depthScore}/100 |
| Relevance | ${analysis.scoreBreakdown.relevanceScore}/100 |
| Relationships | ${analysis.scoreBreakdown.relationshipScore}/100 |

## Top Entities
${analysis.entities.slice(0, 10).map(e => 
  `- **${e.text}** (${e.type}) - ${e.status} - ${e.count} mentions`
).join('\n')}

## Recommendations
${analysis.recommendations.slice(0, 5).map(r => 
  `### ${r.title}\n${r.description}\n*Action:* ${r.suggestedAction || 'N/A'}`
).join('\n\n')}

---
Generated: ${analysis.timestamp.toISOString()}
`;
  }
}

// =============================================================================
// HIGHLIGHTING
// =============================================================================

/**
 * Generate entity highlighting data
 */
export function getEntityHighlights(
  entities: Entity[]
): Array<{
  text: string;
  type: EntityType;
  status: EntityStatus;
  positions: EntityPosition[];
}> {
  return entities.map(e => ({
    text: e.text,
    type: e.type,
    status: e.status,
    positions: e.positions
  }));
}

