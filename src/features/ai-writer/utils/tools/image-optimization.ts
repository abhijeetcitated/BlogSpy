/**
 * Image Optimization Utilities
 * 
 * Algorithms for image SEO analysis and optimization:
 * - Alt text analysis and suggestion generation
 * - File size and format optimization detection
 * - Dimension and responsive image checks
 * - Performance optimization recommendations
 */

import {
  ImageFormat,
  ImageIssueSeverity,
  ImageIssueType,
  OptimizationAction,
  ImageStatus,
  ImageInfo,
  ImageIssue,
  AltTextSuggestion,
  ImageOptimizationMetrics,
  ImageOptimizationRecommendation,
  ImageOptimizationAnalysis,
  ImageOptimizationSettings,
  DEFAULT_IMAGE_OPTIMIZATION_SETTINGS,
  IMAGE_FORMAT_INFO,
  IMAGE_ISSUE_TYPE_INFO,
  SIZE_THRESHOLDS,
  ALT_TEXT_THRESHOLDS,
  GENERIC_ALT_PATTERNS
} from '@/src/features/ai-writer/types/tools/image-optimization.types';

// ============================================================================
// PARSING UTILITIES
// ============================================================================

/**
 * Extract images from HTML content
 */
export function extractImages(html: string): ImageInfo[] {
  const images: ImageInfo[] = [];
  const imgRegex = /<img\s+([^>]*)>/gi;
  let match;
  let position = 0;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const attributes = match[1];
    const imageInfo = parseImageAttributes(attributes, position);
    if (imageInfo) {
      images.push(imageInfo);
    }
    position++;
  }
  
  return images;
}

/**
 * Parse image attributes from HTML
 */
function parseImageAttributes(attributeString: string, position: number): ImageInfo | null {
  const getAttribute = (name: string): string | undefined => {
    const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
    const match = attributeString.match(regex);
    return match ? match[1] : undefined;
  };
  
  const src = getAttribute('src');
  if (!src) return null;
  
  const width = getAttribute('width');
  const height = getAttribute('height');
  
  return {
    id: `img-${position}-${Date.now()}`,
    src,
    alt: getAttribute('alt'),
    title: getAttribute('title'),
    width: width ? parseInt(width, 10) : undefined,
    height: height ? parseInt(height, 10) : undefined,
    loading: getAttribute('loading') as 'lazy' | 'eager' | undefined,
    srcset: getAttribute('srcset'),
    sizes: getAttribute('sizes'),
    
    filename: extractFilename(src),
    format: detectImageFormat(src),
    fileSize: undefined, // Would need to fetch to determine
    
    position,
    isAboveFold: position < 2, // First 2 images typically above fold
    
    status: 'pending',
    issues: [],
    score: 0
  };
}

/**
 * Extract filename from src URL
 */
export function extractFilename(src: string): string {
  try {
    const url = new URL(src, 'https://example.com');
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || '';
    return filename;
  } catch {
    const parts = src.split('/');
    return parts.pop() || src;
  }
}

/**
 * Detect image format from src or filename
 */
export function detectImageFormat(src: string): ImageFormat {
  const filename = extractFilename(src).toLowerCase();
  const extension = filename.split('.').pop() || '';
  
  const formatMap: Record<string, ImageFormat> = {
    'jpg': 'jpeg',
    'jpeg': 'jpeg',
    'png': 'png',
    'gif': 'gif',
    'webp': 'webp',
    'avif': 'avif',
    'svg': 'svg',
    'bmp': 'bmp',
    'ico': 'ico'
  };
  
  return formatMap[extension] || 'unknown';
}

// ============================================================================
// ALT TEXT ANALYSIS
// ============================================================================

/**
 * Check if alt text is generic
 */
export function isGenericAltText(alt: string): boolean {
  if (!alt || alt.trim().length === 0) return false;
  
  const normalized = alt.trim().toLowerCase();
  
  return GENERIC_ALT_PATTERNS.some(pattern => pattern.test(normalized));
}

/**
 * Check for keyword stuffing in alt text
 */
export function hasKeywordStuffing(alt: string): boolean {
  if (!alt) return false;
  
  const words = alt.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};
  
  for (const word of words) {
    if (word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }
  
  // Check for repeated words (more than 2 times)
  const hasRepeats = Object.values(wordCount).some(count => count > 2);
  
  // Check for excessive keyword density
  const uniqueWords = Object.keys(wordCount).length;
  const totalWords = words.filter(w => w.length > 3).length;
  const density = uniqueWords / Math.max(totalWords, 1);
  
  return hasRepeats || density < 0.5;
}

