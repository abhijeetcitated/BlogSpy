// =============================================================================
// PAA (PEOPLE ALSO ASK) UTILITIES - Production Level
// Question extraction, clustering, coverage analysis
// =============================================================================

import {
  PAAData,
  PAAQuestion,
  PAAQuestionGroup,
  PAACluster,
  PAATreeNode,
  PAARelatedSearch,
  PAALocation,
  QuestionType,
  QuestionIntent,
  QuestionCategory,
  AnswerFormat,
  PAADifficultyLevel,
  CoverageStatus,
  PAAFetchOptions,
  PAAAnalysisOptions,
  PAAFilters,
  CoverageAnalysis,
  PAAOpportunity,
  PAAStatistics,
  DEFAULT_PAA_OPTIONS,
  DEFAULT_PAA_FILTERS,
  QUESTION_TYPE_LABELS,
  QUESTION_CATEGORY_LABELS
} from '@/src/features/ai-writer/types/tools/paa.types';

// =============================================================================
// QUESTION EXTRACTION & PARSING
// =============================================================================

/**
 * Generate unique question ID
 */
export function generateQuestionId(): string {
  return `paa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Detect question type from text
 */
export function detectQuestionType(question: string): QuestionType {
  const normalized = question.toLowerCase().trim();

  // Check for comparison patterns first
  if (normalized.includes(' vs ') || normalized.includes(' versus ') || normalized.includes(' or ')) {
    return 'comparison';
  }

  // Check for list patterns
  if (/^(top|best|\d+)/.test(normalized) || /list of/.test(normalized)) {
    return 'list';
  }

  // Check question starters
  const typePatterns: Array<[RegExp, QuestionType]> = [
    [/^what\s/, 'what'],
    [/^how\s/, 'how'],
    [/^why\s/, 'why'],
    [/^when\s/, 'when'],
    [/^where\s/, 'where'],
    [/^who\s/, 'who'],
    [/^which\s/, 'which'],
    [/^can\s/, 'can'],
    [/^does\s/, 'does'],
    [/^do\s/, 'does'],
    [/^is\s/, 'is'],
    [/^are\s/, 'are'],
    [/^will\s/, 'will'],
    [/^should\s/, 'should']
  ];

  for (const [pattern, type] of typePatterns) {
    if (pattern.test(normalized)) {
      return type;
    }
  }

  return 'other';
}

/**
 * Detect question intent
 */
export function detectQuestionIntent(question: string): QuestionIntent {
  const normalized = question.toLowerCase();

  // Transactional signals
  if (/buy|purchase|price|cost|cheap|discount|deal|sale|order|subscribe/.test(normalized)) {
    return 'transactional';
  }

  // Commercial signals
  if (/best|top|review|compare|vs|versus|alternative|recommend/.test(normalized)) {
    return 'commercial';
  }

  // Navigational signals
  if (/login|sign in|website|official|download|contact|support/.test(normalized)) {
    return 'navigational';
  }

  // Comparison signals
  if (/vs|versus|difference|compare|better|worse/.test(normalized)) {
    return 'comparison';
  }

  // Educational signals
  if (/learn|tutorial|guide|course|example|explain|understand/.test(normalized)) {
    return 'educational';
  }

  // Default to informational
  return 'informational';
}

/**
 * Detect question category
 */
export function detectQuestionCategory(question: string): QuestionCategory {
  const normalized = question.toLowerCase();

  // How-to questions
  if (/^how (to|do|can|should)/.test(normalized) || /guide|tutorial|steps/.test(normalized)) {
    return 'how-to';
  }

  // Comparison questions
  if (/vs|versus|compare|difference|better|worse/.test(normalized)) {
    return 'comparison';
  }

  // Troubleshooting questions
  if (/fix|solve|problem|issue|error|not working|doesn't work|won't/.test(normalized)) {
    return 'troubleshooting';
  }

  // Features questions
  if (/feature|specification|spec|capability|function|does it have/.test(normalized)) {
    return 'features';
  }

  // Pricing questions
  if (/price|cost|free|paid|subscription|plan|tier/.test(normalized)) {
    return 'pricing';
  }

  // Alternatives questions
  if (/alternative|instead|similar|like|replacement/.test(normalized)) {
    return 'alternatives';
  }

  // Reviews questions
  if (/review|opinion|good|bad|worth|recommend/.test(normalized)) {
    return 'reviews';
  }

  // Basic questions (what is, what does, etc.)
  if (/^(what|who|where|when) (is|are|was|were|does)/.test(normalized)) {
    return 'basics';
  }

  return 'other';
}

/**
 * Detect best answer format for a question
 */
export function detectAnswerFormat(question: string): AnswerFormat {
  const normalized = question.toLowerCase();

  // Steps/procedure questions
  if (/^how to|steps|process|procedure|guide/.test(normalized)) {
    return 'steps';
  }

  // List questions
  if (/^(what are|list|top|best|\d+)/.test(normalized) || /examples|types|kinds/.test(normalized)) {
    return 'list';
  }

  // Comparison questions → table
  if (/vs|versus|compare|difference/.test(normalized)) {
    return 'table';
  }

  // Video-likely questions
  if (/how to (make|create|build|do|play|use)/.test(normalized)) {
    return 'video';
  }

  // Default to paragraph
  return 'paragraph';
}

/**
 * Extract keywords from question
 */
export function extractQuestionKeywords(question: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who',
    'whom', 'this', 'that', 'these', 'those', 'am', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'your', 'their', 'its', 'my', 'his', 'her', 'our'
  ]);

  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Remove duplicates and return
  return [...new Set(words)];
}

/**
 * Extract entities from question (simple NER)
 */
export function extractQuestionEntities(question: string): string[] {
  const entities: string[] = [];

  // Extract quoted terms
  const quotedMatches = question.match(/"([^"]+)"/g);
  if (quotedMatches) {
    entities.push(...quotedMatches.map(m => m.replace(/"/g, '')));
  }

  // Extract capitalized multi-word terms (potential proper nouns)
  const capitalizedMatches = question.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g);
  if (capitalizedMatches) {
    entities.push(...capitalizedMatches);
  }

  // Extract technology/brand patterns
  const techPatterns = /\b(Google|Microsoft|Apple|Amazon|Facebook|Meta|OpenAI|ChatGPT|GPT-\d|iPhone|Android|Windows|Mac|Linux|Chrome|Firefox|Safari|React|Angular|Vue|Node\.js|Python|JavaScript|TypeScript)\b/gi;
  const techMatches = question.match(techPatterns);
  if (techMatches) {
    entities.push(...techMatches);
  }

  return [...new Set(entities)];
}

/**
 * Calculate question difficulty
 */
export function calculateQuestionDifficulty(
  question: PAAQuestion,
  competitorStrength: number = 50
): PAADifficultyLevel {
  let difficultyScore = 0;

  // Factor 1: Competitor strength (0-100)
  difficultyScore += competitorStrength * 0.4;

  // Factor 2: Question specificity
  const keywords = question.keywords.length;
  if (keywords <= 2) difficultyScore += 10;
  else if (keywords <= 4) difficultyScore += 20;
  else difficultyScore += 30;

  // Factor 3: Question type complexity
  const complexTypes: QuestionType[] = ['comparison', 'why', 'how'];
  if (complexTypes.includes(question.type)) {
    difficultyScore += 15;
  }

  // Factor 4: Intent (transactional/commercial are harder)
  if (question.intent === 'transactional' || question.intent === 'commercial') {
    difficultyScore += 15;
  }

  // Map to difficulty level
  if (difficultyScore < 30) return 'easy';
  if (difficultyScore < 50) return 'medium';
  if (difficultyScore < 70) return 'hard';
  return 'very-hard';
}

// =============================================================================
// QUESTION GENERATION (MOCK FOR DEMO)
// =============================================================================

/**
 * Generate mock PAA questions for a keyword (for demo/testing)
 */
export function generateMockPAAQuestions(
  keyword: string,
  count: number = 20
): PAAQuestion[] {
  const questionTemplates = [
    { prefix: 'What is', suffix: '?' },
    { prefix: 'How does', suffix: 'work?' },
    { prefix: 'Why is', suffix: 'important?' },
    { prefix: 'When should you use', suffix: '?' },
    { prefix: 'What are the benefits of', suffix: '?' },
    { prefix: 'How to use', suffix: 'effectively?' },
    { prefix: 'What is the best', suffix: '?' },
    { prefix: 'Is', suffix: 'worth it?' },
    { prefix: 'Can you', suffix: 'for free?' },
    { prefix: 'What are the alternatives to', suffix: '?' },
    { prefix: 'How much does', suffix: 'cost?' },
    { prefix: 'What is the difference between', suffix: 'and competitors?' },
    { prefix: 'Who uses', suffix: '?' },
    { prefix: 'Where can I learn', suffix: '?' },
    { prefix: 'What are examples of', suffix: '?' },
    { prefix: 'How to get started with', suffix: '?' },
    { prefix: 'What problems does', suffix: 'solve?' },
    { prefix: 'Is', suffix: 'good for beginners?' },
    { prefix: 'What features does', suffix: 'have?' },
    { prefix: 'How to optimize', suffix: '?' },
    { prefix: 'What are the disadvantages of', suffix: '?' },
    { prefix: 'Should I use', suffix: '?' },
    { prefix: 'What is the future of', suffix: '?' },
    { prefix: 'How to choose the right', suffix: '?' },
    { prefix: 'What industries use', suffix: '?' }
  ];

  const answerSnippets = [
    `${keyword} is a powerful solution that helps businesses improve their efficiency and productivity.`,
    `The main benefits of ${keyword} include increased performance, better user experience, and cost savings.`,
    `To get started with ${keyword}, you need to first understand your requirements and then follow the setup guide.`,
    `${keyword} works by analyzing your data and providing actionable insights for improvement.`,
    `Many companies use ${keyword} to streamline their operations and stay competitive in the market.`,
    `The cost of ${keyword} varies depending on your needs, with plans starting from basic to enterprise.`,
    `${keyword} stands out from competitors due to its unique features and ease of use.`,
    `Learning ${keyword} typically takes a few weeks to become proficient with the basics.`
  ];

  const sourceDomains = [
    'example.com', 'blog.example.com', 'docs.example.com',
    'medium.com', 'forbes.com', 'techcrunch.com',
    'wikipedia.org', 'hubspot.com', 'searchenginejournal.com'
  ];

  const questions: PAAQuestion[] = [];

  for (let i = 0; i < Math.min(count, questionTemplates.length); i++) {
    const template = questionTemplates[i];
    const questionText = `${template.prefix} ${keyword} ${template.suffix}`;
    const type = detectQuestionType(questionText);
    const intent = detectQuestionIntent(questionText);
    const answerFormat = detectAnswerFormat(questionText);
    const sourceDomain = sourceDomains[i % sourceDomains.length];

    questions.push({
      id: generateQuestionId(),
      question: questionText,
      answerSnippet: answerSnippets[i % answerSnippets.length],
      sourceUrl: `https://${sourceDomain}/article-${i}`,
      sourceDomain,
      position: i + 1,
      type,
      intent,
      searchVolume: Math.floor(Math.random() * 5000) + 100,
      difficulty: (['easy', 'medium', 'hard', 'very-hard'] as PAADifficultyLevel[])[Math.floor(Math.random() * 4)],
      isFeatured: i < 4,
      depth: 0,
      entities: extractQuestionEntities(questionText),
      keywords: extractQuestionKeywords(questionText),
      answerFormat,
      coverageStatus: 'not-covered',
      relevanceScore: Math.floor(Math.random() * 40) + 60 // 60-100
    });
  }

  return questions;
}

