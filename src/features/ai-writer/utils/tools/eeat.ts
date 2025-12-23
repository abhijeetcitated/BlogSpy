/**
 * E-E-A-T Analyzer Utilities
 * 
 * Comprehensive algorithms for analyzing content based on Google's E-E-A-T guidelines:
 * - Expertise analysis with technical depth detection
 * - Experience detection through firsthand language patterns
 * - Authoritativeness scoring via credentials and citations
 * - Trustworthiness assessment through transparency signals
 */

import {
  EEATComponent,
  SignalCategory,
  SignalStrength,
  EEATIssueSeverity,
  EEATIssueType,
  EEATRecommendationPriority,
  TopicSensitivity,
  EEATSignal,
  ComponentAnalysis,
  AuthorInfo,
  ContentMetadata,
  EEATIssue,
  EEATRecommendation,
  EEATMetrics,
  EEATAnalysis,
  EEATSettings,
  DEFAULT_EEAT_SETTINGS,
  TechnicalTerm,
  ExpertiseIndicator,
  ExperienceSignal,
  AuthoritySignal,
  TrustSignal,
  EEAT_COMPONENT_INFO,
  SIGNAL_STRENGTH_INFO,
  EEAT_ISSUE_TYPE_INFO,
  EXPERIENCE_PATTERNS,
  CREDENTIAL_PATTERNS,
  TRUST_INDICATORS,
  YMYL_PATTERNS,
  getGradeFromScore
} from '@/src/features/ai-writer/types/tools/eeat.types';

// ============================================================================
// CONTENT PARSING
// ============================================================================

/**
 * Extract text from HTML content for E-E-A-T analysis
 */
function extractEEATText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract sentences from text
 */
function extractEEATSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 10)
    .map(s => s.trim());
}

/**
 * Calculate word count
 */
export function getWordCount(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// ============================================================================
// YMYL DETECTION
// ============================================================================

/**
 * Detect topic sensitivity (YMYL level)
 */
export function detectTopicSensitivity(content: string): {
  sensitivity: TopicSensitivity;
  categories: string[];
  confidence: number;
} {
  const text = extractEEATText(content).toLowerCase();
  const matchedCategories: Set<string> = new Set();
  let highestSensitivity: TopicSensitivity = 'standard';
  let totalMatches = 0;
  
  for (const { pattern, sensitivity, category } of YMYL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      totalMatches += matches.length;
      matchedCategories.add(category);
      
      // Upgrade sensitivity if higher
      const sensitivityOrder: TopicSensitivity[] = ['standard', 'ymyl_low', 'ymyl_medium', 'ymyl_high'];
      if (sensitivityOrder.indexOf(sensitivity) > sensitivityOrder.indexOf(highestSensitivity)) {
        highestSensitivity = sensitivity;
      }
    }
  }
  
  // Calculate confidence based on match density
  const wordCount = getWordCount(text);
  const confidence = Math.min(100, (totalMatches / wordCount) * 1000);
  
  return {
    sensitivity: highestSensitivity,
    categories: Array.from(matchedCategories),
    confidence
  };
}

// ============================================================================
// EXPERTISE ANALYSIS
// ============================================================================

/**
 * Technical terms database (sample - in production, use comprehensive list)
 */
const TECHNICAL_TERMS_BY_INDUSTRY: Record<string, string[]> = {
  seo: ['serp', 'backlink', 'domain authority', 'crawl budget', 'canonical', 'schema markup', 'core web vitals', 'e-e-a-t', 'topical authority'],
  marketing: ['ctr', 'conversion rate', 'funnel', 'attribution', 'ltv', 'cac', 'roi', 'kpi', 'ab testing', 'segmentation'],
  technology: ['api', 'sdk', 'microservices', 'kubernetes', 'docker', 'ci/cd', 'devops', 'agile', 'scrum'],
  finance: ['roi', 'ebitda', 'p/e ratio', 'market cap', 'liquidity', 'yield', 'portfolio', 'diversification'],
  healthcare: ['diagnosis', 'prognosis', 'etiology', 'pathology', 'pharmacology', 'contraindication', 'adverse effect']
};

/**
 * Detect technical terms in content
 */
export function detectTechnicalTerms(
  content: string,
  industry?: string
): TechnicalTerm[] {
  const text = extractEEATText(content).toLowerCase();
  const terms: TechnicalTerm[] = [];
  
  // Get industry-specific terms
  const industryTerms = industry && TECHNICAL_TERMS_BY_INDUSTRY[industry.toLowerCase()]
    ? TECHNICAL_TERMS_BY_INDUSTRY[industry.toLowerCase()]
    : Object.values(TECHNICAL_TERMS_BY_INDUSTRY).flat();
  
  for (const term of industryTerms) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches && matches.length > 0) {
      // Find context
      const index = text.indexOf(term.toLowerCase());
      const contextStart = Math.max(0, index - 50);
      const contextEnd = Math.min(text.length, index + term.length + 50);
      const context = text.substring(contextStart, contextEnd);
      
      terms.push({
        term,
        frequency: matches.length,
        isIndustrySpecific: true,
        context: `...${context}...`
      });
    }
  }
  
  return terms.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Detect expertise indicators
 */