/**
 * Analyze alt text quality
 */
export function analyzeAltText(alt: string | undefined): {
  score: number;
  issues: ImageIssueType[];
  suggestions: string[];
} {
  const issues: ImageIssueType[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  if (alt === undefined) {
    issues.push('missing_alt');
    suggestions.push('Add descriptive alt text that explains the image content');
    score = 0;
  } else if (alt.trim() === '') {
    // Empty alt might be intentional for decorative images
    issues.push('empty_alt');
    suggestions.push('If decorative, this is correct. Otherwise, add descriptive text.');
    score = 50;
  } else {
    // Check length
    if (alt.length > ALT_TEXT_THRESHOLDS.maxLength) {
      issues.push('alt_too_long');
      suggestions.push(`Shorten alt text to under ${ALT_TEXT_THRESHOLDS.maxLength} characters`);
      score -= 20;
    }
    
    // Check for generic text
    if (isGenericAltText(alt)) {
      issues.push('generic_alt');
      suggestions.push('Replace generic alt text with a specific description');
      score -= 40;
    }
    
    // Check for keyword stuffing
    if (hasKeywordStuffing(alt)) {
      issues.push('alt_keyword_stuffing');
      suggestions.push('Reduce keyword repetition in alt text');
      score -= 30;
    }
    
    // Very short alt text
    if (alt.length < ALT_TEXT_THRESHOLDS.minLength) {
      suggestions.push('Consider making alt text more descriptive');
      score -= 10;
    }
  }
  
  return { score: Math.max(0, score), issues, suggestions };
}

/**
 * Generate alt text suggestion from context
 */
export function generateAltTextSuggestion(
  image: ImageInfo,
  surroundingText: string = '',
  keywords: string[] = []
): AltTextSuggestion {
  let suggestedAlt = '';
  let source: AltTextSuggestion['source'] = 'context';
  let confidence = 50;
  let reasoning = '';
  
  // Try to generate from filename
  const filename = image.filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace separators with spaces
    .replace(/\d+/g, '') // Remove numbers
    .trim();
  
  if (filename.length > 5 && !/^(img|image|photo|pic|dsc)/i.test(filename)) {
    suggestedAlt = filename.charAt(0).toUpperCase() + filename.slice(1);
    source = 'filename';
    confidence = 60;
    reasoning = 'Generated from descriptive filename';
  }
  
  // Try to extract from surrounding text
  if (surroundingText.length > 10) {
    // Look for caption-like text
    const sentences = surroundingText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    if (sentences.length > 0) {
      const shortestSentence = sentences.reduce((a, b) => a.length < b.length ? a : b);
      if (shortestSentence.length <= ALT_TEXT_THRESHOLDS.maxLength) {
        suggestedAlt = shortestSentence;
        source = 'context';
        confidence = 70;
        reasoning = 'Extracted from surrounding content';
      }
    }
  }
  
  // Incorporate keywords if provided
  if (keywords.length > 0 && suggestedAlt) {
    const hasKeyword = keywords.some(kw => suggestedAlt.toLowerCase().includes(kw.toLowerCase()));
    if (!hasKeyword && suggestedAlt.length < ALT_TEXT_THRESHOLDS.maxLength - 20) {
      suggestedAlt = `${suggestedAlt} - ${keywords[0]}`;
      confidence += 10;
    }
  }
  
  // Fallback
  if (!suggestedAlt) {
    suggestedAlt = 'Image related to the article content';
    source = 'context';
    confidence = 30;
    reasoning = 'Generic suggestion - needs manual review';
  }
  
  return {
    id: `alt-suggestion-${image.id}`,
    imageId: image.id,
    currentAlt: image.alt,
    suggestedAlt,
    confidence,
    keywords,
    source,
    reasoning
  };
}

// ============================================================================
// FILE SIZE ANALYSIS
// ============================================================================

/**
 * Analyze file size
 */
export function analyzeFileSize(
  fileSize: number | undefined,
  settings: ImageOptimizationSettings
): {
  score: number;
  issues: ImageIssueType[];
  suggestions: string[];
  estimatedSavings: number;
} {
  const issues: ImageIssueType[] = [];
  const suggestions: string[] = [];
  let score = 100;
  let estimatedSavings = 0;
  
  if (fileSize === undefined) {
    return { score: 80, issues: [], suggestions: ['Unable to determine file size'], estimatedSavings: 0 };
  }
  
  if (fileSize > SIZE_THRESHOLDS.excessive) {
    issues.push('oversized_file');
    suggestions.push('Image is extremely large (>1MB). Compress or resize significantly.');
    score = 20;
    estimatedSavings = fileSize * 0.7; // Estimate 70% reduction possible
  } else if (fileSize > SIZE_THRESHOLDS.large) {
    issues.push('oversized_file');
    suggestions.push('Compress image to reduce file size');
    score = 40;
    estimatedSavings = fileSize * 0.5;
  } else if (fileSize > settings.maxFileSize) {
    issues.push('oversized_file');
    suggestions.push('Consider compressing to improve load time');
    score = 60;
    estimatedSavings = fileSize * 0.3;
  } else if (fileSize > SIZE_THRESHOLDS.medium) {
    suggestions.push('File size is acceptable but could be optimized');
    score = 80;
    estimatedSavings = fileSize * 0.2;
  }
  
  return { score, issues, suggestions, estimatedSavings };
}

// ============================================================================
// FORMAT ANALYSIS
// ============================================================================

/**
 * Analyze image format
 */
export function analyzeFormat(
  format: ImageFormat,
  settings: ImageOptimizationSettings
): {
  score: number;
  issues: ImageIssueType[];
  suggestions: string[];
  recommendedFormat: ImageFormat | null;
} {
  const issues: ImageIssueType[] = [];
  const suggestions: string[] = [];
  let score = 100;
  let recommendedFormat: ImageFormat | null = null;
  
  const formatInfo = IMAGE_FORMAT_INFO[format];
  
  if (format === 'unknown') {
    issues.push('wrong_format');
    suggestions.push('Unable to determine image format');
    score = 50;
  } else if (!formatInfo.modern && settings.suggestModernFormats) {
    issues.push('wrong_format');
    
    if (formatInfo.transparency) {
      recommendedFormat = 'webp';
      suggestions.push('Convert to WebP for better compression with transparency support');
    } else {
      recommendedFormat = 'webp';
      suggestions.push('Convert to WebP for 25-35% smaller file size');
    }
    score = 70;
  } else if (formatInfo.modern) {
    score = 100;
  }
  
  // BMP should always be converted
  if (format === 'bmp') {
    score = 20;
    recommendedFormat = 'webp';
    suggestions.push('BMP format is extremely inefficient. Convert to WebP or PNG.');
  }
  
  return { score, issues, suggestions, recommendedFormat };
}

// ============================================================================
// DIMENSION ANALYSIS
// ============================================================================

/**
 * Analyze image dimensions
 */
export function analyzeDimensions(
  image: ImageInfo,
  settings: ImageOptimizationSettings
): {
  score: number;
  issues: ImageIssueType[];
  suggestions: string[];
} {
  const issues: ImageIssueType[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  // Check if dimensions are specified
  if (!image.width || !image.height) {
    issues.push('missing_dimensions');
    suggestions.push('Add width and height attributes to prevent layout shift');
    score -= 30;
  }
  
  // Check if dimensions are too large
  if (image.width && image.width > settings.maxWidth) {
    issues.push('oversized_dimensions');
    suggestions.push(`Width exceeds ${settings.maxWidth}px. Consider resizing.`);
    score -= 20;
  }
  
  if (image.height && image.height > settings.maxHeight) {
    issues.push('oversized_dimensions');
    suggestions.push(`Height exceeds ${settings.maxHeight}px. Consider resizing.`);
    score -= 20;
  }
  
  return { score: Math.max(0, score), issues, suggestions };
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

/**
 * Analyze lazy loading
 */
export function analyzeLazyLoading(
  image: ImageInfo,
  settings: ImageOptimizationSettings
): {
  score: number;
  issues: ImageIssueType[];
  suggestions: string[];
} {
  const issues: ImageIssueType[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  // Above-fold images should NOT use lazy loading
  if (image.isAboveFold) {
    if (image.loading === 'lazy') {
      suggestions.push('Consider removing lazy loading for above-fold images');
      score = 80;
    }
    return { score, issues, suggestions };
  }
  
  // Below-fold images SHOULD use lazy loading
  if (settings.lazyLoadBelowFold && image.loading !== 'lazy') {
    issues.push('no_lazy_loading');
    suggestions.push('Add loading="lazy" to defer loading until needed');
    score = 70;
  }
  
  return { score, issues, suggestions };
}

/**
 * Analyze responsive images (srcset)
 */
export function analyzeSrcset(
  image: ImageInfo,
  settings: ImageOptimizationSettings
): {
  score: number;
  issues: ImageIssueType[];
  suggestions: string[];
} {
  const issues: ImageIssueType[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  if (!settings.checkSrcset) {
    return { score, issues, suggestions };
  }
  
  // Large images should have srcset
  if (image.width && image.width > 600 && !image.srcset) {
    issues.push('missing_srcset');
    suggestions.push('Add srcset for responsive images on different screen sizes');
    score = 70;
  }
  
  return { score, issues, suggestions };
}

// ============================================================================
// COMPREHENSIVE IMAGE ANALYSIS
// ============================================================================

/**
 * Analyze a single image
 */
export function analyzeImage(
  image: ImageInfo,
  settings: ImageOptimizationSettings
): ImageInfo {
  const issues: ImageIssue[] = [];
  let totalScore = 0;
  let scoreCount = 0;
  
  // Alt text analysis
  if (settings.checkAltText) {
    const altAnalysis = analyzeAltText(image.alt);
    totalScore += altAnalysis.score;
    scoreCount++;
    
    for (const issueType of altAnalysis.issues) {
      const issueInfo = IMAGE_ISSUE_TYPE_INFO[issueType];
      issues.push({
        id: `${image.id}-${issueType}`,
        type: issueType,
        severity: issueInfo.severity,
        imageId: image.id,
        message: issueInfo.label,
        details: issueInfo.description,
        suggestedFix: altAnalysis.suggestions[0] || 'Fix the issue',
        autoFixable: issueType !== 'missing_alt' && issueType !== 'generic_alt',
        action: issueType === 'missing_alt' ? 'add_alt' : 'improve_alt'
      });
    }
  }
  
  // File size analysis
  if (settings.checkFileSize && image.fileSize) {
    const sizeAnalysis = analyzeFileSize(image.fileSize, settings);
    totalScore += sizeAnalysis.score;
    scoreCount++;
    
    for (const issueType of sizeAnalysis.issues) {
      const issueInfo = IMAGE_ISSUE_TYPE_INFO[issueType];
      issues.push({
        id: `${image.id}-${issueType}`,
        type: issueType,
        severity: issueInfo.severity,
        imageId: image.id,
        message: issueInfo.label,
        details: `File size: ${formatFileSize(image.fileSize)}`,
        suggestedFix: sizeAnalysis.suggestions[0] || 'Compress the image',
        autoFixable: true,
        action: 'compress'
      });
    }
  }
  
  // Format analysis
  if (settings.checkFormat) {
    const formatAnalysis = analyzeFormat(image.format, settings);
    totalScore += formatAnalysis.score;
    scoreCount++;
    
    for (const issueType of formatAnalysis.issues) {
      const issueInfo = IMAGE_ISSUE_TYPE_INFO[issueType];
      issues.push({
        id: `${image.id}-${issueType}`,
        type: issueType,
        severity: issueInfo.severity,
        imageId: image.id,
        message: issueInfo.label,
        details: `Current format: ${IMAGE_FORMAT_INFO[image.format].label}`,
        suggestedFix: formatAnalysis.suggestions[0] || 'Convert to modern format',
        autoFixable: true,
        action: 'convert_format'
      });
    }
  }
  
  // Dimension analysis
  if (settings.checkDimensions) {
    const dimAnalysis = analyzeDimensions(image, settings);
    totalScore += dimAnalysis.score;
    scoreCount++;
    
    for (const issueType of dimAnalysis.issues) {
      const issueInfo = IMAGE_ISSUE_TYPE_INFO[issueType];
      issues.push({
        id: `${image.id}-${issueType}`,
        type: issueType,
        severity: issueInfo.severity,
        imageId: image.id,
        message: issueInfo.label,
        suggestedFix: dimAnalysis.suggestions[0] || 'Add dimensions',
        autoFixable: issueType === 'missing_dimensions',
        action: issueType === 'missing_dimensions' ? 'add_dimensions' : 'resize'
      });
    }
  }
  
  // Lazy loading analysis
  if (settings.checkLazyLoading) {
    const lazyAnalysis = analyzeLazyLoading(image, settings);
    totalScore += lazyAnalysis.score;
    scoreCount++;
    
    for (const issueType of lazyAnalysis.issues) {
      const issueInfo = IMAGE_ISSUE_TYPE_INFO[issueType];
      issues.push({
        id: `${image.id}-${issueType}`,
        type: issueType,
        severity: issueInfo.severity,
        imageId: image.id,
        message: issueInfo.label,
        suggestedFix: lazyAnalysis.suggestions[0] || 'Add lazy loading',
        autoFixable: true,
        action: 'add_lazy_loading'
      });
    }
  }
  
  // Srcset analysis
  if (settings.checkSrcset) {
    const srcsetAnalysis = analyzeSrcset(image, settings);
    totalScore += srcsetAnalysis.score;
    scoreCount++;
    
    for (const issueType of srcsetAnalysis.issues) {
      const issueInfo = IMAGE_ISSUE_TYPE_INFO[issueType];
      issues.push({
        id: `${image.id}-${issueType}`,
        type: issueType,
        severity: issueInfo.severity,
        imageId: image.id,
        message: issueInfo.label,
        suggestedFix: srcsetAnalysis.suggestions[0] || 'Add srcset',
        autoFixable: true,
        action: 'add_srcset'
      });
    }
  }
  
  // Calculate overall score
  const score = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 100;
  
  // Determine status
  let status: ImageStatus = 'optimized';
  if (issues.some(i => i.severity === 'critical')) {
    status = 'critical';
  } else if (issues.length > 0) {
    status = 'needs_work';
  }
  
  return {
    ...image,
    issues,
    score,
    status
  };
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculate optimization metrics
 */
export function calculateMetrics(images: ImageInfo[]): ImageOptimizationMetrics {
  const total = images.length;
  
  if (total === 0) {
    return {
      totalImages: 0,
      optimizedImages: 0,
      imagesWithIssues: 0,
      criticalIssues: 0,
      imagesWithAlt: 0,
      imagesWithEmptyAlt: 0,
      imagesWithoutAlt: 0,
      averageAltLength: 0,
      totalFileSize: 0,
      averageFileSize: 0,
      oversizedImages: 0,
      potentialSavings: 0,
      modernFormatImages: 0,
      legacyFormatImages: 0,
      imagesWithDimensions: 0,
      imagesWithLazyLoad: 0,
      imagesWithSrcset: 0,
      overallScore: 100,
      altTextScore: 100,
      performanceScore: 100,
      formatScore: 100
    };
  }
  
  // Count various metrics
  const optimizedImages = images.filter(i => i.status === 'optimized').length;
  const imagesWithIssues = images.filter(i => i.issues.length > 0).length;
  const criticalIssues = images.reduce((sum, i) => 
    sum + i.issues.filter(issue => issue.severity === 'critical').length, 0);
  
  // Alt text metrics
  const imagesWithAlt = images.filter(i => i.alt && i.alt.trim().length > 0).length;
  const imagesWithEmptyAlt = images.filter(i => i.alt === '').length;
  const imagesWithoutAlt = images.filter(i => i.alt === undefined).length;
  const totalAltLength = images.reduce((sum, i) => sum + (i.alt?.length || 0), 0);
  const averageAltLength = imagesWithAlt > 0 ? Math.round(totalAltLength / imagesWithAlt) : 0;
  
  // Size metrics
  const imagesWithSize = images.filter(i => i.fileSize !== undefined);
  const totalFileSize = imagesWithSize.reduce((sum, i) => sum + (i.fileSize || 0), 0);
  const averageFileSize = imagesWithSize.length > 0 ? Math.round(totalFileSize / imagesWithSize.length) : 0;
  const oversizedImages = images.filter(i => i.fileSize && i.fileSize > SIZE_THRESHOLDS.large).length;
  const potentialSavings = imagesWithSize.reduce((sum, i) => {
    if (i.fileSize && i.fileSize > SIZE_THRESHOLDS.medium) {
      return sum + (i.fileSize * 0.4);
    }
    return sum;
  }, 0);
  
  // Format metrics
  const modernFormatImages = images.filter(i => IMAGE_FORMAT_INFO[i.format]?.modern).length;
  const legacyFormatImages = total - modernFormatImages;
  
  // Performance metrics
  const imagesWithDimensions = images.filter(i => i.width && i.height).length;
  const imagesWithLazyLoad = images.filter(i => i.loading === 'lazy').length;
  const imagesWithSrcset = images.filter(i => i.srcset).length;
  
  // Score calculations
  const overallScore = Math.round(images.reduce((sum, i) => sum + i.score, 0) / total);
  const altTextScore = total > 0 ? Math.round((imagesWithAlt / total) * 100) : 100;
  const performanceScore = Math.round(
    ((imagesWithDimensions / total) * 40) +
    ((imagesWithLazyLoad / Math.max(1, total - 2)) * 30) + // Exclude above-fold
    ((1 - (oversizedImages / total)) * 30)
  );
  const formatScore = Math.round((modernFormatImages / total) * 100);
  
  return {
    totalImages: total,
    optimizedImages,
    imagesWithIssues,
    criticalIssues,
    imagesWithAlt,
    imagesWithEmptyAlt,
    imagesWithoutAlt,
    averageAltLength,
    totalFileSize,
    averageFileSize,
    oversizedImages,
    potentialSavings,
    modernFormatImages,
    legacyFormatImages,
    imagesWithDimensions,
    imagesWithLazyLoad,
    imagesWithSrcset,
    overallScore,
    altTextScore,
    performanceScore,
    formatScore
  };
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate optimization recommendations
 */
export function generateRecommendations(
  images: ImageInfo[],
  metrics: ImageOptimizationMetrics
): ImageOptimizationRecommendation[] {
  const recommendations: ImageOptimizationRecommendation[] = [];
  let recId = 0;
  
  // Critical: Missing alt text
  if (metrics.imagesWithoutAlt > 0) {
    const affectedImages = images.filter(i => i.alt === undefined).map(i => i.id);
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'critical',
      title: 'Add Missing Alt Text',
      description: `${metrics.imagesWithoutAlt} images are missing alt text.`,
      action: 'add_alt',
      affectedImages,
      potentialImpact: 'Critical for accessibility and SEO',
      effort: 'low'
    });
  }
  
  // High: Oversized files
  if (metrics.oversizedImages > 0) {
    const affectedImages = images.filter(i => i.fileSize && i.fileSize > SIZE_THRESHOLDS.large).map(i => i.id);
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      title: 'Compress Large Images',
      description: `${metrics.oversizedImages} images exceed recommended file size.`,
      action: 'compress',
      affectedImages,
      potentialImpact: `Could save ~${formatFileSize(metrics.potentialSavings)}`,
      effort: 'medium'
    });
  }
  
  // High: Missing dimensions
  const missingDimensions = images.filter(i => !i.width || !i.height);
  if (missingDimensions.length > 0) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      title: 'Add Image Dimensions',
      description: `${missingDimensions.length} images missing width/height attributes.`,
      action: 'add_dimensions',
      affectedImages: missingDimensions.map(i => i.id),
      potentialImpact: 'Prevents layout shift (improves CLS)',
      effort: 'low'
    });
  }
  
  // Medium: Legacy formats
  if (metrics.legacyFormatImages > metrics.totalImages / 2) {
    const affectedImages = images.filter(i => !IMAGE_FORMAT_INFO[i.format]?.modern).map(i => i.id);
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'medium',
      title: 'Convert to Modern Formats',
      description: `${metrics.legacyFormatImages} images could use WebP format.`,
      action: 'convert_format',
      affectedImages,
      potentialImpact: '25-35% smaller file sizes',
      effort: 'medium'
    });
  }
  
  // Medium: Missing lazy loading
  const missingLazy = images.filter(i => !i.isAboveFold && i.loading !== 'lazy');
  if (missingLazy.length > 0) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'medium',
      title: 'Add Lazy Loading',
      description: `${missingLazy.length} below-fold images without lazy loading.`,
      action: 'add_lazy_loading',
      affectedImages: missingLazy.map(i => i.id),
      potentialImpact: 'Faster initial page load',
      effort: 'low'
    });
  }
  
  // Low: Generic alt text
  const genericAlt = images.filter(i => i.alt && isGenericAltText(i.alt));
  if (genericAlt.length > 0) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'low',
      title: 'Improve Generic Alt Text',
      description: `${genericAlt.length} images have generic alt text.`,
      action: 'improve_alt',
      affectedImages: genericAlt.map(i => i.id),
      potentialImpact: 'Better SEO and accessibility',
      effort: 'low'
    });
  }
  
  return recommendations;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze all images in content
 */
