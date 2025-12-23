/**
 * E-E-A-T Analyzer Types
 * 
 * Comprehensive types for analyzing content based on Google's E-E-A-T quality guidelines:
 * - Expertise: Demonstrates topic knowledge
 * - Experience: Shows firsthand experience
 * - Authoritativeness: Establishes credibility
 * - Trustworthiness: Builds reader confidence
 */

// ============================================================================
// CORE ENUMS & CONSTANTS
// ============================================================================

/**
 * E-E-A-T component types
 */
export type EEATComponent = 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness';

/**
 * E-E-A-T signal categories
 */
export type SignalCategory = 
  | 'author' 
  | 'content' 
  | 'sources' 
  | 'technical' 
  | 'engagement'
  | 'transparency'
  | 'credentials'
  | 'evidence';

/**
 * Signal strength levels
 */
export type SignalStrength = 'strong' | 'moderate' | 'weak' | 'missing';

/**
 * Issue severity for E-E-A-T issues
 */
export type EEATIssueSeverity = 'critical' | 'warning' | 'suggestion';

/**
 * Issue types
 */
export type EEATIssueType = 
  | 'missing_author_bio'
  | 'no_credentials'
  | 'missing_experience'
  | 'weak_sources'
  | 'no_citations'
  | 'outdated_content'
  | 'missing_date'
  | 'no_contact_info'
  | 'vague_claims'
  | 'missing_evidence'
  | 'no_social_proof'
  | 'poor_transparency'
  | 'thin_content'
  | 'missing_expertise_signals'
  | 'generic_language';

/**
 * E-E-A-T Recommendation priority
 */
export type EEATRecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Topic sensitivity levels (YMYL - Your Money Your Life)
 */
export type TopicSensitivity = 'ymyl_high' | 'ymyl_medium' | 'ymyl_low' | 'standard';

/**
 * E-E-A-T analyzer tabs
 */
export type EEATTab = 'overview' | 'expertise' | 'experience' | 'authority' | 'trust' | 'recommendations' | 'settings';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * E-E-A-T component information
 */
export const EEAT_COMPONENT_INFO: Record<EEATComponent, {
  label: string;
  description: string;
  icon: string;
  color: string;
  weight: number;
}> = {
  expertise: {
    label: 'Expertise',
    description: 'Demonstrates deep knowledge and understanding of the topic',
    icon: 'GraduationCap',
    color: 'blue',
    weight: 0.25
  },
  experience: {
    label: 'Experience',
    description: 'Shows firsthand or real-world experience with the subject',
    icon: 'Briefcase',
    color: 'green',
    weight: 0.25
  },
  authoritativeness: {
    label: 'Authoritativeness',
    description: 'Establishes credibility through credentials and reputation',
    icon: 'Award',
    color: 'purple',
    weight: 0.25
  },
  trustworthiness: {
    label: 'Trustworthiness',
    description: 'Builds confidence through transparency and accuracy',
    icon: 'Shield',
    color: 'amber',
    weight: 0.25
  }
};

/**
 * Signal category information
 */
export const SIGNAL_CATEGORY_INFO: Record<SignalCategory, {
  label: string;
  description: string;
  icon: string;
  relevantComponents: EEATComponent[];
}> = {
  author: {
    label: 'Author Signals',
    description: 'Signals related to author identity and background',
    icon: 'User',
    relevantComponents: ['expertise', 'authoritativeness', 'trustworthiness']
  },
  content: {
    label: 'Content Quality',
    description: 'Signals from content depth and quality',
    icon: 'FileText',
    relevantComponents: ['expertise', 'experience']
  },
  sources: {
    label: 'Source Quality',
    description: 'Signals from citations and references',
    icon: 'Link',
    relevantComponents: ['expertise', 'authoritativeness', 'trustworthiness']
  },
  technical: {
    label: 'Technical Accuracy',
    description: 'Signals from technical correctness',
    icon: 'CheckCircle',
    relevantComponents: ['expertise', 'authoritativeness']
  },
  engagement: {
    label: 'Engagement Signals',
    description: 'Signals from user interaction and feedback',
    icon: 'MessageCircle',
    relevantComponents: ['authoritativeness', 'trustworthiness']
  },
  transparency: {
    label: 'Transparency',
    description: 'Signals from disclosure and openness',
    icon: 'Eye',
    relevantComponents: ['trustworthiness']
  },
  credentials: {
    label: 'Credentials',
    description: 'Signals from qualifications and certifications',
    icon: 'BadgeCheck',
    relevantComponents: ['expertise', 'authoritativeness']
  },
  evidence: {
    label: 'Evidence & Proof',
    description: 'Signals from data, examples, and proof points',
    icon: 'BarChart',
    relevantComponents: ['expertise', 'experience', 'trustworthiness']
  }
};