export function detectExpertiseIndicators(content: string): ExpertiseIndicator[] {
  const text = extractEEATText(content);
  const indicators: ExpertiseIndicator[] = [];
  
  // Technical depth - check for detailed explanations
  const technicalPatterns = [
    { pattern: /\b(because|therefore|consequently|as a result)\b/gi, type: 'technical_depth' as const },
    { pattern: /\b(specifically|particularly|notably|importantly)\b/gi, type: 'nuanced_discussion' as const },
    { pattern: /\b(according to (research|studies|data)|research shows)\b/gi, type: 'methodology' as const },
    { pattern: /\b(industry (standard|best practice)|professional|expert)\b/gi, type: 'industry_knowledge' as const }
  ];
  
  for (const { pattern, type } of technicalPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches.slice(0, 3)) {
        const index = text.indexOf(match);
        const context = text.substring(Math.max(0, index - 30), Math.min(text.length, index + match.length + 30));
        indicators.push({
          type,
          evidence: context,
          score: 70 + Math.random() * 20
        });
      }
    }
  }
  
  return indicators;
}

/**
 * Analyze expertise component
 */
export function analyzeExpertise(
  content: string,
  settings: EEATSettings
): ComponentAnalysis {
  const signals: EEATSignal[] = [];
  let signalId = 0;
  
  // Check technical term usage
  const technicalTerms = detectTechnicalTerms(content, settings.industry);
  const termScore = Math.min(100, technicalTerms.length * 15);
  
  signals.push({
    id: `expertise-${++signalId}`,
    category: 'technical',
    component: 'expertise',
    name: 'Technical Vocabulary',
    description: 'Use of industry-specific terminology',
    strength: termScore >= 70 ? 'strong' : termScore >= 40 ? 'moderate' : termScore > 0 ? 'weak' : 'missing',
    score: termScore,
    weight: 1.0,
    evidence: technicalTerms.slice(0, 5).map(t => `"${t.term}" (${t.frequency}x)`),
    suggestions: termScore < 70 
      ? ['Include more industry-specific terminology', 'Use technical terms to demonstrate knowledge']
      : []
  });
  
  // Check expertise indicators
  const indicators = detectExpertiseIndicators(content);
  const indicatorScore = Math.min(100, indicators.length * 12);
  
  signals.push({
    id: `expertise-${++signalId}`,
    category: 'content',
    component: 'expertise',
    name: 'Expert Language Patterns',
    description: 'Use of language that demonstrates deep understanding',
    strength: indicatorScore >= 70 ? 'strong' : indicatorScore >= 40 ? 'moderate' : indicatorScore > 0 ? 'weak' : 'missing',
    score: indicatorScore,
    weight: 0.9,
    evidence: indicators.slice(0, 3).map(i => i.evidence),
    suggestions: indicatorScore < 70 
      ? ['Provide more detailed explanations', 'Show cause-and-effect relationships']
      : []
  });
  
  // Check content depth (word count as proxy)
  const wordCount = getWordCount(extractEEATText(content));
  const depthScore = Math.min(100, (wordCount / 20));
  
  signals.push({
    id: `expertise-${++signalId}`,
    category: 'content',
    component: 'expertise',
    name: 'Content Depth',
    description: 'Comprehensive coverage of the topic',
    strength: depthScore >= 70 ? 'strong' : depthScore >= 40 ? 'moderate' : depthScore > 0 ? 'weak' : 'missing',
    score: depthScore,
    weight: 0.8,
    evidence: [`${wordCount} words`],
    suggestions: depthScore < 70 
      ? ['Expand on key points', 'Add more detailed explanations', 'Cover subtopics more thoroughly']
      : []
  });
  
  // Check for data/statistics usage
  const statsPattern = /\b(\d+(\.\d+)?%|\d+x|\d+\s*(times|percent|percentage))\b/gi;
  const stats = (content.match(statsPattern) || []);
  const statsScore = Math.min(100, stats.length * 20);
  
  signals.push({
    id: `expertise-${++signalId}`,
    category: 'evidence',
    component: 'expertise',
    name: 'Data & Statistics',
    description: 'Use of quantitative evidence',
    strength: statsScore >= 70 ? 'strong' : statsScore >= 40 ? 'moderate' : statsScore > 0 ? 'weak' : 'missing',
    score: statsScore,
    weight: 0.85,
    evidence: stats.slice(0, 5),
    suggestions: statsScore < 70 
      ? ['Add relevant statistics', 'Include research data', 'Cite specific numbers and percentages']
      : []
  });
  
  // Calculate overall expertise score
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore = signals.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight;
  
  const strongSignals = signals.filter(s => s.strength === 'strong').length;
  const moderateSignals = signals.filter(s => s.strength === 'moderate').length;
  const weakSignals = signals.filter(s => s.strength === 'weak').length;
  const missingSignals = signals.filter(s => s.strength === 'missing').length;
  
  return {
    component: 'expertise',
    score: Math.round(weightedScore),
    grade: getGradeFromScore(weightedScore),
    signals,
    strongSignals,
    moderateSignals,
    weakSignals,
    missingSignals,
    topIssues: [],
    topRecommendations: [],
    summary: `Expertise score: ${Math.round(weightedScore)}/100 with ${strongSignals} strong signals.`
  };
}

// ============================================================================
// EXPERIENCE ANALYSIS
// ============================================================================

/**
 * Detect experience signals in content
 */