/**
 * Generate child questions for a parent question
 */
export function generateChildQuestions(
  parent: PAAQuestion,
  keyword: string,
  count: number = 3
): PAAQuestion[] {
  const followUpPrefixes = [
    'How do you',
    'What happens if',
    'Is it possible to',
    'What is the best way to',
    'Can you explain'
  ];

  const topicWord = parent.keywords[0] || keyword;

  return followUpPrefixes.slice(0, count).map((prefix, index) => {
    const questionText = `${prefix} ${topicWord}?`;
    const type = detectQuestionType(questionText);
    const intent = detectQuestionIntent(questionText);

    return {
      id: generateQuestionId(),
      question: questionText,
      answerSnippet: `This is a follow-up question about ${topicWord} that provides more specific information.`,
      sourceUrl: `https://example.com/child-${index}`,
      sourceDomain: 'example.com',
      position: index + 1,
      type,
      intent,
      searchVolume: Math.floor(parent.searchVolume! * 0.3 * Math.random()),
      difficulty: parent.difficulty,
      isFeatured: false,
      parentId: parent.id,
      depth: parent.depth + 1,
      entities: extractQuestionEntities(questionText),
      keywords: extractQuestionKeywords(questionText),
      answerFormat: detectAnswerFormat(questionText),
      coverageStatus: 'not-covered',
      relevanceScore: Math.max(50, parent.relevanceScore - 10)
    };
  });
}

