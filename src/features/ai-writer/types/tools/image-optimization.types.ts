/**
 * Image Optimization Types
 * 
 * Comprehensive types for image SEO optimization:
 * - Alt text analysis and suggestions
 * - File size and compression recommendations
 * - Format optimization (WebP, AVIF)
 * - Dimension and responsive image checks
 * - Lazy loading and accessibility
 */

// ============================================================================
// CORE ENUMS & CONSTANTS
// ============================================================================

/**
 * Image format types
 */
export type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'avif' | 'svg' | 'bmp' | 'ico' | 'unknown';

/**
 * Image issue severity
 */
export type ImageIssueSeverity = 'critical' | 'warning' | 'suggestion' | 'info';

/**
 * Image issue types
 */
export type ImageIssueType =
  | 'missing_alt'
  | 'empty_alt'
  | 'generic_alt'
  | 'alt_too_long'
  | 'alt_keyword_stuffing'
  | 'oversized_file'
  | 'wrong_format'
  | 'missing_dimensions'
  | 'oversized_dimensions'
  | 'no_lazy_loading'
  | 'missing_srcset'
  | 'decorative_not_marked'
  | 'broken_image'
  | 'no_title_attribute'
  | 'filename_not_descriptive';

/**
 * Optimization action types
 */
export type OptimizationAction =
  | 'add_alt'
  | 'improve_alt'
  | 'compress'
  | 'convert_format'
  | 'add_dimensions'
  | 'resize'
  | 'add_lazy_loading'
  | 'add_srcset'
  | 'rename_file'
  | 'mark_decorative';

/**
 * Image status
 */
export type ImageStatus = 'optimized' | 'needs_work' | 'critical' | 'pending';

/**
 * Image optimization tabs
 */
export type ImageOptimizationTab = 'overview' | 'images' | 'issues' | 'bulk' | 'settings';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Image format information
 */
export const IMAGE_FORMAT_INFO: Record<ImageFormat, {
  label: string;
  extension: string;
  mime: string;
  modern: boolean;
  recommended: boolean;
  transparency: boolean;
  animation: boolean;
  compressionType: 'lossy' | 'lossless' | 'both';
}> = {
  jpeg: {
    label: 'JPEG',
    extension: '.jpg',
    mime: 'image/jpeg',
    modern: false,
    recommended: false,
    transparency: false,
    animation: false,
    compressionType: 'lossy'
  },
  jpg: {
    label: 'JPG',
    extension: '.jpg',
    mime: 'image/jpeg',
    modern: false,
    recommended: false,
    transparency: false,
    animation: false,
    compressionType: 'lossy'
  },
  png: {
    label: 'PNG',
    extension: '.png',
    mime: 'image/png',
    modern: false,
    recommended: false,
    transparency: true,
    animation: false,
    compressionType: 'lossless'
  },
  gif: {
    label: 'GIF',
    extension: '.gif',
    mime: 'image/gif',
    modern: false,
    recommended: false,
    transparency: true,
    animation: true,
    compressionType: 'lossless'
  },
  webp: {
    label: 'WebP',
    extension: '.webp',
    mime: 'image/webp',
    modern: true,
    recommended: true,
    transparency: true,
    animation: true,
    compressionType: 'both'
  },
  avif: {
    label: 'AVIF',
    extension: '.avif',
    mime: 'image/avif',
    modern: true,
    recommended: true,
    transparency: true,
    animation: true,
    compressionType: 'both'
  },
  svg: {
    label: 'SVG',
    extension: '.svg',
    mime: 'image/svg+xml',
    modern: true,
    recommended: true,
    transparency: true,
    animation: true,
    compressionType: 'lossless'
  },
  bmp: {
    label: 'BMP',
    extension: '.bmp',
    mime: 'image/bmp',
    modern: false,
    recommended: false,
    transparency: false,
    animation: false,
    compressionType: 'lossless'
  },
  ico: {
    label: 'ICO',
    extension: '.ico',
    mime: 'image/x-icon',
    modern: false,
    recommended: false,
    transparency: true,
    animation: false,
    compressionType: 'lossless'
  },
  unknown: {
    label: 'Unknown',
    extension: '',
    mime: '',
    modern: false,
    recommended: false,
    transparency: false,
    animation: false,
    compressionType: 'lossless'
  }
};