export function detectExperienceSignals(content: string): ExperienceSignal[] {
  const text = extractEEATText(content);
  const signals: ExperienceSignal[] = [];
  
  for (const { pattern, type, weight } of EXPERIENCE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches.slice(0, 3)) {
        const index = text.indexOf(match);
        const contextEnd = Math.min(text.length, index + 100);
        const context = text.substring(index, contextEnd);
        
        signals.push({
          type,
          text: context,
          confidence: weight * 100
        });
      }
    }
  }
  
  return signals;
}

/**
 * Analyze experience component
 */
export function analyzeExperience(
  content: string,
  _settings: EEATSettings
): ComponentAnalysis {
  const signals: EEATSignal[] = [];
  let signalId = 0;
  
  // Detect firsthand experience language
  const experienceSignals = detectExperienceSignals(content);
  const firsthandScore = Math.min(100, experienceSignals.filter(s => s.type === 'firsthand_account').length * 25);
  
  signals.push({
    id: `experience-${++signalId}`,
    category: 'content',
    component: 'experience',
    name: 'Firsthand Experience',
    description: 'Language indicating personal experience',
    strength: firsthandScore >= 70 ? 'strong' : firsthandScore >= 40 ? 'moderate' : firsthandScore > 0 ? 'weak' : 'missing',
    score: firsthandScore,
    weight: 1.0,
    evidence: experienceSignals.filter(s => s.type === 'firsthand_account').slice(0, 3).map(s => s.text.substring(0, 80) + '...'),
    suggestions: firsthandScore < 70 
      ? ['Add personal experiences', 'Share what you learned firsthand', 'Include "I tested" or "In my experience" language']
      : []
  });
  
  // Case studies and examples
  const caseStudyScore = Math.min(100, experienceSignals.filter(s => s.type === 'case_study' || s.type === 'personal_example').length * 30);
  
  signals.push({
    id: `experience-${++signalId}`,
    category: 'evidence',
    component: 'experience',
    name: 'Case Studies & Examples',
    description: 'Real-world examples and case studies',
    strength: caseStudyScore >= 70 ? 'strong' : caseStudyScore >= 40 ? 'moderate' : caseStudyScore > 0 ? 'weak' : 'missing',
    score: caseStudyScore,
    weight: 0.95,
    evidence: experienceSignals.filter(s => ['case_study', 'personal_example'].includes(s.type)).slice(0, 3).map(s => s.text.substring(0, 80) + '...'),
    suggestions: caseStudyScore < 70 
      ? ['Add real case studies', 'Include specific examples from experience', 'Share actual results you achieved']
      : []
  });
  
  // Specific outcomes and results
  const outcomeScore = Math.min(100, experienceSignals.filter(s => s.type === 'specific_outcome').length * 35);
  
  signals.push({
    id: `experience-${++signalId}`,
    category: 'evidence',
    component: 'experience',
    name: 'Specific Outcomes',
    description: 'Concrete results and measurable outcomes',
    strength: outcomeScore >= 70 ? 'strong' : outcomeScore >= 40 ? 'moderate' : outcomeScore > 0 ? 'weak' : 'missing',
    score: outcomeScore,
    weight: 0.9,
    evidence: experienceSignals.filter(s => s.type === 'specific_outcome').slice(0, 3).map(s => s.text.substring(0, 80) + '...'),
    suggestions: outcomeScore < 70 
      ? ['Add specific results with numbers', 'Share measurable outcomes', 'Include before/after comparisons']
      : []
  });
  
  // Process details
  const processScore = Math.min(100, experienceSignals.filter(s => s.type === 'process_detail').length * 25);
  
  signals.push({
    id: `experience-${++signalId}`,
    category: 'content',
    component: 'experience',
    name: 'Process Details',
    description: 'Step-by-step processes from experience',
    strength: processScore >= 70 ? 'strong' : processScore >= 40 ? 'moderate' : processScore > 0 ? 'weak' : 'missing',
    score: processScore,
    weight: 0.85,
    evidence: experienceSignals.filter(s => s.type === 'process_detail').slice(0, 3).map(s => s.text.substring(0, 80) + '...'),
    suggestions: processScore < 70 
      ? ['Share your actual process', 'Describe how you do things', 'Include step-by-step guides based on experience']
      : []
  });
  
  // Calculate overall experience score
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore = signals.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight;
  
  return {
    component: 'experience',
    score: Math.round(weightedScore),
    grade: getGradeFromScore(weightedScore),
    signals,
    strongSignals: signals.filter(s => s.strength === 'strong').length,
    moderateSignals: signals.filter(s => s.strength === 'moderate').length,
    weakSignals: signals.filter(s => s.strength === 'weak').length,
    missingSignals: signals.filter(s => s.strength === 'missing').length,
    topIssues: [],
    topRecommendations: [],
    summary: `Experience score: ${Math.round(weightedScore)}/100. ${experienceSignals.length} experience indicators found.`
  };
}

// ============================================================================
// AUTHORITATIVENESS ANALYSIS
// ============================================================================

/**
 * Detect author credentials
 */
export function detectCredentials(content: string, authorInfo?: AuthorInfo): AuthoritySignal[] {
  const signals: AuthoritySignal[] = [];
  const text = extractEEATText(content);
  
  // Check content for credential patterns
  for (const { pattern, type } of CREDENTIAL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches.slice(0, 3)) {
        signals.push({
          type: 'credential',
          description: `${type}: ${match}`,
          verifiable: false
        });
      }
    }
  }
  
  // Add author credentials if provided
  if (authorInfo?.credentials) {
    for (const credential of authorInfo.credentials) {
      signals.push({
        type: 'credential',
        description: credential,
        verifiable: true
      });
    }
  }
  
  return signals;
}