// =============================================================================
// QUESTION GROUPING & CLUSTERING
// =============================================================================

/**
 * Group questions by type
 */
export function groupQuestionsByType(questions: PAAQuestion[]): PAAQuestionGroup[] {
  const groups: Map<QuestionType, PAAQuestion[]> = new Map();

  questions.forEach(q => {
    const existing = groups.get(q.type) || [];
    groups.set(q.type, [...existing, q]);
  });

  const result: PAAQuestionGroup[] = [];

  groups.forEach((groupQuestions, type) => {
    // Calculate average difficulty
    const difficulties = groupQuestions.map(q => {
      switch (q.difficulty) {
        case 'easy': return 1;
        case 'medium': return 2;
        case 'hard': return 3;
        case 'very-hard': return 4;
      }
    });
    const avgDiff = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    let avgDifficulty: PAADifficultyLevel = 'easy';
    if (avgDiff >= 3.5) avgDifficulty = 'very-hard';
    else if (avgDiff >= 2.5) avgDifficulty = 'hard';
    else if (avgDiff >= 1.5) avgDifficulty = 'medium';

    result.push({
      category: type as unknown as QuestionCategory,
      label: QUESTION_TYPE_LABELS[type],
      questions: groupQuestions.sort((a, b) => b.relevanceScore - a.relevanceScore),
      icon: getQuestionTypeIcon(type),
      avgDifficulty
    });
  });

  return result.sort((a, b) => b.questions.length - a.questions.length);
}

