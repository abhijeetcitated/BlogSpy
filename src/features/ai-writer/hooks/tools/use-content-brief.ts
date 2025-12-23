// =============================================================================
// USE CONTENT BRIEF HOOK
// =============================================================================
// Hook for managing content brief generation and state
// Integrates with SERP analysis and AI for brief generation
// =============================================================================

'use client';

import { useState, useCallback, useMemo } from 'react';

import type {
  ContentBrief,
  BriefGenerationOptions,
  GenerationProgress,
  GenerationStage,
  BriefTab,
} from '@/src/features/ai-writer/types/tools/content-brief.types';

import {
  generateContentBrief,
  type CompetitorData,
} from '@/src/features/ai-writer/utils/tools/content-brief';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UseContentBriefOptions {
  /** Auto-generate brief when keyword changes */
  autoGenerate?: boolean;
  /** Callback when brief is generated */
  onBriefGenerated?: (brief: ContentBrief) => void;
  /** Callback on generation error */
  onError?: (error: string) => void;
}

export interface UseContentBriefReturn {
  // State
  brief: ContentBrief | null;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  error: string | null;
  
  // Actions
  generateBrief: (keyword: string, options?: Partial<BriefGenerationOptions>) => Promise<ContentBrief>;
  clearBrief: () => void;
  updateKeyword: (keyword: string) => void;
  
  // Export
  exportBrief: (format: 'pdf' | 'docx' | 'markdown' | 'json') => Promise<void>;
  copyToEditor: (content: string) => void;
  
  // Tab management
  activeTab: BriefTab;
  setActiveTab: (tab: BriefTab) => void;
}

// -----------------------------------------------------------------------------
// Mock Data Generator
// -----------------------------------------------------------------------------