/**
 * Analyze authoritativeness component
 */
export function analyzeAuthoritativeness(
  content: string,
  authorInfo: AuthorInfo,
  contentMetadata: ContentMetadata,
  _settings: EEATSettings
): ComponentAnalysis {
  const signals: EEATSignal[] = [];
  let signalId = 0;
  
  // Author attribution
  const hasAuthor = !!authorInfo.name;
  const authorScore = hasAuthor ? (authorInfo.bio ? 100 : 60) : 0;
  
  signals.push({
    id: `authority-${++signalId}`,
    category: 'author',
    component: 'authoritativeness',
    name: 'Author Attribution',
    description: 'Clear author identification',
    strength: authorScore >= 70 ? 'strong' : authorScore >= 40 ? 'moderate' : authorScore > 0 ? 'weak' : 'missing',
    score: authorScore,
    weight: 1.0,
    evidence: hasAuthor ? [`Author: ${authorInfo.name}`, authorInfo.bio ? 'Has bio' : 'No bio'] : ['No author identified'],
    suggestions: authorScore < 70 
      ? ['Add author name', 'Include author biography', 'Link to author profile']
      : []
  });
  
  // Author credentials
  const credentials = detectCredentials(content, authorInfo);
  const credentialScore = Math.min(100, credentials.length * 20);
  
  signals.push({
    id: `authority-${++signalId}`,
    category: 'credentials',
    component: 'authoritativeness',
    name: 'Author Credentials',
    description: 'Professional qualifications and certifications',
    strength: credentialScore >= 70 ? 'strong' : credentialScore >= 40 ? 'moderate' : credentialScore > 0 ? 'weak' : 'missing',
    score: credentialScore,
    weight: 0.95,
    evidence: credentials.slice(0, 5).map(c => c.description),
    suggestions: credentialScore < 70 
      ? ['Add author credentials', 'Mention relevant certifications', 'Include years of experience']
      : []
  });
  
  // Citations and sources
  const citationScore = contentMetadata.hasCitations 
    ? Math.min(100, contentMetadata.citationCount * 15)
    : 0;
  
  signals.push({
    id: `authority-${++signalId}`,
    category: 'sources',
    component: 'authoritativeness',
    name: 'Source Citations',
    description: 'References to authoritative sources',
    strength: citationScore >= 70 ? 'strong' : citationScore >= 40 ? 'moderate' : citationScore > 0 ? 'weak' : 'missing',
    score: citationScore,
    weight: 0.9,
    evidence: [`${contentMetadata.citationCount} citations found`],
    suggestions: citationScore < 70 
      ? ['Add citations to authoritative sources', 'Link to research and studies', 'Reference industry experts']
      : []
  });
  
  // External validation
  const socialProofScore = (authorInfo.socialProfiles?.length || 0) > 0 ? 70 : 
    (authorInfo.publicationCount || 0) > 0 ? 60 : 20;
  
  signals.push({
    id: `authority-${++signalId}`,
    category: 'engagement',
    component: 'authoritativeness',
    name: 'External Validation',
    description: 'Third-party recognition and social proof',
    strength: socialProofScore >= 70 ? 'strong' : socialProofScore >= 40 ? 'moderate' : socialProofScore > 0 ? 'weak' : 'missing',
    score: socialProofScore,
    weight: 0.75,
    evidence: [
      authorInfo.socialProfiles?.length ? `${authorInfo.socialProfiles.length} social profiles` : 'No social profiles',
      authorInfo.publicationCount ? `${authorInfo.publicationCount} publications` : 'No publications listed'
    ],
    suggestions: socialProofScore < 70 
      ? ['Add social profile links', 'Link to other publications', 'Include testimonials or endorsements']
      : []
  });
  
  // Calculate overall score
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore = signals.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight;
  
  return {
    component: 'authoritativeness',
    score: Math.round(weightedScore),
    grade: getGradeFromScore(weightedScore),
    signals,
    strongSignals: signals.filter(s => s.strength === 'strong').length,
    moderateSignals: signals.filter(s => s.strength === 'moderate').length,
    weakSignals: signals.filter(s => s.strength === 'weak').length,
    missingSignals: signals.filter(s => s.strength === 'missing').length,
    topIssues: [],
    topRecommendations: [],
    summary: `Authoritativeness score: ${Math.round(weightedScore)}/100.`
  };
}

// ============================================================================
// TRUSTWORTHINESS ANALYSIS
// ============================================================================

/**
 * Check trust indicators in content/page
 */