/**
 * Group questions by category
 */
export function groupQuestionsByCategory(questions: PAAQuestion[]): PAAQuestionGroup[] {
  const groups: Map<QuestionCategory, PAAQuestion[]> = new Map();

  questions.forEach(q => {
    const category = detectQuestionCategory(q.question);
    const existing = groups.get(category) || [];
    groups.set(category, [...existing, q]);
  });

  const result: PAAQuestionGroup[] = [];

  groups.forEach((groupQuestions, category) => {
    const difficulties = groupQuestions.map(q => {
      switch (q.difficulty) {
        case 'easy': return 1;
        case 'medium': return 2;
        case 'hard': return 3;
        case 'very-hard': return 4;
      }
    });
    const avgDiff = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    let avgDifficulty: PAADifficultyLevel = 'easy';
    if (avgDiff >= 3.5) avgDifficulty = 'very-hard';
    else if (avgDiff >= 2.5) avgDifficulty = 'hard';
    else if (avgDiff >= 1.5) avgDifficulty = 'medium';

    result.push({
      category,
      label: QUESTION_CATEGORY_LABELS[category],
      questions: groupQuestions.sort((a, b) => b.relevanceScore - a.relevanceScore),
      icon: getCategoryIcon(category),
      avgDifficulty
    });
  });

  return result.sort((a, b) => b.questions.length - a.questions.length);
}

/**
 * Cluster questions by topic similarity
 */