/**
 * Signal strength information
 */
export const SIGNAL_STRENGTH_INFO: Record<SignalStrength, {
  label: string;
  color: string;
  score: number;
}> = {
  strong: {
    label: 'Strong',
    color: 'green',
    score: 100
  },
  moderate: {
    label: 'Moderate',
    color: 'yellow',
    score: 60
  },
  weak: {
    label: 'Weak',
    color: 'orange',
    score: 30
  },
  missing: {
    label: 'Missing',
    color: 'red',
    score: 0
  }
};

/**
 * Issue type information
 */
export const EEAT_ISSUE_TYPE_INFO: Record<EEATIssueType, {
  label: string;
  description: string;
  severity: EEATIssueSeverity;
  component: EEATComponent;
  impact: string;
}> = {
  missing_author_bio: {
    label: 'Missing Author Bio',
    description: 'No author biography or information provided',
    severity: 'critical',
    component: 'authoritativeness',
    impact: 'Readers cannot verify author credibility'
  },
  no_credentials: {
    label: 'No Credentials Mentioned',
    description: 'Author qualifications not mentioned',
    severity: 'warning',
    component: 'expertise',
    impact: 'Cannot establish subject matter expertise'
  },
  missing_experience: {
    label: 'No Experience Demonstrated',
    description: 'No firsthand experience shown',
    severity: 'warning',
    component: 'experience',
    impact: 'Content may seem theoretical rather than practical'
  },
  weak_sources: {
    label: 'Weak Source Quality',
    description: 'Sources lack authority or credibility',
    severity: 'warning',
    component: 'trustworthiness',
    impact: 'Claims not properly supported'
  },
  no_citations: {
    label: 'No Citations',
    description: 'No references or citations provided',
    severity: 'critical',
    component: 'trustworthiness',
    impact: 'Claims cannot be verified'
  },
  outdated_content: {
    label: 'Outdated Content',
    description: 'Content may be outdated or stale',
    severity: 'warning',
    component: 'trustworthiness',
    impact: 'Information may no longer be accurate'
  },
  missing_date: {
    label: 'Missing Publication Date',
    description: 'No publish or update date shown',
    severity: 'warning',
    component: 'trustworthiness',
    impact: 'Readers cannot assess content freshness'
  },
  no_contact_info: {
    label: 'No Contact Information',
    description: 'No way to contact author or site',
    severity: 'suggestion',
    component: 'trustworthiness',
    impact: 'Reduces perceived accountability'
  },
  vague_claims: {
    label: 'Vague Claims',
    description: 'Claims lack specificity or evidence',
    severity: 'warning',
    component: 'expertise',
    impact: 'Content appears less authoritative'
  },
  missing_evidence: {
    label: 'Missing Evidence',
    description: 'Assertions without supporting data',
    severity: 'warning',
    component: 'trustworthiness',
    impact: 'Claims cannot be verified'
  },
  no_social_proof: {
    label: 'No Social Proof',
    description: 'No testimonials, reviews, or endorsements',
    severity: 'suggestion',
    component: 'authoritativeness',
    impact: 'Missing third-party validation'
  },
  poor_transparency: {
    label: 'Poor Transparency',
    description: 'Lack of disclosure or about information',
    severity: 'warning',
    component: 'trustworthiness',
    impact: 'Readers may question motives'
  },
  thin_content: {
    label: 'Thin Content',
    description: 'Content lacks depth or substance',
    severity: 'critical',
    component: 'expertise',
    impact: 'Appears to lack real expertise'
  },
  missing_expertise_signals: {
    label: 'Missing Expertise Signals',
    description: 'No technical terms or industry knowledge shown',
    severity: 'warning',
    component: 'expertise',
    impact: 'Content may seem amateur'
  },
  generic_language: {
    label: 'Generic Language',
    description: 'Content uses vague, generic terms',
    severity: 'suggestion',
    component: 'expertise',
    impact: 'Does not demonstrate deep knowledge'
  }
};

/**
 * Topic sensitivity information
 */