export function checkTrustIndicators(
  content: string,
  contentMetadata: ContentMetadata
): TrustSignal[] {
  const signals: TrustSignal[] = [];
  
  // Citations
  signals.push({
    type: 'citation',
    present: contentMetadata.hasCitations,
    quality: contentMetadata.citationCount >= 5 ? 'strong' : contentMetadata.citationCount >= 2 ? 'moderate' : contentMetadata.citationCount > 0 ? 'weak' : 'missing',
    details: `${contentMetadata.citationCount} citations`
  });
  
  // Publication date
  signals.push({
    type: 'transparency',
    present: !!contentMetadata.publishDate,
    quality: contentMetadata.lastUpdated ? 'strong' : contentMetadata.publishDate ? 'moderate' : 'missing',
    details: contentMetadata.publishDate || 'No date'
  });
  
  // Contact info
  signals.push({
    type: 'contact',
    present: contentMetadata.hasContactInfo,
    quality: contentMetadata.hasContactInfo ? 'strong' : 'missing'
  });
  
  // About section
  signals.push({
    type: 'transparency',
    present: contentMetadata.hasAboutSection,
    quality: contentMetadata.hasAboutSection ? 'strong' : 'missing'
  });
  
  // Disclaimer/disclosure
  signals.push({
    type: 'disclosure',
    present: contentMetadata.hasDisclaimer,
    quality: contentMetadata.hasDisclaimer ? 'strong' : 'weak'
  });
  
  return signals;
}

/**
 * Analyze trustworthiness component
 */
export function analyzeTrustworthiness(
  content: string,
  authorInfo: AuthorInfo,
  contentMetadata: ContentMetadata,
  _settings: EEATSettings
): ComponentAnalysis {
  const signals: EEATSignal[] = [];
  let signalId = 0;
  const trustIndicators = checkTrustIndicators(content, contentMetadata);
  
  // Source citations
  const citationIndicator = trustIndicators.find(t => t.type === 'citation');
  const citationScore = SIGNAL_STRENGTH_INFO[citationIndicator?.quality || 'missing'].score;
  
  signals.push({
    id: `trust-${++signalId}`,
    category: 'sources',
    component: 'trustworthiness',
    name: 'Source Citations',
    description: 'References to verify claims',
    strength: citationIndicator?.quality || 'missing',
    score: citationScore,
    weight: 1.0,
    evidence: [citationIndicator?.details || 'No citations'],
    suggestions: citationScore < 70 
      ? ['Add citations to credible sources', 'Link to original research', 'Reference official sources']
      : []
  });
  
  // Content freshness
  const hasDate = !!contentMetadata.publishDate;
  const isRecent = contentMetadata.lastUpdated 
    ? (Date.now() - new Date(contentMetadata.lastUpdated).getTime()) < 365 * 24 * 60 * 60 * 1000
    : false;
  const freshnessScore = isRecent ? 100 : hasDate ? 60 : 0;
  
  signals.push({
    id: `trust-${++signalId}`,
    category: 'transparency',
    component: 'trustworthiness',
    name: 'Content Freshness',
    description: 'Publication and update dates',
    strength: freshnessScore >= 70 ? 'strong' : freshnessScore >= 40 ? 'moderate' : freshnessScore > 0 ? 'weak' : 'missing',
    score: freshnessScore,
    weight: 0.85,
    evidence: [
      contentMetadata.publishDate ? `Published: ${contentMetadata.publishDate}` : 'No publish date',
      contentMetadata.lastUpdated ? `Updated: ${contentMetadata.lastUpdated}` : 'No update date'
    ],
    suggestions: freshnessScore < 70 
      ? ['Add publication date', 'Show last updated date', 'Keep content fresh']
      : []
  });
  
  // Transparency signals
  const transparencyScore = [
    contentMetadata.hasAboutSection ? 30 : 0,
    contentMetadata.hasContactInfo ? 30 : 0,
    contentMetadata.hasPrivacyPolicy ? 20 : 0,
    contentMetadata.hasDisclaimer ? 20 : 0
  ].reduce((a, b) => a + b, 0);
  
  signals.push({
    id: `trust-${++signalId}`,
    category: 'transparency',
    component: 'trustworthiness',
    name: 'Site Transparency',
    description: 'About, contact, and policy information',
    strength: transparencyScore >= 70 ? 'strong' : transparencyScore >= 40 ? 'moderate' : transparencyScore > 0 ? 'weak' : 'missing',
    score: transparencyScore,
    weight: 0.8,
    evidence: [
      contentMetadata.hasAboutSection ? 'âœ“ About section' : 'âœ— No about section',
      contentMetadata.hasContactInfo ? 'âœ“ Contact info' : 'âœ— No contact info',
      contentMetadata.hasDisclaimer ? 'âœ“ Disclaimers' : 'âœ— No disclaimers'
    ],
    suggestions: transparencyScore < 70 
      ? ['Add about page/section', 'Include contact information', 'Add disclosure statements']
      : []
  });
  
  // Author verification
  const authorVerificationScore = authorInfo.name 
    ? (authorInfo.isVerified ? 100 : authorInfo.bio ? 70 : 40)
    : 0;
  
  signals.push({
    id: `trust-${++signalId}`,
    category: 'author',
    component: 'trustworthiness',
    name: 'Author Verification',
    description: 'Verifiable author identity',
    strength: authorVerificationScore >= 70 ? 'strong' : authorVerificationScore >= 40 ? 'moderate' : authorVerificationScore > 0 ? 'weak' : 'missing',
    score: authorVerificationScore,
    weight: 0.9,
    evidence: [
      authorInfo.name ? `Author: ${authorInfo.name}` : 'No author',
      authorInfo.isVerified ? 'Verified' : 'Not verified'
    ],
    suggestions: authorVerificationScore < 70 
      ? ['Add author name', 'Include author bio', 'Link to author credentials']
      : []
  });
  
  // Factual accuracy (check for hedging language that suggests uncertainty)
  const hedgingPatterns = /\b(might|maybe|possibly|could be|some say|allegedly|reportedly)\b/gi;
  const hedgingMatches = content.match(hedgingPatterns) || [];
  const accuracyScore = Math.max(0, 100 - hedgingMatches.length * 10);
  
  signals.push({
    id: `trust-${++signalId}`,
    category: 'content',
    component: 'trustworthiness',
    name: 'Claim Confidence',
    description: 'Clear, definitive statements',
    strength: accuracyScore >= 70 ? 'strong' : accuracyScore >= 40 ? 'moderate' : accuracyScore > 0 ? 'weak' : 'missing',
    score: accuracyScore,
    weight: 0.7,
    evidence: hedgingMatches.length > 0 
      ? [`${hedgingMatches.length} hedging phrases found`]
      : ['Clear, confident language'],
    suggestions: accuracyScore < 70 
      ? ['Use more definitive language', 'Back up claims with evidence', 'Remove unnecessary hedging']
      : []
  });
  
  // Calculate overall score
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore = signals.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight;
  
  return {
    component: 'trustworthiness',
    score: Math.round(weightedScore),
    grade: getGradeFromScore(weightedScore),
    signals,
    strongSignals: signals.filter(s => s.strength === 'strong').length,
    moderateSignals: signals.filter(s => s.strength === 'moderate').length,
    weakSignals: signals.filter(s => s.strength === 'weak').length,
    missingSignals: signals.filter(s => s.strength === 'missing').length,
    topIssues: [],
    topRecommendations: [],
    summary: `Trustworthiness score: ${Math.round(weightedScore)}/100.`
  };
}

