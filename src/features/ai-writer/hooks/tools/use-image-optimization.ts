/**
 * Image Optimization Hook
 * 
 * React hook for managing image optimization state and operations:
 * - Extract and analyze images from content
 * - Track optimization status and issues
 * - Apply optimizations (alt text, compression, etc.)
 * - Bulk operations support
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ImageInfo,
  ImageIssue,
  ImageOptimizationAnalysis,
  ImageOptimizationSettings,
  ImageOptimizationMetrics,
  AltTextSuggestion,
  ImageOptimizationRecommendation,
  OptimizationAction,
  ImageStatus,
  DEFAULT_IMAGE_OPTIMIZATION_SETTINGS
} from '@/src/features/ai-writer/types/tools/image-optimization.types';
import {
  analyzeImageOptimization,
  exportImageReport,
  generateAltTextSuggestion
} from '@/src/features/ai-writer/utils/tools/image-optimization';

interface UseImageOptimizationOptions {
  initialSettings?: Partial<ImageOptimizationSettings>;
  keyword?: string;
}

interface UseImageOptimizationReturn {
  // State
  analysis: ImageOptimizationAnalysis | null;
  isAnalyzing: boolean;
  settings: ImageOptimizationSettings;
  
  // Direct access to analysis data
  metrics: ImageOptimizationMetrics | null;
  images: ImageInfo[];
  issues: ImageIssue[];
  recommendations: ImageOptimizationRecommendation[];
  altSuggestions: AltTextSuggestion[];
  
  // Computed
  score: number;
  totalImages: number;
  optimizedCount: number;
  issueCount: number;
  criticalCount: number;
  needsWorkCount: number;
  
  // Images by status
  optimizedImages: ImageInfo[];
  criticalImages: ImageInfo[];
  needsWorkImages: ImageInfo[];
  
  // Issues by severity
  criticalIssues: ImageIssue[];
  warningIssues: ImageIssue[];
  suggestionIssues: ImageIssue[];
  
  // Actions
  analyze: (content: string, keyword?: string) => void;
  updateSettings: (settings: Partial<ImageOptimizationSettings>) => void;
  applyAltText: (imageId: string, altText: string) => void;
  applyBulkAction: (action: OptimizationAction, imageIds: string[]) => void;
  generateAltSuggestion: (image: ImageInfo, keyword: string) => AltTextSuggestion;
  exportReport: (format?: 'json' | 'csv' | 'markdown') => string | null;
  clearAnalysis: () => void;
  
  // Filtering
  filterByStatus: (status: ImageStatus | 'all') => ImageInfo[];
  filterBySeverity: (severity: 'critical' | 'warning' | 'suggestion' | 'all') => ImageIssue[];
  searchImages: (query: string) => ImageInfo[];
}

/**
 * Hook for image optimization
 */
