/**
 * useAIGeneration - AI Content Generation Hook
 * 
 * This hook handles all AI content generation logic:
 * - Full article generation (pillar, cluster, standalone)
 * - Typing animation with progress tracking
 * - Abort/cancel functionality
 * - Content chunking and streaming
 * 
 * Industry Standard: Single Responsibility Principle
 */

import { useState, useCallback, useRef } from "react"
import type { Editor } from "@tiptap/react"
import type { WriterContext, NLPKeyword } from "../types"
import { generateSlug } from "../utils"

// ============================================
// TYPES
// ============================================

export interface UseAIGenerationOptions {
  editor: Editor | null
  showNotification: (message: string) => void
  setTitle: (title: string) => void
  setSlug: (slug: string) => void
  setTargetKeyword: (keyword: string) => void
  setNlpKeywords: React.Dispatch<React.SetStateAction<NLPKeyword[]>>
}

export interface UseAIGenerationReturn {
  isGenerating: boolean
  progress: number
  generateArticle: (context: WriterContext) => Promise<void>
  abort: () => void
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function generateTitleFromKeyword(keyword: string, intent: string): string {
  const capitalizedKeyword = keyword
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  
  const lowerKeyword = keyword.toLowerCase()
  
  switch (intent) {
    case "commercial":
      if (lowerKeyword.startsWith("best ")) {
        return `${capitalizedKeyword} in ${new Date().getFullYear()} (Tested & Reviewed)`
      }
      return `Best ${capitalizedKeyword} in ${new Date().getFullYear()} (Tested & Reviewed)`
    case "transactional":
      return `${capitalizedKeyword} - Get Started Today`
    case "navigational":
      return `${capitalizedKeyword} - Official Guide`
    case "informational":
    default:
      if (lowerKeyword.startsWith("how to ")) {
        return `${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
      }
      if (lowerKeyword.startsWith("what ") || lowerKeyword.startsWith("why ") || lowerKeyword.startsWith("when ")) {
        return `${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
      }
      return `How to Use ${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
  }
}

function estimateWords(htmlOrText: string): number {
  const text = htmlOrText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return 0
  return text.split(" ").filter(Boolean).length
}

// ============================================
// HOOK
// ============================================

export function useAIGeneration(options: UseAIGenerationOptions): UseAIGenerationReturn {
  const { editor, showNotification, setTitle, setSlug, setTargetKeyword, setNlpKeywords } = options
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const abortRef = useRef(false)
  
  // ========================================
  // ABORT GENERATION
  // ========================================
  const abort = useCallback(() => {
    abortRef.current = true
  }, [])
  
  // ========================================
  // MAIN GENERATION FUNCTION
  // ========================================
  const generateArticle = useCallback(async (context: WriterContext) => {
    if (!editor) return
    
    // Reset abort flag
    abortRef.current = false
    setIsGenerating(true)
    setProgress(0)
    
    // 1. Update target keyword
    setTargetKeyword(context.keyword)
    
    // 2. Generate optimized title based on intent
    const newTitle = generateTitleFromKeyword(context.keyword, context.intent)
    setTitle(newTitle)
    
    // 3. Generate slug from keyword
    setSlug(generateSlug(context.keyword))
    
    showNotification("🤖 AI is generating your article...")
    
    // Helper function for typing animation
    const typeContent = async (chunks: string[], delayMs: number = 30) => {
      let fullContent = ""
      const totalChunks = chunks.length
      
      for (let i = 0; i < chunks.length; i++) {
        if (abortRef.current) break
        
        fullContent += chunks[i]
        editor.commands.setContent(fullContent)
        setProgress(Math.round(((i + 1) / totalChunks) * 100))
        
        const actualDelay = delayMs + Math.random() * 20
        await new Promise(resolve => setTimeout(resolve, actualDelay))
      }
      
      return fullContent
    }
    
    const pushChunk = (chunks: string[], html: string, wordCounter: { value: number }) => {
      chunks.push(html)
      wordCounter.value += estimateWords(html)
    }
    
    const paragraph = (inner: string) => `<p>${inner}</p>\n\n`
    
    // ========================================
    // PILLAR ARTICLE GENERATION
    // ========================================
    if (context.contentType === "pillar" && context.pillarData) {
      const { subKeywords } = context.pillarData
      const keyword = context.keyword
      const keywordCapitalized = capitalizeWords(keyword)
      const targetMinWords = 3000
      
      const h2Keywords = subKeywords.filter(k => k.placement === "h2")
      const h3Keywords = subKeywords.filter(k => k.placement === "h3")
      const faqKeywords = subKeywords.filter(k => k.placement === "faq")
      
      const contentChunks: string[] = []
      const wordCounter = { value: 0 }
      
      // Title
      pushChunk(contentChunks, `<h1>${newTitle}</h1>\n\n`, wordCounter)
      
      // Introduction
      pushChunk(contentChunks, paragraph(
        `In today's rapidly evolving digital landscape, <strong>${keywordCapitalized}</strong> has become an essential topic. ` +
        `Whether you're a beginner or experienced practitioner, this pillar guide takes you from fundamentals to execution.`
      ), wordCounter)
      
      pushChunk(contentChunks, paragraph(
        `This article is structured to provide sections, checklists, examples, and tables — all in a format that feels like AI-generated content in real-time.`
      ), wordCounter)
      
      // Quick Reference Table
      pushChunk(contentChunks, `<h2>📊 Quick Reference Table</h2>\n`, wordCounter)
      pushChunk(contentChunks,
        `<table>\n` +
        `<thead><tr><th>Focus</th><th>Best For</th><th>What To Do</th><th>Common Pitfall</th></tr></thead>\n` +
        `<tbody>` +
        `<tr><td>Strategy</td><td>Planning</td><td>Define goals, audience, and metrics</td><td>Writing without objective</td></tr>` +
        `<tr><td>Execution</td><td>Implementation</td><td>Follow checklist and iterate</td><td>Doing everything at once</td></tr>` +
        `<tr><td>Optimization</td><td>Growth</td><td>Measure outcomes and improve</td><td>Ignoring data</td></tr>` +
        `</tbody>\n</table>\n\n`,
        wordCounter
      )
      
      // Table of Contents
      pushChunk(contentChunks, `<h2>📋 What You'll Learn</h2>\n<ul>\n`, wordCounter)
      h2Keywords.slice(0, 10).forEach((kw, idx) => {
        pushChunk(contentChunks, `<li><strong>Section ${idx + 1}:</strong> ${capitalizeWords(kw.keyword)}</li>\n`, wordCounter)
      })
      pushChunk(contentChunks, `<li><strong>FAQ:</strong> Answers to common questions</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Conclusion:</strong> Key takeaways & next steps</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
      
      // Main H2 Sections
      h2Keywords.forEach((kw, idx) => {
        const sectionKeyword = capitalizeWords(kw.keyword)
        
        pushChunk(contentChunks, `<h2>${idx + 1}. ${sectionKeyword}</h2>\n`, wordCounter)
        
        pushChunk(contentChunks, paragraph(
          `Understanding ${kw.keyword} is crucial for mastering ${keyword}. ` +
          `This section covers concepts, applications, and decision points.`
        ), wordCounter)
        
        pushChunk(contentChunks, `<p><strong>Key aspects:</strong></p>\n<ul>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Foundation:</strong> Core principles</li>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Implementation:</strong> Repeatable process</li>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Quality checks:</strong> Validation methods</li>\n`, wordCounter)
        pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
        
        // Add H3 subsections
        const relatedH3 = h3Keywords.slice(idx * 2, (idx * 2) + 2)
        relatedH3.forEach(h3 => {
          pushChunk(contentChunks, `<h3>${capitalizeWords(h3.keyword)}</h3>\n`, wordCounter)
          pushChunk(contentChunks, paragraph(
            `Focus on clarity and intent. Ask: what is the reader trying to achieve? ` +
            `Write to answer that outcome directly with examples and steps.`
          ), wordCounter)
        })
        
        pushChunk(contentChunks, paragraph(
          `💡 <strong>Pro Tip:</strong> Treat ${kw.keyword} like a system. Document what you did, why, and what changed.`
        ), wordCounter)
      })
      
      // Checklist
      pushChunk(contentChunks, `<h2>✅ Implementation Checklist</h2>\n<ul>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Define the primary goal for ${keyword}</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Write a clear reader promise</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Ensure every H2 answers a question</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Add examples and steps</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Include tables for comparisons</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
      
      // FAQ Section
      if (faqKeywords.length > 0) {
        pushChunk(contentChunks, `<h2>❓ Frequently Asked Questions</h2>\n`, wordCounter)
        pushChunk(contentChunks, paragraph(`SEO-friendly answers about ${keyword}:`), wordCounter)
        
        faqKeywords.slice(0, 10).forEach((kw, idx) => {
          const q = capitalizeWords(kw.keyword.slice(0, 30))
          const questionVariants = [
            `What is ${q}?`,
            `How does ${q} work?`,
            `Is ${q} worth it?`,
            `How to start with ${q}?`,
            `What are the benefits of ${q}?`,
          ]
          const question = questionVariants[idx % questionVariants.length]
          
          const faqBlock =
            `<blockquote class="faq-item">\n` +
            `<p><strong>Q${idx + 1}: ${question}</strong> <span style="float:right;">▼</span></p>\n` +
            `<p>In simple terms, ${q} is a practical approach that helps get clear outcomes with less confusion.</p>\n` +
            `<p><em>Start small: define one goal, follow a checklist, and improve based on what you measure.</em></p>\n` +
            `</blockquote>\n\n`
          
          pushChunk(contentChunks, faqBlock, wordCounter)
        })
      }
      
      // Fill to minimum words
      let safetyIterations = 0
      while (wordCounter.value < targetMinWords && safetyIterations < 12) {
        safetyIterations += 1
        pushChunk(contentChunks, `<h2>🔍 Deep Dive: Advanced Concepts (${safetyIterations})</h2>\n`, wordCounter)
        pushChunk(contentChunks, paragraph(
          `Advanced mastery of ${keyword} comes from small improvements across structure, clarity, and measurement.`
        ), wordCounter)
        pushChunk(contentChunks, paragraph(
          `Try this: choose one section and rewrite it with a clearer promise, checklist, and example.`
        ), wordCounter)
      }
      
      // Conclusion
      pushChunk(contentChunks, `<h2>🎯 Conclusion</h2>\n`, wordCounter)
      pushChunk(contentChunks, paragraph(
        `We've covered comprehensive ground in this guide to ${keyword}. ` +
        `You now have structure, strategies, and templates to implement what you've learned.`
      ), wordCounter)
      
      pushChunk(contentChunks, `<p><strong>Key takeaways:</strong></p>\n<ol>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Start with fundamentals before advanced tactics</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Use structure: H2/H3, examples, and checklists</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Include tables when helpful</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Measure results and iterate</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ol>\n\n`, wordCounter)
      
      await typeContent(contentChunks, 8)
      
      if (!abortRef.current) {
        showNotification(`✅ Pillar article generated! ${targetMinWords}+ words 🚀`)
      }
    }
    
    // ========================================
    // CLUSTER ARTICLE GENERATION
    // ========================================
    else if (context.contentType === "cluster" && context.clusterData) {
      const { pillarKeyword, pillarUrl, linkAnchor, recommendedLength } = context.clusterData
      const keyword = context.keyword
      const keywordCapitalized = capitalizeWords(keyword)
      const targetMinWords = 1600
      
      const contentChunks: string[] = []
      const wordCounter = { value: 0 }
      
      pushChunk(contentChunks, `<h1>${newTitle}</h1>\n\n`, wordCounter)
      
      pushChunk(contentChunks, paragraph(
        `If you're looking to master <strong>${keywordCapitalized}</strong>, you've come to the right place. ` +
        `For full context, see our pillar guide: <a href="${pillarUrl || '#'}">${linkAnchor || pillarKeyword}</a>.`
      ), wordCounter)
      
      // Quick table
      pushChunk(contentChunks, `<h2>📌 Quick Checklist</h2>\n`, wordCounter)
      pushChunk(contentChunks,
        `<table>\n` +
        `<thead><tr><th>Step</th><th>Action</th><th>Output</th></tr></thead>\n` +
        `<tbody>` +
        `<tr><td>1</td><td>Define intent for ${keyword}</td><td>One-sentence promise</td></tr>` +
        `<tr><td>2</td><td>Write clear structure</td><td>Skimmable outline</td></tr>` +
        `<tr><td>3</td><td>Add examples</td><td>Trust-building content</td></tr>` +
        `</tbody>\n</table>\n\n`,
        wordCounter
      )
      
      pushChunk(contentChunks, `<h2>What is ${keywordCapitalized}?</h2>\n`, wordCounter)
      pushChunk(contentChunks, paragraph(
        `${keywordCapitalized} is a focused subset of ${pillarKeyword} designed for targeted results.`
      ), wordCounter)
      
      pushChunk(contentChunks, `<h2>How to Get Started</h2>\n<ol>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Assess what you already have</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Define a single primary metric</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Create a simple checklist</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Execute one change at a time</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Review and improve weekly</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ol>\n\n`, wordCounter)
      
      pushChunk(contentChunks, `<h2>Benefits</h2>\n<ul>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Higher clarity and faster execution</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Better decision-making through measurement</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>More predictable outcomes</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
      
      pushChunk(contentChunks, `<h2>Common Mistakes to Avoid</h2>\n<ul>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Overcomplicating the first version</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Skipping examples</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Not linking back to pillar</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
      
      // Fill to minimum words
      let safetyIterations = 0
      while (wordCounter.value < targetMinWords && safetyIterations < 10) {
        safetyIterations += 1
        pushChunk(contentChunks, `<h2>Extra Depth (${safetyIterations})</h2>\n`, wordCounter)
        pushChunk(contentChunks, paragraph(
          `This section adds depth to reach ${targetMinWords}+ words. ` +
          `In a real API, the model would fill with niche-specific details.`
        ), wordCounter)
      }
      
      pushChunk(contentChunks, `<h2>Conclusion</h2>\n`, wordCounter)
      pushChunk(contentChunks, paragraph(
        `${keywordCapitalized} is a powerful tool in your ${pillarKeyword} toolkit. ` +
        `For more coverage, revisit <a href="${pillarUrl || '#'}">${linkAnchor || pillarKeyword}</a>.`
      ), wordCounter)
      
      await typeContent(contentChunks, 10)
      
      if (!abortRef.current) {
        showNotification(`✅ Cluster article generated! ${Math.max(targetMinWords, recommendedLength)}+ words 🔗`)
      }
    }
    
    // ========================================
    // STANDALONE ARTICLE GENERATION
    // ========================================
    else {
      const keyword = context.keyword
      const keywordCapitalized = capitalizeWords(keyword)
      
      const contentChunks: string[] = []
      
      contentChunks.push(`<h1>${newTitle}</h1>\n\n`)
      contentChunks.push(`<p>Welcome to this comprehensive guide on ${keyword}. ` +
        `We'll explore everything you need to succeed.</p>\n\n`)
      
      contentChunks.push(`<h2>What is ${keywordCapitalized}?</h2>\n`)
      contentChunks.push(`<p>${keywordCapitalized} is a concept that has gained significant attention. ` +
        `It represents a systematic approach to achieving specific goals.</p>\n\n`)
      
      contentChunks.push(`<h2>Key Features</h2>\n<ul>\n`)
      contentChunks.push(`<li><strong>Flexibility:</strong> Adaptable to various contexts</li>\n`)
      contentChunks.push(`<li><strong>Scalability:</strong> Works for individuals and organizations</li>\n`)
      contentChunks.push(`<li><strong>Measurability:</strong> Clear metrics for progress</li>\n`)
      contentChunks.push(`</ul>\n\n`)
      
      contentChunks.push(`<h2>How to Get Started</h2>\n<ol>\n`)
      contentChunks.push(`<li>Define your objectives</li>\n`)
      contentChunks.push(`<li>Gather resources and tools</li>\n`)
      contentChunks.push(`<li>Create an implementation plan</li>\n`)
      contentChunks.push(`<li>Execute and monitor progress</li>\n`)
      contentChunks.push(`</ol>\n\n`)
      
      contentChunks.push(`<h2>Conclusion</h2>\n`)
      contentChunks.push(`<p>${keywordCapitalized} offers tremendous potential. ` +
        `Start with the basics above, and you'll be on your way to mastery.</p>`)
      
      await typeContent(contentChunks, 25)
      
      if (!abortRef.current) {
        showNotification(`✅ Article generated! Start editing 🚀`)
      }
    }
    
    // Update NLP keywords from context
    if (context.pillarData?.subKeywords) {
      const newNLPKeywords: NLPKeyword[] = context.pillarData.subKeywords.map(sk => ({
        text: sk.keyword,
        used: false
      }))
      setNlpKeywords(newNLPKeywords)
    }
    
    setIsGenerating(false)
    setProgress(100)
    
  }, [editor, showNotification, setTitle, setSlug, setTargetKeyword, setNlpKeywords])
  
  return {
    isGenerating,
    progress,
    generateArticle,
    abort,
  }
}

export default useAIGeneration