export function analyzeImageOptimization(
  content: string,
  settings: ImageOptimizationSettings = DEFAULT_IMAGE_OPTIMIZATION_SETTINGS
): ImageOptimizationAnalysis {
  // Extract images from content
  let images = extractImages(content);
  
  // Analyze each image
  images = images.map(img => analyzeImage(img, settings));
  
  // Calculate metrics
  const metrics = calculateMetrics(images);
  
  // Collect all issues
  const issues = images.flatMap(img => img.issues);
  
  // Generate alt text suggestions for images without good alt text
  const altTextSuggestions = settings.suggestAltText
    ? images
        .filter(img => !img.alt || img.alt.trim() === '' || isGenericAltText(img.alt))
        .map(img => generateAltTextSuggestion(img, '', settings.targetKeywords))
    : [];
  
  // Generate recommendations
  const recommendations = generateRecommendations(images, metrics);
  
  // Generate summary
  const summary = generateSummary(metrics);
  
  // Quick wins
  const quickWins = recommendations
    .filter(r => r.effort === 'low')
    .slice(0, 3)
    .map(r => r.title);
  
  return {
    id: `img-analysis-${Date.now()}`,
    contentId: '',
    analyzedAt: new Date().toISOString(),
    
    images,
    totalImages: images.length,
    issues,
    altTextSuggestions,
    metrics,
    recommendations,
    summary,
    quickWins
  };
}