/**
 * Issue type information
 */
export const IMAGE_ISSUE_TYPE_INFO: Record<ImageIssueType, {
  label: string;
  description: string;
  severity: ImageIssueSeverity;
  impact: string;
  seoWeight: number;
}> = {
  missing_alt: {
    label: 'Missing Alt Text',
    description: 'Image has no alt attribute',
    severity: 'critical',
    impact: 'Screen readers cannot describe image; search engines cannot understand context',
    seoWeight: 1.0
  },
  empty_alt: {
    label: 'Empty Alt Text',
    description: 'Alt attribute is empty (may be intentional for decorative images)',
    severity: 'warning',
    impact: 'Search engines may not understand image content',
    seoWeight: 0.8
  },
  generic_alt: {
    label: 'Generic Alt Text',
    description: 'Alt text is too generic (e.g., "image", "photo")',
    severity: 'warning',
    impact: 'Not descriptive enough for SEO or accessibility',
    seoWeight: 0.7
  },
  alt_too_long: {
    label: 'Alt Text Too Long',
    description: 'Alt text exceeds recommended length (125 characters)',
    severity: 'suggestion',
    impact: 'Screen readers may truncate; less focused for SEO',
    seoWeight: 0.4
  },
  alt_keyword_stuffing: {
    label: 'Alt Text Keyword Stuffing',
    description: 'Alt text appears to have excessive keywords',
    severity: 'warning',
    impact: 'May be penalized by search engines',
    seoWeight: 0.6
  },
  oversized_file: {
    label: 'Oversized File',
    description: 'Image file size is too large',
    severity: 'warning',
    impact: 'Slows page load, affects Core Web Vitals',
    seoWeight: 0.8
  },
  wrong_format: {
    label: 'Suboptimal Format',
    description: 'Image could use a more efficient format',
    severity: 'suggestion',
    impact: 'Modern formats offer better compression',
    seoWeight: 0.5
  },
  missing_dimensions: {
    label: 'Missing Dimensions',
    description: 'Width and/or height attributes not specified',
    severity: 'warning',
    impact: 'Causes layout shift (CLS), hurts Core Web Vitals',
    seoWeight: 0.7
  },
  oversized_dimensions: {
    label: 'Oversized Dimensions',
    description: 'Image dimensions larger than display size',
    severity: 'suggestion',
    impact: 'Wastes bandwidth, slows loading',
    seoWeight: 0.5
  },
  no_lazy_loading: {
    label: 'No Lazy Loading',
    description: 'Below-fold images should use lazy loading',
    severity: 'suggestion',
    impact: 'Loads unnecessary images upfront',
    seoWeight: 0.4
  },
  missing_srcset: {
    label: 'Missing Srcset',
    description: 'No responsive image variants provided',
    severity: 'suggestion',
    impact: 'Mobile devices may download oversized images',
    seoWeight: 0.4
  },
  decorative_not_marked: {
    label: 'Decorative Not Marked',
    description: 'Decorative image should have empty alt or role="presentation"',
    severity: 'info',
    impact: 'Screen readers may announce unnecessary content',
    seoWeight: 0.2
  },
  broken_image: {
    label: 'Broken Image',
    description: 'Image source appears to be broken or missing',
    severity: 'critical',
    impact: 'Image does not display, bad user experience',
    seoWeight: 1.0
  },
  no_title_attribute: {
    label: 'No Title Attribute',
    description: 'Image lacks title attribute for tooltip',
    severity: 'info',
    impact: 'Minor accessibility improvement',
    seoWeight: 0.1
  },
  filename_not_descriptive: {
    label: 'Non-Descriptive Filename',
    description: 'Filename uses generic or random characters',
    severity: 'suggestion',
    impact: 'Misses SEO opportunity in filename',
    seoWeight: 0.3
  }
};

/**
 * Optimization action information
 */