// ============================================================================
// ISSUE GENERATION
// ============================================================================

/**
 * Generate E-E-A-T issues based on analysis
 */
export function generateEEATIssues(
  expertise: ComponentAnalysis,
  experience: ComponentAnalysis,
  authoritativeness: ComponentAnalysis,
  trustworthiness: ComponentAnalysis,
  _settings: EEATSettings
): EEATIssue[] {
  const issues: EEATIssue[] = [];
  let issueId = 0;
  
  // Check each component for weak/missing signals
  const allAnalyses = [expertise, experience, authoritativeness, trustworthiness];
  
  for (const analysis of allAnalyses) {
    for (const signal of analysis.signals) {
      if (signal.strength === 'missing' || signal.strength === 'weak') {
        const issueType = mapSignalToIssueType(signal);
        if (issueType) {
          const typeInfo = EEAT_ISSUE_TYPE_INFO[issueType];
          issues.push({
            id: `issue-${++issueId}`,
            type: issueType,
            severity: signal.strength === 'missing' ? typeInfo.severity : 'suggestion',
            component: signal.component,
            title: typeInfo.label,
            description: typeInfo.description,
            impact: typeInfo.impact,
            location: signal.location,
            fixSuggestion: signal.suggestions[0] || 'Improve this signal'
          });
        }
      }
    }
  }
  
  // Sort by severity
  const severityOrder: EEATIssueSeverity[] = ['critical', 'warning', 'suggestion'];
  issues.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
  
  return issues;
}

/**
 * Map signal to issue type
 */
function mapSignalToIssueType(signal: EEATSignal): EEATIssueType | null {
  const mappings: Record<string, EEATIssueType> = {
    'Author Attribution': 'missing_author_bio',
    'Author Credentials': 'no_credentials',
    'Firsthand Experience': 'missing_experience',
    'Source Citations': 'no_citations',
    'Content Freshness': 'outdated_content',
    'Technical Vocabulary': 'missing_expertise_signals',
    'Content Depth': 'thin_content',
    'Site Transparency': 'poor_transparency',
    'Data & Statistics': 'vague_claims',
    'Claim Confidence': 'vague_claims'
  };
  
  return mappings[signal.name] || null;
}

// ============================================================================
// RECOMMENDATION GENERATION
// ============================================================================

/**
 * Generate E-E-A-T recommendations
 */