export function clusterQuestionsByTopic(
  questions: PAAQuestion[],
  clusterCount: number = 5
): PAACluster[] {
  // Simple keyword-based clustering
  const keywordGroups: Map<string, PAAQuestion[]> = new Map();

  // Extract primary keyword for each question
  questions.forEach(q => {
    const primaryKeyword = q.keywords[0] || 'general';
    const existing = keywordGroups.get(primaryKeyword) || [];
    keywordGroups.set(primaryKeyword, [...existing, q]);
  });

  // Convert to clusters and merge small clusters
  const clusters: PAACluster[] = [];
  const sortedGroups = [...keywordGroups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, clusterCount);

  sortedGroups.forEach(([topic, clusterQuestions], index) => {
    // Find dominant type
    const typeCounts: Record<QuestionType, number> = {} as Record<QuestionType, number>;
    clusterQuestions.forEach(q => {
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    });
    const dominantType = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as QuestionType || 'other';

    // Calculate relevance score
    const avgRelevance = clusterQuestions.reduce((sum, q) => sum + q.relevanceScore, 0) / clusterQuestions.length;

    // Collect all keywords
    const allKeywords = clusterQuestions.flatMap(q => q.keywords);
    const uniqueKeywords = [...new Set(allKeywords)].slice(0, 10);

    clusters.push({
      id: `cluster_${index}`,
      topic: capitalizeFirst(topic),
      questions: clusterQuestions,
      size: clusterQuestions.length,
      relevanceScore: Math.round(avgRelevance),
      dominantType,
      keywords: uniqueKeywords
    });
  });

  // Add remaining questions to "Other" cluster if any
  const clusteredIds = new Set(clusters.flatMap(c => c.questions.map(q => q.id)));
  const unclustered = questions.filter(q => !clusteredIds.has(q.id));

  if (unclustered.length > 0) {
    clusters.push({
      id: 'cluster_other',
      topic: 'Other Topics',
      questions: unclustered,
      size: unclustered.length,
      relevanceScore: Math.round(unclustered.reduce((sum, q) => sum + q.relevanceScore, 0) / unclustered.length),
      dominantType: 'other',
      keywords: []
    });
  }

  return clusters;
}

/**
 * Build question tree structure
 */
export function buildQuestionTree(questions: PAAQuestion[]): PAATreeNode[] {
  const rootQuestions = questions.filter(q => !q.parentId);
  const childMap = new Map<string, PAAQuestion[]>();

  // Group children by parent
  questions.forEach(q => {
    if (q.parentId) {
      const existing = childMap.get(q.parentId) || [];
      childMap.set(q.parentId, [...existing, q]);
    }
  });

  // Build tree recursively
  function buildNode(question: PAAQuestion, path: string[]): PAATreeNode {
    const children = childMap.get(question.id) || [];
    return {
      question,
      children: children.map(child => buildNode(child, [...path, question.id])),
      isExpanded: question.depth < 1,
      path
    };
  }

  return rootQuestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map(q => buildNode(q, []));
}

// =============================================================================
// COVERAGE ANALYSIS
// =============================================================================

/**
 * Analyze content coverage for questions
 */
export function analyzeContentCoverage(
  questions: PAAQuestion[],
  content: string
): PAAQuestion[] {
  const normalizedContent = content.toLowerCase();

  return questions.map(q => {
    const coverageStatus = calculateCoverageStatus(q, normalizedContent);
    return { ...q, coverageStatus };
  });
}

/**
 * Calculate coverage status for a question
 */
function calculateCoverageStatus(
  question: PAAQuestion,
  normalizedContent: string
): CoverageStatus {
  const keywords = question.keywords;
  const questionWords = question.question.toLowerCase().split(/\s+/);

  // Check how many keywords appear in content
  const keywordMatches = keywords.filter(kw =>
    normalizedContent.includes(kw.toLowerCase())
  ).length;

  const keywordCoverage = keywords.length > 0
    ? keywordMatches / keywords.length
    : 0;

  // Check if question words appear
  const questionWordMatches = questionWords.filter(word =>
    word.length > 3 && normalizedContent.includes(word)
  ).length;

  const questionCoverage = questionWords.length > 0
    ? questionWordMatches / questionWords.length
    : 0;

  // Combined coverage score
  const totalCoverage = (keywordCoverage * 0.6) + (questionCoverage * 0.4);

  if (totalCoverage >= 0.7) return 'covered';
  if (totalCoverage >= 0.4) return 'partial';

  // Check if it's a high-value opportunity
  if (question.relevanceScore >= 75 && question.difficulty !== 'very-hard') {
    return 'opportunity';
  }

  return 'not-covered';
}