export const OPTIMIZATION_ACTION_INFO: Record<OptimizationAction, {
  label: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  automated: boolean;
}> = {
  add_alt: {
    label: 'Add Alt Text',
    description: 'Add descriptive alt text to image',
    effort: 'low',
    automated: false
  },
  improve_alt: {
    label: 'Improve Alt Text',
    description: 'Enhance alt text with better description',
    effort: 'low',
    automated: false
  },
  compress: {
    label: 'Compress Image',
    description: 'Reduce file size while maintaining quality',
    effort: 'medium',
    automated: true
  },
  convert_format: {
    label: 'Convert Format',
    description: 'Convert to modern format (WebP/AVIF)',
    effort: 'medium',
    automated: true
  },
  add_dimensions: {
    label: 'Add Dimensions',
    description: 'Add width and height attributes',
    effort: 'low',
    automated: true
  },
  resize: {
    label: 'Resize Image',
    description: 'Reduce image dimensions to appropriate size',
    effort: 'medium',
    automated: true
  },
  add_lazy_loading: {
    label: 'Add Lazy Loading',
    description: 'Add loading="lazy" attribute',
    effort: 'low',
    automated: true
  },
  add_srcset: {
    label: 'Add Srcset',
    description: 'Create responsive image variants',
    effort: 'high',
    automated: true
  },
  rename_file: {
    label: 'Rename File',
    description: 'Use descriptive, SEO-friendly filename',
    effort: 'medium',
    automated: false
  },
  mark_decorative: {
    label: 'Mark as Decorative',
    description: 'Add empty alt or role="presentation"',
    effort: 'low',
    automated: true
  }
};

/**
 * Tab configuration
 */
export const IMAGE_OPTIMIZATION_TABS: { id: ImageOptimizationTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'images', label: 'Images', icon: 'Image' },
  { id: 'issues', label: 'Issues', icon: 'AlertTriangle' },
  { id: 'bulk', label: 'Bulk Actions', icon: 'Layers' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

/**
 * Size thresholds
 */
export const SIZE_THRESHOLDS = {
  small: 50 * 1024, // 50KB
  medium: 150 * 1024, // 150KB
  large: 500 * 1024, // 500KB
  excessive: 1024 * 1024 // 1MB
};

/**
 * Dimension thresholds
 */
export const DIMENSION_THRESHOLDS = {
  maxWidth: 2000,
  maxHeight: 2000,
  heroMaxWidth: 1920,
  thumbnailMaxWidth: 400,
  contentMaxWidth: 800
};

/**
 * Alt text thresholds
 */
export const ALT_TEXT_THRESHOLDS = {
  minLength: 5,
  maxLength: 125,
  optimalLength: 80
};

/**
 * Generic alt text patterns
 */
export const GENERIC_ALT_PATTERNS = [
  /^image$/i,
  /^photo$/i,
  /^picture$/i,
  /^img$/i,
  /^pic$/i,
  /^screenshot$/i,
  /^untitled$/i,
  /^dsc[\d]+$/i,
  /^img[\d]+$/i,
  /^image[\d]+$/i,
  /^[\d]+$/,
  /^\.+$/
];

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Image information
 */
export interface ImageInfo {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  srcset?: string;
  sizes?: string;
  
  // Computed properties
  filename: string;
  format: ImageFormat;
  fileSize?: number; // in bytes
  naturalWidth?: number;
  naturalHeight?: number;
  displayWidth?: number;
  displayHeight?: number;
  
  // Position in content
  position: number;
  isAboveFold: boolean;
  context?: string; // Surrounding text
  
  // Analysis results
  status: ImageStatus;
  issues: ImageIssue[];
  score: number; // 0-100
}

/**
 * Image issue
 */
export interface ImageIssue {
  id: string;
  type: ImageIssueType;
  severity: ImageIssueSeverity;
  imageId: string;
  message: string;
  details?: string;
  suggestedFix: string;
  autoFixable: boolean;
  action?: OptimizationAction;
}

/**
 * Alt text suggestion
 */
export interface AltTextSuggestion {
  id: string;
  imageId: string;
  currentAlt?: string;
  suggestedAlt: string;
  confidence: number; // 0-100
  keywords: string[];
  source: 'ai' | 'context' | 'filename' | 'manual';
  reasoning?: string;
}

/**
 * Image optimization metrics
 */
export interface ImageOptimizationMetrics {
  totalImages: number;
  optimizedImages: number;
  imagesWithIssues: number;
  criticalIssues: number;
  
  // Alt text metrics
  imagesWithAlt: number;
  imagesWithEmptyAlt: number;
  imagesWithoutAlt: number;
  averageAltLength: number;
  
  // Size metrics
  totalFileSize: number;
  averageFileSize: number;
  oversizedImages: number;
  potentialSavings: number; // bytes saved if optimized
  
  // Format metrics
  modernFormatImages: number;
  legacyFormatImages: number;
  
  // Performance metrics
  imagesWithDimensions: number;
  imagesWithLazyLoad: number;
  imagesWithSrcset: number;
  
  // Score
  overallScore: number; // 0-100
  altTextScore: number;
  performanceScore: number;
  formatScore: number;
}

/**
 * Image optimization recommendation
 */
export interface ImageOptimizationRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: OptimizationAction;
  affectedImages: string[];
  potentialImpact: string;
  effort: 'low' | 'medium' | 'high';
}