export function generateEEATRecommendations(
  metrics: EEATMetrics,
  issues: EEATIssue[],
  _settings: EEATSettings
): EEATRecommendation[] {
  const recommendations: EEATRecommendation[] = [];
  let recId = 0;
  
  // Critical issues first
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  for (const issue of criticalIssues) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'critical',
      component: issue.component,
      title: `Fix: ${issue.title}`,
      description: issue.description,
      action: issue.fixSuggestion,
      expectedImpact: `Addressing this critical issue will significantly improve ${issue.component} score.`,
      effort: 'medium'
    });
  }
  
  // Component-specific recommendations
  if (metrics.expertiseScore < 60) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      component: 'expertise',
      title: 'Improve Expertise Signals',
      description: 'Content lacks clear expertise indicators.',
      action: 'Add technical terminology, detailed explanations, and data-backed claims.',
      expectedImpact: 'Could improve expertise score by 20-30 points.',
      effort: 'medium',
      examples: [
        'Use industry-specific terms naturally',
        'Explain complex concepts in depth',
        'Include statistics and research references'
      ]
    });
  }
  
  if (metrics.experienceScore < 60) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      component: 'experience',
      title: 'Add Firsthand Experience',
      description: 'Content lacks personal/practical experience signals.',
      action: 'Share personal experiences, case studies, and specific outcomes.',
      expectedImpact: 'Could improve experience score by 25-35 points.',
      effort: 'medium',
      examples: [
        'Add "In my experience..." statements',
        'Include real case studies with results',
        'Share specific outcomes with numbers'
      ]
    });
  }
  
  if (metrics.authoritativenessScore < 60) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      component: 'authoritativeness',
      title: 'Build Authority Signals',
      description: 'Author credentials and reputation not established.',
      action: 'Add author bio with credentials, link to external validation.',
      expectedImpact: 'Could improve authoritativeness score by 20-40 points.',
      effort: 'low',
      examples: [
        'Add detailed author bio',
        'List relevant credentials and certifications',
        'Link to other publications or features'
      ]
    });
  }
  
  if (metrics.trustworthinessScore < 60) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      component: 'trustworthiness',
      title: 'Enhance Trust Signals',
      description: 'Content lacks transparency and verification.',
      action: 'Add citations, dates, contact info, and disclosures.',
      expectedImpact: 'Could improve trustworthiness score by 25-35 points.',
      effort: 'low',
      examples: [
        'Add publication and update dates',
        'Include contact information',
        'Add disclosure statements where relevant'
      ]
    });
  }
  
  // Quick wins
  const quickWins: EEATRecommendation[] = [];
  
  if (!issues.some(i => i.type === 'missing_date')) {
    quickWins.push({
      id: `rec-${++recId}`,
      priority: 'low',
      component: 'trustworthiness',
      title: 'Add Publication Date',
      description: 'Show when content was created and last updated.',
      action: 'Add visible publish date and "last updated" timestamp.',
      expectedImpact: 'Quick trust signal boost.',
      effort: 'low',
      timeEstimate: '5 minutes'
    });
  }
  
  // Sort by priority
  const priorityOrder: EEATRecommendationPriority[] = ['critical', 'high', 'medium', 'low'];
  recommendations.sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  
  return recommendations;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Calculate overall E-E-A-T metrics
 */
export function calculateEEATMetrics(
  expertise: ComponentAnalysis,
  experience: ComponentAnalysis,
  authoritativeness: ComponentAnalysis,
  trustworthiness: ComponentAnalysis,
  topicSensitivity: TopicSensitivity,
  settings: EEATSettings
): EEATMetrics {
  // Calculate weighted overall score
  const overallScore = 
    (expertise.score * settings.expertiseWeight) +
    (experience.score * settings.experienceWeight) +
    (authoritativeness.score * settings.authoritativenessWeight) +
    (trustworthiness.score * settings.trustworthinessWeight);
  
  // Count all signals
  const allSignals = [
    ...expertise.signals,
    ...experience.signals,
    ...authoritativeness.signals,
    ...trustworthiness.signals
  ];
  
  // YMYL adjusted score
  const ymylMultiplier = {
    ymyl_high: 0.9,
    ymyl_medium: 0.95,
    ymyl_low: 0.98,
    standard: 1.0
  }[topicSensitivity];
  
  const ymylAdjustedScore = overallScore * ymylMultiplier;
  
  return {
    overallScore: Math.round(overallScore),
    overallGrade: getGradeFromScore(overallScore),
    expertiseScore: expertise.score,
    experienceScore: experience.score,
    authoritativenessScore: authoritativeness.score,
    trustworthinessScore: trustworthiness.score,
    
    totalSignals: allSignals.length,
    strongSignals: allSignals.filter(s => s.strength === 'strong').length,
    moderateSignals: allSignals.filter(s => s.strength === 'moderate').length,
    weakSignals: allSignals.filter(s => s.strength === 'weak').length,
    missingSignals: allSignals.filter(s => s.strength === 'missing').length,
    
    criticalIssues: 0, // Will be calculated after issues generation
    warningIssues: 0,
    suggestionIssues: 0,
    
    topicSensitivity,
    ymylAdjustedScore: Math.round(ymylAdjustedScore)
  };
}

/**
 * Extract content metadata
 */
export function extractContentMetadata(content: string): ContentMetadata {
  const text = extractEEATText(content);
  const wordCount = getWordCount(text);
  
  // Check for citations (links or references)
  const linkPattern = /<a\s+[^>]*href\s*=\s*["'][^"']+["'][^>]*>/gi;
  const links = content.match(linkPattern) || [];
  
  // Check for images
  const imagePattern = /<img\s+[^>]*>/gi;
  const images = content.match(imagePattern) || [];
  
  return {
    wordCount,
    readingTime: Math.ceil(wordCount / 200),
    hasStructuredData: content.includes('application/ld+json'),
    hasCitations: links.length > 0,
    citationCount: links.length,
    hasImages: images.length > 0,
    imageCount: images.length,
    hasVideo: content.includes('<video') || content.includes('youtube') || content.includes('vimeo'),
    hasContactInfo: /\b(contact|email|phone|call us)\b/i.test(content),
    hasAboutSection: /\b(about us|about the author|who we are)\b/i.test(content),
    hasPrivacyPolicy: /\b(privacy policy|privacy)\b/i.test(content),
    hasDisclaimer: /\b(disclaimer|disclosure|affiliate|sponsored)\b/i.test(content)
  };
}

/**
 * Main E-E-A-T analysis function
 */