/**
 * Generate analysis summary
 */
function generateSummary(metrics: ImageOptimizationMetrics): string {
  if (metrics.totalImages === 0) {
    return 'No images found in the content.';
  }
  
  if (metrics.overallScore >= 90) {
    return `Excellent! ${metrics.totalImages} images are well-optimized with a score of ${metrics.overallScore}/100.`;
  } else if (metrics.overallScore >= 70) {
    return `Good image optimization (${metrics.overallScore}/100). ${metrics.imagesWithIssues} images need attention.`;
  } else if (metrics.overallScore >= 50) {
    return `Image optimization needs work (${metrics.overallScore}/100). ${metrics.criticalIssues} critical issues found.`;
  } else {
    return `Poor image optimization (${metrics.overallScore}/100). Significant improvements needed for ${metrics.imagesWithIssues} images.`;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Export image optimization report
 */
export function exportImageReport(
  analysis: ImageOptimizationAnalysis,
  format: 'json' | 'csv' | 'markdown' = 'markdown'
): string {
  if (format === 'json') {
    return JSON.stringify(analysis, null, 2);
  }
  
  if (format === 'csv') {
    const rows = [
      ['Image', 'Alt Text', 'Format', 'Status', 'Score', 'Issues'],
      ...analysis.images.map(img => [
        img.filename,
        img.alt || '(none)',
        IMAGE_FORMAT_INFO[img.format].label,
        img.status,
        img.score.toString(),
        img.issues.length.toString()
      ])
    ];
    return rows.map(row => row.join(',')).join('\n');
  }
  
  // Markdown format
  return `# Image Optimization Report

## Summary
${analysis.summary}

**Overall Score:** ${analysis.metrics.overallScore}/100

## Metrics

| Metric | Value |
|--------|-------|
| Total Images | ${analysis.metrics.totalImages} |
| Optimized | ${analysis.metrics.optimizedImages} |
| Need Work | ${analysis.metrics.imagesWithIssues} |
| Critical Issues | ${analysis.metrics.criticalIssues} |

### Alt Text
- With Alt: ${analysis.metrics.imagesWithAlt}
- Without Alt: ${analysis.metrics.imagesWithoutAlt}
- Empty Alt: ${analysis.metrics.imagesWithEmptyAlt}

### Performance
- Modern Formats: ${analysis.metrics.modernFormatImages}
- With Dimensions: ${analysis.metrics.imagesWithDimensions}
- With Lazy Load: ${analysis.metrics.imagesWithLazyLoad}

## Top Recommendations

${analysis.recommendations.slice(0, 5).map((r, i) => `${i + 1}. **${r.title}** (${r.priority})\n   ${r.description}`).join('\n\n')}

---
*Generated: ${analysis.analyzedAt}*
`;
}