export const TOPIC_SENSITIVITY_INFO: Record<TopicSensitivity, {
  label: string;
  description: string;
  eeatWeight: number;
  examples: string[];
}> = {
  ymyl_high: {
    label: 'High YMYL',
    description: 'Content that could significantly impact health, finances, or safety',
    eeatWeight: 1.5,
    examples: ['Medical advice', 'Financial planning', 'Legal guidance', 'Safety information']
  },
  ymyl_medium: {
    label: 'Medium YMYL',
    description: 'Content with moderate impact on important life decisions',
    eeatWeight: 1.25,
    examples: ['Product reviews', 'Educational content', 'Career advice']
  },
  ymyl_low: {
    label: 'Low YMYL',
    description: 'Content with minor impact on decisions',
    eeatWeight: 1.1,
    examples: ['Entertainment', 'Hobbies', 'General interest']
  },
  standard: {
    label: 'Standard',
    description: 'General content with minimal YMYL concerns',
    eeatWeight: 1.0,
    examples: ['News', 'Lifestyle', 'Culture']
  }
};

/**
 * E-E-A-T tabs configuration
 */
export const EEAT_TABS: { id: EEATTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'expertise', label: 'Expertise', icon: 'GraduationCap' },
  { id: 'experience', label: 'Experience', icon: 'Briefcase' },
  { id: 'authority', label: 'Authority', icon: 'Award' },
  { id: 'trust', label: 'Trust', icon: 'Shield' },
  { id: 'recommendations', label: 'Actions', icon: 'Lightbulb' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Individual E-E-A-T signal
 */
export interface EEATSignal {
  id: string;
  category: SignalCategory;
  component: EEATComponent;
  name: string;
  description: string;
  strength: SignalStrength;
  score: number; // 0-100
  weight: number; // Importance weight
  evidence: string[]; // Examples found in content
  suggestions: string[]; // How to improve
  location?: {
    start: number;
    end: number;
    text: string;
  };
}

/**
 * Component analysis (E, E, A, or T)
 */
export interface ComponentAnalysis {
  component: EEATComponent;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  signals: EEATSignal[];
  strongSignals: number;
  moderateSignals: number;
  weakSignals: number;
  missingSignals: number;
  topIssues: EEATIssue[];
  topRecommendations: EEATRecommendation[];
  summary: string;
}

/**
 * Author information for E-E-A-T analysis
 */
export interface AuthorInfo {
  name?: string;
  bio?: string;
  credentials?: string[];
  experience?: string[];
  socialProfiles?: string[];
  expertise?: string[];
  hasPhoto?: boolean;
  isVerified?: boolean;
  publicationCount?: number;
  yearsExperience?: number;
}

/**
 * Content metadata
 */
export interface ContentMetadata {
  publishDate?: string;
  lastUpdated?: string;
  wordCount: number;
  readingTime: number;
  hasStructuredData: boolean;
  hasCitations: boolean;
  citationCount: number;
  hasImages: boolean;
  imageCount: number;
  hasVideo: boolean;
  hasContactInfo: boolean;
  hasAboutSection: boolean;
  hasPrivacyPolicy: boolean;
  hasDisclaimer: boolean;
}

/**
 * E-E-A-T issue
 */
export interface EEATIssue {
  id: string;
  type: EEATIssueType;
  severity: EEATIssueSeverity;
  component: EEATComponent;
  title: string;
  description: string;
  impact: string;
  location?: {
    start: number;
    end: number;
    text: string;
  };
  fixSuggestion: string;
}

/**
 * E-E-A-T recommendation
 */
export interface EEATRecommendation {
  id: string;
  priority: EEATRecommendationPriority;
  component: EEATComponent;
  title: string;
  description: string;
  action: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeEstimate?: string;
  examples?: string[];
}

/**
 * E-E-A-T metrics
 */
export interface EEATMetrics {
  overallScore: number; // 0-100
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  expertiseScore: number;
  experienceScore: number;
  authoritativenessScore: number;
  trustworthinessScore: number;
  
  // Signal counts
  totalSignals: number;
  strongSignals: number;
  moderateSignals: number;
  weakSignals: number;
  missingSignals: number;
  
  // Issues
  criticalIssues: number;
  warningIssues: number;
  suggestionIssues: number;
  
  // YMYL assessment
  topicSensitivity: TopicSensitivity;
  ymylAdjustedScore: number;
  
  // Benchmarks
  industryBenchmark?: number;
  competitorAverage?: number;
}

/**
 * Full E-E-A-T analysis result
 */
export interface EEATAnalysis {
  id: string;
  contentId: string;
  analyzedAt: string;
  
  // Scores
  metrics: EEATMetrics;
  
  // Component breakdowns
  expertise: ComponentAnalysis;
  experience: ComponentAnalysis;
  authoritativeness: ComponentAnalysis;
  trustworthiness: ComponentAnalysis;
  
  // Signals
  signals: EEATSignal[];
  
  // Issues
  issues: EEATIssue[];
  
  // Recommendations
  recommendations: EEATRecommendation[];
  
  // Metadata
  authorInfo: AuthorInfo;
  contentMetadata: ContentMetadata;
  
  // Competitive context
  competitorScores?: {
    url: string;
    score: number;
    grade: string;
  }[];
  
  // Summary
  summary: string;
  quickWins: EEATRecommendation[];
}

/**
 * E-E-A-T analyzer settings
 */
export interface EEATSettings {
  // Analysis scope
  analyzeAuthor: boolean;
  analyzeContent: boolean;
  analyzeSources: boolean;
  analyzeMetadata: boolean;
  
  // YMYL settings
  autoDetectYMYL: boolean;
  defaultSensitivity: TopicSensitivity;
  
  // Component weights (should sum to 1)
  expertiseWeight: number;
  experienceWeight: number;
  authoritativenessWeight: number;
  trustworthinessWeight: number;
  
  // Thresholds
  minimumScore: number; // Target minimum score
  criticalIssueThreshold: number;
  
  // Display
  showDetailedSignals: boolean;
  showCompetitorComparison: boolean;
  highlightIssuesInEditor: boolean;
  
  // Industry
  industry?: string;
  contentType?: 'blog' | 'article' | 'product' | 'service' | 'news' | 'other';
}

/**
 * Default E-E-A-T settings
 */
export const DEFAULT_EEAT_SETTINGS: EEATSettings = {
  analyzeAuthor: true,
  analyzeContent: true,
  analyzeSources: true,
  analyzeMetadata: true,
  
  autoDetectYMYL: true,
  defaultSensitivity: 'standard',
  
  expertiseWeight: 0.25,
  experienceWeight: 0.25,
  authoritativenessWeight: 0.25,
  trustworthinessWeight: 0.25,
  
  minimumScore: 70,
  criticalIssueThreshold: 50,
  
  showDetailedSignals: true,
  showCompetitorComparison: true,
  highlightIssuesInEditor: true,
  
  contentType: 'blog'
};

// ============================================================================
// EXPERTISE SPECIFIC TYPES
// ============================================================================

/**
 * Technical term found in content
 */
export interface TechnicalTerm {
  term: string;
  frequency: number;
  isIndustrySpecific: boolean;
  context: string;
}

/**
 * Expertise indicator patterns
 */
export interface ExpertiseIndicator {
  type: 'technical_depth' | 'industry_knowledge' | 'methodology' | 'nuanced_discussion';
  evidence: string;
  score: number;
}

// ============================================================================
// EXPERIENCE SPECIFIC TYPES
// ============================================================================

/**
 * Experience signal types
 */
export interface ExperienceSignal {
  type: 'firsthand_account' | 'case_study' | 'personal_example' | 'specific_outcome' | 'process_detail';
  text: string;
  confidence: number;
}

/**
 * Experiential language patterns
 */
export const EXPERIENCE_PATTERNS: { pattern: RegExp; type: ExperienceSignal['type']; weight: number }[] = [
  { pattern: /\b(I|we|my|our)\s+(tested|tried|used|implemented|discovered|found|learned|experienced)/gi, type: 'firsthand_account', weight: 1.0 },
  { pattern: /\b(in my experience|based on my|from my)\b/gi, type: 'firsthand_account', weight: 0.9 },
  { pattern: /\b(case study|real example|actual results|we achieved|we saw)\b/gi, type: 'case_study', weight: 1.0 },
  { pattern: /\b(for example,? in|when I|when we|here's what happened)\b/gi, type: 'personal_example', weight: 0.8 },
  { pattern: /\b(resulted in|led to|achieved|improved by|increased by|decreased by)\s+\d+/gi, type: 'specific_outcome', weight: 1.0 },
  { pattern: /\b(step by step|here's how|the process|our approach|my method)\b/gi, type: 'process_detail', weight: 0.7 }
];

// ============================================================================
// AUTHORITATIVENESS SPECIFIC TYPES
// ============================================================================

/**
 * Authority signal types
 */
export interface AuthoritySignal {
  type: 'credential' | 'publication' | 'endorsement' | 'media_mention' | 'award' | 'certification';
  description: string;
  verifiable: boolean;
  source?: string;
}

/**
 * Credential patterns
 */
export const CREDENTIAL_PATTERNS: { pattern: RegExp; type: string }[] = [
  { pattern: /\b(Ph\.?D\.?|M\.?D\.?|M\.?B\.?A\.?|J\.?D\.?|M\.?S\.?|B\.?S\.?)\b/gi, type: 'degree' },
  { pattern: /\b(certified|licensed|registered|accredited)\b/gi, type: 'certification' },
  { pattern: /\b(professor|doctor|expert|specialist|consultant)\b/gi, type: 'title' },
  { pattern: /\b(years of experience|decade of|veteran)\b/gi, type: 'experience' },
  { pattern: /\b(author of|published in|featured in|quoted in)\b/gi, type: 'publication' }
];

// ============================================================================
// TRUSTWORTHINESS SPECIFIC TYPES
// ============================================================================

/**
 * Trust signal types
 */
export interface TrustSignal {
  type: 'citation' | 'transparency' | 'accuracy' | 'disclosure' | 'security' | 'contact';
  present: boolean;
  quality: SignalStrength;
  details?: string;
}

/**
 * Trust indicators to check
 */
export const TRUST_INDICATORS: { 
  id: string; 
  label: string; 
  weight: number; 
  check: string 
}[] = [
  { id: 'citations', label: 'Has Citations', weight: 1.0, check: 'Citation to credible sources' },
  { id: 'date', label: 'Publication Date', weight: 0.8, check: 'Clear publish/update date' },
  { id: 'author', label: 'Author Attribution', weight: 0.9, check: 'Named author with bio' },
  { id: 'contact', label: 'Contact Information', weight: 0.6, check: 'Way to contact author/site' },
  { id: 'disclosure', label: 'Disclosures', weight: 0.7, check: 'Affiliate/sponsorship disclosure' },
  { id: 'privacy', label: 'Privacy Policy', weight: 0.5, check: 'Privacy policy link' },
  { id: 'about', label: 'About Section', weight: 0.6, check: 'About page or section' },
  { id: 'editorial', label: 'Editorial Standards', weight: 0.7, check: 'Editorial policy stated' },
  { id: 'corrections', label: 'Correction Policy', weight: 0.5, check: 'How errors are handled' },
  { id: 'https', label: 'Secure Connection', weight: 0.4, check: 'HTTPS enabled' }
];

// ============================================================================
// YMYL DETECTION PATTERNS
// ============================================================================

/**
 * YMYL topic patterns for auto-detection
 */
export const YMYL_PATTERNS: { 
  pattern: RegExp; 
  sensitivity: TopicSensitivity; 
  category: string 
}[] = [
  // High YMYL - Health
  { pattern: /\b(medical|diagnosis|treatment|symptoms|medication|disease|cancer|diabetes|heart)\b/gi, sensitivity: 'ymyl_high', category: 'health' },
  { pattern: /\b(doctor|physician|hospital|surgery|prescription|dosage)\b/gi, sensitivity: 'ymyl_high', category: 'health' },
  
  // High YMYL - Finance
  { pattern: /\b(invest(ment|ing)?|stock|bond|retirement|401k|ira|tax|loan|mortgage|credit)\b/gi, sensitivity: 'ymyl_high', category: 'finance' },
  { pattern: /\b(insurance|estate planning|bankruptcy|debt)\b/gi, sensitivity: 'ymyl_high', category: 'finance' },
  
  // High YMYL - Legal
  { pattern: /\b(legal|attorney|lawyer|lawsuit|court|rights|law|regulation)\b/gi, sensitivity: 'ymyl_high', category: 'legal' },
  
  // High YMYL - Safety
  { pattern: /\b(safety|emergency|danger|hazard|warning|risk|child safety)\b/gi, sensitivity: 'ymyl_high', category: 'safety' },
  
  // Medium YMYL - Education
  { pattern: /\b(university|college|degree|certification|career|job|employment)\b/gi, sensitivity: 'ymyl_medium', category: 'education' },
  
  // Medium YMYL - Major purchases
  { pattern: /\b(buy(ing)? (a |)(house|car|home)|real estate|property)\b/gi, sensitivity: 'ymyl_medium', category: 'purchases' }
];

// ============================================================================
// SCORING THRESHOLDS
// ============================================================================

/**
 * Grade thresholds
 */
export const GRADE_THRESHOLDS: { grade: 'A' | 'B' | 'C' | 'D' | 'F'; min: number }[] = [
  { grade: 'A', min: 90 },
  { grade: 'B', min: 75 },
  { grade: 'C', min: 60 },
  { grade: 'D', min: 45 },
  { grade: 'F', min: 0 }
];

/**
 * Get grade from score
 */
export function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.grade;
    }
  }
  return 'F';
}