export function analyzeEEAT(
  content: string,
  authorInfo: AuthorInfo = {},
  settings: EEATSettings = DEFAULT_EEAT_SETTINGS
): EEATAnalysis {
  // Extract content metadata
  const contentMetadata = extractContentMetadata(content);
  
  // Detect topic sensitivity
  const { sensitivity: topicSensitivity } = settings.autoDetectYMYL 
    ? detectTopicSensitivity(content)
    : { sensitivity: settings.defaultSensitivity };
  
  // Analyze each component
  const expertise = analyzeExpertise(content, settings);
  const experience = analyzeExperience(content, settings);
  const authoritativeness = analyzeAuthoritativeness(content, authorInfo, contentMetadata, settings);
  const trustworthiness = analyzeTrustworthiness(content, authorInfo, contentMetadata, settings);
  
  // Calculate metrics
  const metrics = calculateEEATMetrics(
    expertise,
    experience,
    authoritativeness,
    trustworthiness,
    topicSensitivity,
    settings
  );
  
  // Generate issues
  const issues = generateEEATIssues(expertise, experience, authoritativeness, trustworthiness, settings);
  
  // Update metrics with issue counts
  metrics.criticalIssues = issues.filter(i => i.severity === 'critical').length;
  metrics.warningIssues = issues.filter(i => i.severity === 'warning').length;
  metrics.suggestionIssues = issues.filter(i => i.severity === 'suggestion').length;
  
  // Generate recommendations
  const recommendations = generateEEATRecommendations(metrics, issues, settings);
  
  // Collect all signals
  const allSignals = [
    ...expertise.signals,
    ...experience.signals,
    ...authoritativeness.signals,
    ...trustworthiness.signals
  ];
  
  // Quick wins
  const quickWins = recommendations.filter(r => r.effort === 'low' && r.priority !== 'critical');
  
  // Generate summary
  const summary = generateEEATSummary(metrics, issues);
  
  return {
    id: `eeat-analysis-${Date.now()}`,
    contentId: '',
    analyzedAt: new Date().toISOString(),
    
    metrics,
    
    expertise,
    experience,
    authoritativeness,
    trustworthiness,
    
    signals: allSignals,
    issues,
    recommendations,
    
    authorInfo,
    contentMetadata,
    
    summary,
    quickWins
  };
}

/**
 * Generate analysis summary
 */
function generateEEATSummary(metrics: EEATMetrics, issues: EEATIssue[]): string {
  const grade = metrics.overallGrade;
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  
  if (grade === 'A') {
    return `Excellent E-E-A-T score of ${metrics.overallScore}/100. Content demonstrates strong expertise, experience, authority, and trustworthiness.`;
  } else if (grade === 'B') {
    return `Good E-E-A-T score of ${metrics.overallScore}/100. Content has solid foundations with room for improvement in some areas.`;
  } else if (grade === 'C') {
    return `Average E-E-A-T score of ${metrics.overallScore}/100. Content needs improvement in several key areas to meet quality guidelines.`;
  } else if (criticalCount > 0) {
    return `E-E-A-T score of ${metrics.overallScore}/100 with ${criticalCount} critical issues. Immediate attention needed to improve content quality.`;
  } else {
    return `Low E-E-A-T score of ${metrics.overallScore}/100. Significant improvements needed across expertise, experience, authority, and trust signals.`;
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export E-E-A-T analysis report
 */
export function exportEEATReport(
  analysis: EEATAnalysis,
  format: 'json' | 'csv' | 'markdown' = 'markdown'
): string {
  if (format === 'json') {
    return JSON.stringify(analysis, null, 2);
  }
  
  if (format === 'csv') {
    const rows = [
      ['Metric', 'Value', 'Grade'],
      ['Overall Score', analysis.metrics.overallScore.toString(), analysis.metrics.overallGrade],
      ['Expertise', analysis.metrics.expertiseScore.toString(), analysis.expertise.grade],
      ['Experience', analysis.metrics.experienceScore.toString(), analysis.experience.grade],
      ['Authoritativeness', analysis.metrics.authoritativenessScore.toString(), analysis.authoritativeness.grade],
      ['Trustworthiness', analysis.metrics.trustworthinessScore.toString(), analysis.trustworthiness.grade],
      ['', '', ''],
      ['Issue Type', 'Count', ''],
      ['Critical Issues', analysis.metrics.criticalIssues.toString(), ''],
      ['Warning Issues', analysis.metrics.warningIssues.toString(), ''],
      ['Suggestions', analysis.metrics.suggestionIssues.toString(), '']
    ];
    return rows.map(row => row.join(',')).join('\n');
  }
  
  // Markdown format
  return `# E-E-A-T Analysis Report

## Overall Score: ${analysis.metrics.overallScore}/100 (${analysis.metrics.overallGrade})

${analysis.summary}

## Component Scores

| Component | Score | Grade |
|-----------|-------|-------|
| Expertise | ${analysis.metrics.expertiseScore} | ${analysis.expertise.grade} |
| Experience | ${analysis.metrics.experienceScore} | ${analysis.experience.grade} |
| Authoritativeness | ${analysis.metrics.authoritativenessScore} | ${analysis.authoritativeness.grade} |
| Trustworthiness | ${analysis.metrics.trustworthinessScore} | ${analysis.trustworthiness.grade} |

## Issues Found

- **Critical:** ${analysis.metrics.criticalIssues}
- **Warnings:** ${analysis.metrics.warningIssues}
- **Suggestions:** ${analysis.metrics.suggestionIssues}

## Top Recommendations

${analysis.recommendations.slice(0, 5).map((r, i) => `${i + 1}. **${r.title}** (${r.priority})\n   ${r.action}`).join('\n\n')}

---
*Generated: ${analysis.analyzedAt}*
`;
}