export function useImageOptimization(options: UseImageOptimizationOptions = {}): UseImageOptimizationReturn {
  const [analysis, setAnalysis] = useState<ImageOptimizationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<ImageOptimizationSettings>({
    ...DEFAULT_IMAGE_OPTIMIZATION_SETTINGS,
    ...options.initialSettings
  });
  
  // Analyze content for images
  const analyze = useCallback((content: string, keyword?: string) => {
    setIsAnalyzing(true);
    
    // Simulate async analysis
    setTimeout(() => {
      try {
        const analysisSettings = {
          ...settings,
          targetKeywords: keyword ? [keyword] : (options.keyword ? [options.keyword] : settings.targetKeywords)
        };
        const result = analyzeImageOptimization(content, analysisSettings);
        setAnalysis(result);
      } catch (error) {
        console.error('Image analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 300);
  }, [options.keyword, settings]);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ImageOptimizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Apply alt text to an image
  const applyAltText = useCallback((imageId: string, altText: string) => {
    if (!analysis) return;
    
    setAnalysis(prev => {
      if (!prev) return null;
      
      const updatedImages = prev.images.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            alt: altText,
            status: 'optimized' as ImageStatus
          };
        }
        return img;
      });
      
      // Recalculate metrics
      const optimizedCount = updatedImages.filter(i => i.status === 'optimized').length;
      const criticalCount = updatedImages.filter(i => i.status === 'critical').length;
      const needsWorkCount = updatedImages.filter(i => i.status === 'needs_work').length;
      
      return {
        ...prev,
        images: updatedImages,
        metrics: {
          ...prev.metrics,
          optimizedImages: optimizedCount,
          score: Math.round((optimizedCount / updatedImages.length) * 100)
        }
      };
    });
  }, [analysis]);
  
  // Apply bulk action
  const applyBulkAction = useCallback((action: OptimizationAction, imageIds: string[]) => {
    if (!analysis) return;
    
    setAnalysis(prev => {
      if (!prev) return null;
      
      const updatedImages = prev.images.map(img => {
        if (imageIds.includes(img.id)) {
          // Apply action based on type
          switch (action) {
            case 'add_lazy_loading':
              return { ...img, lazyLoading: true };
            case 'mark_decorative':
              return { ...img, alt: '', isDecorative: true };
            default:
              return img;
          }
        }
        return img;
      });
      
      return { ...prev, images: updatedImages };
    });
  }, [analysis]);
  
  // Generate alt suggestion
  const generateAltSuggestion = useCallback((image: ImageInfo, keyword: string): AltTextSuggestion => {
    return generateAltTextSuggestion(image, keyword);
  }, []);
  
  // Export report
  const exportReport = useCallback((format: 'json' | 'csv' | 'markdown' = 'markdown'): string | null => {
    if (!analysis) return null;
    return exportImageReport(analysis, format);
  }, [analysis]);
  
  // Clear analysis
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);
  
  // Computed values
  const score = useMemo(() => analysis?.metrics.overallScore || 0, [analysis]);
  const totalImages = useMemo(() => analysis?.images.length || 0, [analysis]);
  const optimizedCount = useMemo(() => analysis?.metrics.optimizedImages || 0, [analysis]);
  const issueCount = useMemo(() => analysis?.issues.length || 0, [analysis]);
  const criticalCount = useMemo(() => 
    analysis?.images.filter(i => i.status === 'critical').length || 0, 
    [analysis]
  );
  const needsWorkCount = useMemo(() => 
    analysis?.images.filter(i => i.status === 'needs_work').length || 0, 
    [analysis]
  );
  
  // Direct access to analysis data
  const metrics = useMemo(() => analysis?.metrics || null, [analysis]);
  const images = useMemo(() => analysis?.images || [], [analysis]);
  const issues = useMemo(() => analysis?.issues || [], [analysis]);
  const recommendations = useMemo(() => analysis?.recommendations || [], [analysis]);
  const altSuggestions = useMemo(() => analysis?.altTextSuggestions || [], [analysis]);
  
  // Images by status
  const optimizedImages = useMemo(() => 
    analysis?.images.filter(i => i.status === 'optimized') || [], 
    [analysis]
  );
  const criticalImages = useMemo(() => 
    analysis?.images.filter(i => i.status === 'critical') || [], 
    [analysis]
  );
  const needsWorkImages = useMemo(() => 
    analysis?.images.filter(i => i.status === 'needs_work') || [], 
    [analysis]
  );
  
  // Issues by severity
  const criticalIssues = useMemo(() => 
    analysis?.issues.filter(i => i.severity === 'critical') || [], 
    [analysis]
  );
  const warningIssues = useMemo(() => 
    analysis?.issues.filter(i => i.severity === 'warning') || [], 
    [analysis]
  );
  const suggestionIssues = useMemo(() => 
    analysis?.issues.filter(i => i.severity === 'suggestion') || [], 
    [analysis]
  );
  
  // Filter by status
  const filterByStatus = useCallback((status: ImageStatus | 'all'): ImageInfo[] => {
    if (!analysis) return [];
    if (status === 'all') return analysis.images;
    return analysis.images.filter(i => i.status === status);
  }, [analysis]);
  
  // Filter by severity
  const filterBySeverity = useCallback((severity: 'critical' | 'warning' | 'suggestion' | 'all'): ImageIssue[] => {
    if (!analysis) return [];
    if (severity === 'all') return analysis.issues;
    return analysis.issues.filter(i => i.severity === severity);
  }, [analysis]);
  
  // Search images
  const searchImages = useCallback((query: string): ImageInfo[] => {
    if (!analysis) return [];
    const lowerQuery = query.toLowerCase();
    return analysis.images.filter(img => 
      img.src.toLowerCase().includes(lowerQuery) ||
      img.alt?.toLowerCase().includes(lowerQuery) ||
      img.title?.toLowerCase().includes(lowerQuery)
    );
  }, [analysis]);
  
  return {
    // State
    analysis,
    isAnalyzing,
    settings,
    
    // Direct access to analysis data
    metrics,
    images,
    issues,
    recommendations,
    altSuggestions,
    
    // Computed
    score,
    totalImages,
    optimizedCount,
    issueCount,
    criticalCount,
    needsWorkCount,
    
    // Images by status
    optimizedImages,
    criticalImages,
    needsWorkImages,
    
    // Issues by severity
    criticalIssues,
    warningIssues,
    suggestionIssues,
    
    // Actions
    analyze,
    updateSettings,
    applyAltText,
    applyBulkAction,
    generateAltSuggestion,
    exportReport,
    clearAnalysis,
    
    // Filtering
    filterByStatus,
    filterBySeverity,
    searchImages
  };
}

export default useImageOptimization;