/**
 * Full image optimization analysis
 */
export interface ImageOptimizationAnalysis {
  id: string;
  contentId: string;
  analyzedAt: string;
  
  // Images
  images: ImageInfo[];
  totalImages: number;
  
  // Issues
  issues: ImageIssue[];
  
  // Alt text suggestions
  altTextSuggestions: AltTextSuggestion[];
  
  // Metrics
  metrics: ImageOptimizationMetrics;
  
  // Recommendations
  recommendations: ImageOptimizationRecommendation[];
  
  // Summary
  summary: string;
  quickWins: string[];
}

/**
 * Image optimization settings
 */
export interface ImageOptimizationSettings {
  // Analysis options
  checkAltText: boolean;
  checkFileSize: boolean;
  checkFormat: boolean;
  checkDimensions: boolean;
  checkLazyLoading: boolean;
  checkSrcset: boolean;
  
  // Thresholds
  maxFileSize: number; // bytes
  maxWidth: number;
  maxHeight: number;
  maxAltLength: number;
  
  // Format preferences
  preferredFormats: ImageFormat[];
  suggestModernFormats: boolean;
  
  // Lazy loading
  lazyLoadBelowFold: boolean;
  foldThreshold: number; // pixels from top
  
  // Alt text
  suggestAltText: boolean;
  useAIForAltSuggestions: boolean;
  targetKeywords: string[];
  
  // Display
  showPreview: boolean;
  highlightIssuesInEditor: boolean;
}

/**
 * Default settings
 */
export const DEFAULT_IMAGE_OPTIMIZATION_SETTINGS: ImageOptimizationSettings = {
  checkAltText: true,
  checkFileSize: true,
  checkFormat: true,
  checkDimensions: true,
  checkLazyLoading: true,
  checkSrcset: true,
  
  maxFileSize: SIZE_THRESHOLDS.large,
  maxWidth: DIMENSION_THRESHOLDS.maxWidth,
  maxHeight: DIMENSION_THRESHOLDS.maxHeight,
  maxAltLength: ALT_TEXT_THRESHOLDS.maxLength,
  
  preferredFormats: ['webp', 'avif'],
  suggestModernFormats: true,
  
  lazyLoadBelowFold: true,
  foldThreshold: 800,
  
  suggestAltText: true,
  useAIForAltSuggestions: true,
  targetKeywords: [],
  
  showPreview: true,
  highlightIssuesInEditor: true
};

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

/**
 * Bulk operation types
 */
export type BulkOperationType =
  | 'compress_all'
  | 'convert_all'
  | 'add_lazy_loading_all'
  | 'add_dimensions_all'
  | 'generate_alt_all';

/**
 * Bulk operation status
 */
export interface BulkOperationStatus {
  operation: BulkOperationType;
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  errors: { imageId: string; error: string }[];
}

/**
 * Bulk operation info
 */
export const BULK_OPERATION_INFO: Record<BulkOperationType, {
  label: string;
  description: string;
  icon: string;
}> = {
  compress_all: {
    label: 'Compress All',
    description: 'Compress all oversized images',
    icon: 'Minimize2'
  },
  convert_all: {
    label: 'Convert to WebP',
    description: 'Convert all images to WebP format',
    icon: 'RefreshCw'
  },
  add_lazy_loading_all: {
    label: 'Add Lazy Loading',
    description: 'Add lazy loading to below-fold images',
    icon: 'Clock'
  },
  add_dimensions_all: {
    label: 'Add Dimensions',
    description: 'Add width/height to all images',
    icon: 'Maximize2'
  },
  generate_alt_all: {
    label: 'Generate Alt Text',
    description: 'Generate alt text suggestions for all images',
    icon: 'FileText'
  }
};