function generateMockCompetitors(keyword: string): CompetitorData[] {
  const mockCompetitors: CompetitorData[] = [];
  const domains = [
    'authoritysite.com',
    'expertblog.org',
    'industryleader.com',
    'topguide.io',
    'bestpractices.net',
    'masterclass.edu',
    'proinsights.com',
    'ultimateguide.co',
    'deepdive.blog',
    'comprehensiveresource.com'
  ];
  
  for (let i = 0; i < 10; i++) {
    const wordCount = 1500 + Math.round(Math.random() * 3000);
    const headingCount = Math.floor(wordCount / 300);
    
    mockCompetitors.push({
      url: `https://${domains[i]}/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
      title: generateMockTitle(keyword, i),
      content: generateMockContent(keyword, wordCount),
      wordCount,
      headings: generateMockHeadings(keyword, headingCount),
      terms: generateMockTerms(keyword),
      images: Math.floor(wordCount / 400),
      links: {
        internal: 3 + Math.floor(Math.random() * 8),
        external: 2 + Math.floor(Math.random() * 6)
      },
      rank: i + 1
    });
  }
  
  return mockCompetitors;
}

function generateMockTitle(keyword: string, index: number): string {
  const templates = [
    `The Ultimate Guide to ${keyword} (${new Date().getFullYear()})`,
    `How to Master ${keyword}: A Complete Guide`,
    `${keyword}: Everything You Need to Know`,
    `Top 10 ${keyword} Tips for Success`,
    `${keyword} Explained: From Beginner to Expert`,
    `The Complete ${keyword} Handbook`,
    `${keyword} Best Practices: Expert Guide`,
    `Understanding ${keyword}: A Deep Dive`,
    `${keyword} Made Simple: Step-by-Step`,
    `Your ${keyword} Success Blueprint`
  ];
  
  return templates[index % templates.length];
}

function generateMockContent(keyword: string, wordCount: number): string {
  // Generate mock content with keyword mentions
  const sentences = [
    `Understanding ${keyword} is essential for success.`,
    `Many experts recommend focusing on ${keyword} best practices.`,
    `When it comes to ${keyword}, there are several key factors to consider.`,
    `The importance of ${keyword} cannot be overstated.`,
    `Implementing ${keyword} strategies requires careful planning.`
  ];
  
  let content = '';
  while (content.split(' ').length < wordCount) {
    content += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
  }
  
  return content;
}

function generateMockHeadings(keyword: string, count: number): { level: number; text: string }[] {
  const h2Templates = [
    `What is ${keyword}?`,
    `Why ${keyword} Matters`,
    `How to Get Started with ${keyword}`,
    `${keyword} Best Practices`,
    `Common ${keyword} Mistakes`,
    `Advanced ${keyword} Strategies`,
    `${keyword} Tools and Resources`,
    `Measuring ${keyword} Success`,
    `Future of ${keyword}`,
    `Frequently Asked Questions`
  ];
  
  const h3Templates = [
    'Key Benefits',
    'Step-by-Step Guide',
    'Expert Tips',
    'Case Studies',
    'Implementation Tips'
  ];
  
  const headings: { level: number; text: string }[] = [];
  
  for (let i = 0; i < count; i++) {
    if (i < h2Templates.length && Math.random() > 0.3) {
      headings.push({ level: 2, text: h2Templates[i] });
    } else {
      headings.push({ 
        level: 3, 
        text: h3Templates[Math.floor(Math.random() * h3Templates.length)]
      });
    }
  }
  
  return headings;
}

function generateMockTerms(keyword: string): string[] {
  const keywordWords = keyword.toLowerCase().split(' ');
  const relatedTerms = [
    ...keywordWords,
    `${keyword} guide`,
    `${keyword} tips`,
    `${keyword} examples`,
    `${keyword} tutorial`,
    `best ${keyword}`,
    `${keyword} strategies`,
    `${keyword} techniques`,
    `${keyword} methods`,
    `${keyword} benefits`,
    `${keyword} tools`,
    'best practices',
    'step by step',
    'how to',
    'complete guide',
    'expert tips',
    'case study',
    'success',
    'results',
    'strategies'
  ];
  
  return relatedTerms;
}

// -----------------------------------------------------------------------------
// Hook Implementation
// -----------------------------------------------------------------------------

export function useContentBrief(options: UseContentBriefOptions = {}): UseContentBriefReturn {
  const {
    onBriefGenerated,
    onError,
  } = options;
  
  // State
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<BriefTab>('overview');
  
  // Simulate progress stages
  const simulateProgress = useCallback(async (): Promise<void> => {
    const stages: { stage: GenerationStage; message: string; duration: number }[] = [
      { stage: 'initializing', message: 'Initializing brief generation...', duration: 300 },
      { stage: 'analyzing-serp', message: 'Analyzing search results...', duration: 500 },
      { stage: 'extracting-competitors', message: 'Extracting competitor data...', duration: 600 },
      { stage: 'analyzing-content', message: 'Analyzing competitor content...', duration: 800 },
      { stage: 'generating-outline', message: 'Generating content outline...', duration: 500 },
      { stage: 'extracting-terms', message: 'Extracting key terms...', duration: 400 },
      { stage: 'gathering-questions', message: 'Gathering questions...', duration: 400 },
      { stage: 'calculating-metrics', message: 'Calculating metrics...', duration: 300 },
      { stage: 'finalizing', message: 'Finalizing brief...', duration: 200 },
    ];
    
    let totalProgress = 0;
    const progressPerStage = 100 / stages.length;
    
    for (const stageInfo of stages) {
      setProgress({
        stage: stageInfo.stage,
        progress: totalProgress,
        message: stageInfo.message,
        startedAt: new Date()
      });
      
      await new Promise(resolve => setTimeout(resolve, stageInfo.duration));
      totalProgress += progressPerStage;
    }
    
    setProgress({
      stage: 'finalizing',
      progress: 100,
      message: 'Brief ready!',
      startedAt: new Date()
    });
  }, []);
  
  // Generate brief
  const generateBrief = useCallback(async (
    keywordInput: string,
    briefOptions?: Partial<BriefGenerationOptions>
  ): Promise<ContentBrief> => {
    setIsGenerating(true);
    setError(null);
    setKeyword(keywordInput);
    
    try {
      // Start progress simulation
      const progressPromise = simulateProgress();
      
      // Generate mock competitors (in production, this would fetch from SERP API)
      const competitors = generateMockCompetitors(keywordInput);
      
      // Generate the brief
      const newBrief = generateContentBrief(
        keywordInput,
        competitors,
        briefOptions
      );
      
      // Wait for progress to complete
      await progressPromise;
      
      setBrief(newBrief);
      setIsGenerating(false);
      setProgress(null);
      
      onBriefGenerated?.(newBrief);
      return newBrief;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate brief';
      setError(errorMessage);
      setIsGenerating(false);
      setProgress(null);
      onError?.(errorMessage);
      throw err;
    }
  }, [simulateProgress, onBriefGenerated, onError]);
  
  // Clear brief
  const clearBrief = useCallback(() => {
    setBrief(null);
    setKeyword('');
    setError(null);
    setProgress(null);
  }, []);
  
  // Update keyword
  const updateKeyword = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);
  
  // Export brief
  const exportBrief = useCallback(async (format: 'pdf' | 'docx' | 'markdown' | 'json') => {
    if (!brief) return;
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    switch (format) {
      case 'markdown':
        content = generateMarkdownExport(brief);
        filename = `content-brief-${brief.keyword.replace(/\s+/g, '-')}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = JSON.stringify(brief, null, 2);
        filename = `content-brief-${brief.keyword.replace(/\s+/g, '-')}.json`;
        mimeType = 'application/json';
        break;
      default:
        console.log(`Export format ${format} not yet implemented`);
        return;
    }
    
    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [brief]);
  
  // Copy to editor
  const copyToEditor = useCallback((content: string) => {
    // This would integrate with the editor in production
    navigator.clipboard.writeText(content);
    console.log('Copied to clipboard:', content);
  }, []);
  
  return {
    brief,
    isGenerating,
    progress,
    error,
    generateBrief,
    clearBrief,
    updateKeyword,
    exportBrief,
    copyToEditor,
    activeTab,
    setActiveTab,
  };
}

// -----------------------------------------------------------------------------
// Export Helpers
// -----------------------------------------------------------------------------

function generateMarkdownExport(brief: ContentBrief): string {
  let markdown = `# Content Brief: ${brief.keyword}\n\n`;
  
  markdown += `## Overview\n\n`;
  markdown += `- **Title:** ${brief.overview.title}\n`;
  markdown += `- **Meta Description:** ${brief.overview.metaDescription}\n`;
  markdown += `- **Search Intent:** ${brief.overview.searchIntent}\n`;
  markdown += `- **Difficulty:** ${brief.overview.difficulty}\n`;
  markdown += `- **Target Word Count:** ${brief.guidelines.wordCount.recommended}\n`;
  markdown += `- **Content Type:** ${brief.overview.contentType}\n\n`;
  
  markdown += `## Suggested Outline\n\n`;
  brief.outline.sections.forEach(section => {
    const headingLevel = '#'.repeat(section.level + 1);
    markdown += `${headingLevel} ${section.heading}\n`;
    markdown += `- Target: ${section.wordCountTarget} words\n`;
    if (section.mustIncludeTerms.length > 0) {
      markdown += `- Must Include: ${section.mustIncludeTerms.join(', ')}\n`;
    }
    markdown += `\n`;
  });
  
  markdown += `## Key Terms\n\n`;
  markdown += `### Primary Terms\n`;
  brief.terms.primary.forEach(term => {
    markdown += `- **${term.term}** (target: ${term.targetCount}x)\n`;
  });
  markdown += `\n### Secondary Terms\n`;
  brief.terms.secondary.slice(0, 10).forEach(term => {
    markdown += `- ${term.term} (${term.suggestedCount.min}-${term.suggestedCount.max}x)\n`;
  });
  
  markdown += `\n## Questions to Answer\n\n`;
  brief.questions.paaQuestions.forEach(q => {
    markdown += `- ${q.question}\n`;
  });
  
  markdown += `\n## Guidelines\n\n`;
  markdown += `- **Word Count:** ${brief.guidelines.wordCount.minimum} - ${brief.guidelines.wordCount.maximum} words\n`;
  markdown += `- **H2 Headings:** ${brief.guidelines.structure.h2Count.min} - ${brief.guidelines.structure.h2Count.max}\n`;
  markdown += `- **Images:** ${brief.guidelines.media.images.min} - ${brief.guidelines.media.images.recommended}\n`;
  markdown += `- **Internal Links:** ${brief.guidelines.linking.internalLinks.min} - ${brief.guidelines.linking.internalLinks.max}\n`;
  markdown += `- **External Links:** ${brief.guidelines.linking.externalLinks.min} - ${brief.guidelines.linking.externalLinks.max}\n`;
  
  return markdown;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default useContentBrief;