/**
 * Get coverage analysis summary
 */
export function getCoverageAnalysis(questions: PAAQuestion[]): CoverageAnalysis {
  const covered = questions.filter(q => q.coverageStatus === 'covered').length;
  const partial = questions.filter(q => q.coverageStatus === 'partial').length;
  const notCovered = questions.filter(q => q.coverageStatus === 'not-covered').length;
  const opportunities = questions.filter(q => q.coverageStatus === 'opportunity').length;

  const total = questions.length;
  const coveragePercentage = total > 0
    ? Math.round(((covered + partial * 0.5) / total) * 100)
    : 0;

  const opportunityScore = total > 0
    ? Math.round((opportunities / total) * 100)
    : 0;

  return {
    totalQuestions: total,
    covered,
    partial,
    notCovered,
    opportunities,
    coveragePercentage,
    opportunityScore
  };
}

/**
 * Identify top opportunities
 */
export function identifyOpportunities(
  questions: PAAQuestion[],
  limit: number = 10
): PAAOpportunity[] {
  const uncoveredQuestions = questions.filter(
    q => q.coverageStatus === 'not-covered' || q.coverageStatus === 'opportunity'
  );

  // Score each opportunity
  const scored = uncoveredQuestions.map(q => {
    let score = q.relevanceScore;

    // Boost for easier difficulty
    if (q.difficulty === 'easy') score += 20;
    else if (q.difficulty === 'medium') score += 10;

    // Boost for informational/educational intent
    if (q.intent === 'informational' || q.intent === 'educational') {
      score += 10;
    }

    // Boost for featured questions
    if (q.isFeatured) score += 15;

    // Boost for search volume
    if (q.searchVolume && q.searchVolume > 1000) {
      score += 10;
    }

    // Determine reason
    const reasons: string[] = [];
    if (q.difficulty === 'easy') reasons.push('Low competition');
    if (q.relevanceScore >= 80) reasons.push('High relevance');
    if (q.isFeatured) reasons.push('Featured PAA');
    if (q.searchVolume && q.searchVolume > 1000) reasons.push('Good search volume');
    if (q.intent === 'informational') reasons.push('Informational intent');

    return {
      question: q,
      score,
      reason: reasons.join(', ') || 'Untapped topic',
      recommendedFormat: q.answerFormat,
      suggestedSection: generateSuggestedSection(q),
      estimatedWordCount: estimateAnswerWordCount(q)
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate suggested section heading for a question
 */
function generateSuggestedSection(question: PAAQuestion): string {
  const q = question.question;

  // Remove question marks and clean up
  let heading = q.replace(/\?/g, '').trim();

  // Transform "What is X" → "Understanding X"
  heading = heading.replace(/^what is/i, 'Understanding');
  heading = heading.replace(/^how to/i, 'How to');
  heading = heading.replace(/^why (does|is|do|are)/i, 'Why');
  heading = heading.replace(/^when (should|to|do)/i, 'When to');
  heading = heading.replace(/^can you/i, 'How to');

  return heading;
}

/**
 * Estimate word count needed to answer a question
 */
function estimateAnswerWordCount(question: PAAQuestion): number {
  switch (question.answerFormat) {
    case 'paragraph':
      return 100;
    case 'list':
      return 150;
    case 'steps':
      return 200;
    case 'table':
      return 150;
    case 'accordion':
      return 250;
    default:
      return 100;
  }
}

// =============================================================================
// FILTERING & SEARCH
// =============================================================================

/**
 * Filter questions based on filters
 */
export function filterQuestions(
  questions: PAAQuestion[],
  filters: PAAFilters,
  searchQuery: string = ''
): PAAQuestion[] {
  let filtered = [...questions];

  // Text search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(q =>
      q.question.toLowerCase().includes(query) ||
      q.keywords.some(kw => kw.toLowerCase().includes(query)) ||
      q.answerSnippet.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filters.types.length > 0) {
    filtered = filtered.filter(q => filters.types.includes(q.type));
  }

  // Intent filter
  if (filters.intents.length > 0) {
    filtered = filtered.filter(q => filters.intents.includes(q.intent));
  }

  // Coverage status filter
  if (filters.coverageStatus.length > 0) {
    filtered = filtered.filter(q => filters.coverageStatus.includes(q.coverageStatus));
  }

  // Difficulty filter
  if (filters.difficulty.length > 0) {
    filtered = filtered.filter(q => filters.difficulty.includes(q.difficulty));
  }

  // Answer format filter
  if (filters.answerFormats.length > 0) {
    filtered = filtered.filter(q => filters.answerFormats.includes(q.answerFormat));
  }

  // Minimum relevance filter
  if (filters.minRelevance > 0) {
    filtered = filtered.filter(q => q.relevanceScore >= filters.minRelevance);
  }

  // Featured only filter
  if (filters.featuredOnly) {
    filtered = filtered.filter(q => q.isFeatured);
  }

  return filtered;
}

/**
 * Sort questions
 */
export function sortQuestions(
  questions: PAAQuestion[],
  sortBy: 'relevance' | 'position' | 'difficulty' | 'volume' = 'relevance'
): PAAQuestion[] {
  const sorted = [...questions];

  switch (sortBy) {
    case 'relevance':
      return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
    case 'position':
      return sorted.sort((a, b) => a.position - b.position);
    case 'difficulty':
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'very-hard': 4 };
      return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case 'volume':
      return sorted.sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0));
    default:
      return sorted;
  }
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Calculate PAA statistics
 */
export function calculatePAAStatistics(data: PAAData): PAAStatistics {
  const questions = data.questions.flatMap(g => g.questions);

  // Count by type
  const byType: Record<QuestionType, number> = {} as Record<QuestionType, number>;
  questions.forEach(q => {
    byType[q.type] = (byType[q.type] || 0) + 1;
  });

  // Count by intent
  const byIntent: Record<QuestionIntent, number> = {} as Record<QuestionIntent, number>;
  questions.forEach(q => {
    byIntent[q.intent] = (byIntent[q.intent] || 0) + 1;
  });

  // Count by difficulty
  const byDifficulty: Record<PAADifficultyLevel, number> = {} as Record<PAADifficultyLevel, number>;
  questions.forEach(q => {
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
  });

  // Count by coverage
  const byCoverage: Record<CoverageStatus, number> = {} as Record<CoverageStatus, number>;
  questions.forEach(q => {
    byCoverage[q.coverageStatus] = (byCoverage[q.coverageStatus] || 0) + 1;
  });

  // Average relevance
  const avgRelevance = questions.length > 0
    ? Math.round(questions.reduce((sum, q) => sum + q.relevanceScore, 0) / questions.length)
    : 0;

  // Max tree depth
  const maxTreeDepth = Math.max(...questions.map(q => q.depth), 0);

  return {
    total: questions.length,
    byType,
    byIntent,
    byDifficulty,
    byCoverage,
    avgRelevance,
    totalClusters: data.clusters.length,
    maxTreeDepth
  };
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

/**
 * Export questions to Markdown
 */
export function exportToMarkdown(
  questions: PAAQuestion[],
  includeAnswers: boolean = true
): string {
  let markdown = '# People Also Ask Questions\n\n';

  questions.forEach((q, index) => {
    markdown += `## ${index + 1}. ${q.question}\n\n`;

    if (includeAnswers && q.answerSnippet) {
      markdown += `**Answer:** ${q.answerSnippet}\n\n`;
    }

    markdown += `- **Type:** ${q.type}\n`;
    markdown += `- **Intent:** ${q.intent}\n`;
    markdown += `- **Difficulty:** ${q.difficulty}\n`;
    markdown += `- **Relevance:** ${q.relevanceScore}%\n`;

    if (q.searchVolume) {
      markdown += `- **Search Volume:** ${q.searchVolume}\n`;
    }

    markdown += `- **Source:** ${q.sourceDomain}\n\n`;
    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Export questions to CSV
 */
export function exportToCSV(questions: PAAQuestion[]): string {
  const headers = [
    'Question',
    'Type',
    'Intent',
    'Difficulty',
    'Relevance',
    'Search Volume',
    'Coverage',
    'Source',
    'Answer'
  ];

  const rows = questions.map(q => [
    `"${q.question.replace(/"/g, '""')}"`,
    q.type,
    q.intent,
    q.difficulty,
    q.relevanceScore.toString(),
    (q.searchVolume || '').toString(),
    q.coverageStatus,
    q.sourceDomain,
    `"${q.answerSnippet.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export questions to JSON
 */
export function exportToJSON(questions: PAAQuestion[]): string {
  return JSON.stringify(questions, null, 2);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get icon for question type
 */
function getQuestionTypeIcon(type: QuestionType): string {
  const icons: Record<QuestionType, string> = {
    what: '❓',
    how: '🔧',
    why: '💡',
    when: '📅',
    where: '📍',
    who: '👤',
    which: '🔀',
    can: '✅',
    does: '🤔',
    is: '❔',
    are: '❔',
    will: '🔮',
    should: '⚖️',
    comparison: '⚔️',
    list: '📋',
    other: '💭'
  };
  return icons[type] || '💭';
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: QuestionCategory): string {
  const icons: Record<QuestionCategory, string> = {
    basics: '📚',
    'how-to': '🛠️',
    comparison: '⚔️',
    troubleshooting: '🔧',
    features: '✨',
    pricing: '💰',
    alternatives: '🔄',
    reviews: '⭐',
    other: '📁'
  };
  return icons[category] || '📁';
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate related searches (mock)
 */
export function generateRelatedSearches(keyword: string): PAARelatedSearch[] {
  const templates = [
    `${keyword} examples`,
    `${keyword} tutorial`,
    `${keyword} for beginners`,
    `best ${keyword}`,
    `${keyword} alternatives`,
    `${keyword} vs`,
    `how to use ${keyword}`,
    `${keyword} review`,
    `${keyword} pricing`,
    `free ${keyword}`
  ];

  return templates.map((query, index) => ({
    query,
    volume: Math.floor(Math.random() * 3000) + 500,
    relevance: Math.max(50, 100 - index * 5),
    isQuestion: query.startsWith('how to')
  }));
}

/**
 * Main PAA data generation function
 */
export function generatePAAData(
  keyword: string,
  content: string,
  options: Partial<PAAFetchOptions> = {}
): PAAData {
  const mergedOptions = { ...DEFAULT_PAA_OPTIONS, ...options, keyword };

  // Generate mock questions
  let questions = generateMockPAAQuestions(keyword, mergedOptions.maxQuestions);

  // Generate child questions if enabled
  if (mergedOptions.expandChildren) {
    const questionsWithChildren = questions.map(q => {
      if (q.depth < mergedOptions.maxDepth) {
        const children = generateChildQuestions(q, keyword, 2);
        return { ...q, childQuestions: children };
      }
      return q;
    });

    // Flatten children into main list
    const allQuestions = questionsWithChildren.flatMap(q =>
      q.childQuestions ? [q, ...q.childQuestions] : [q]
    );
    questions = allQuestions;
  }

  // Analyze coverage
  questions = analyzeContentCoverage(questions, content);

  // Group by type
  const questionGroups = groupQuestionsByType(questions);

  // Create clusters
  const clusters = clusterQuestionsByTopic(questions, 5);

  // Build tree
  const questionTree = buildQuestionTree(questions);

  // Generate related searches
  const relatedSearches = generateRelatedSearches(keyword);

  return {
    keyword,
    location: mergedOptions.location,
    language: mergedOptions.location.languageCode,
    totalQuestions: questions.length,
    questions: questionGroups,
    clusters,
    relatedSearches,
    questionTree,
    fetchedAt: new Date().toISOString(),
    freshness: 'fresh'
  };
}

