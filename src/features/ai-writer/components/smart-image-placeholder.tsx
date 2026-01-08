// ============================================
// AI WRITER - Smart Image Placeholder Component
// ============================================
// Includes AI prompt, ALT text, SEO keywords

"use client"

import { useState, useCallback, useEffect } from "react"
import { 
  Loader2, 
  Upload, 
  XCircle, 
  Sparkles, 
  Copy, 
  Check,
  Image as ImageIcon,
  FileText,
  Tag,
  ChevronDown,
  ChevronUp,
  Wand2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SmartImagePlaceholder as SmartImagePlaceholderType } from "../types"

interface SmartImagePlaceholderProps {
  id: string
  position: number
  type: SmartImagePlaceholderType["type"]
  keyword: string // Main keyword for context
  sectionTitle?: string // H2/H3 this image is under
  onUpload: (id: string, url: string) => void
  onDataChange?: (id: string, data: Partial<SmartImagePlaceholderType>) => void
  onRemove?: (id: string) => void
}

// AI Prompt templates based on image type
const PROMPT_TEMPLATES: Record<SmartImagePlaceholderType["type"], (keyword: string, section: string) => string> = {
  hero: (keyword, section) => 
    `A professional hero image for a blog post about "${keyword}". Modern, clean design with subtle tech elements, gradient lighting in blue and emerald tones, minimalist style, high quality, 4K resolution, suitable for web header.`,
  
  screenshot: (keyword, section) => 
    `Screenshot placeholder: Capture the main interface/dashboard of the tool mentioned in "${section}". Show key features highlighted, clean browser frame, professional appearance.`,
  
  infographic: (keyword, section) => 
    `A modern infographic illustrating "${section}" in the context of ${keyword}. Clean vector style, data visualization elements, professional color scheme with emerald and blue accents, easy to read typography, white background.`,
  
  diagram: (keyword, section) => 
    `A technical diagram showing the process/workflow of "${section}" for ${keyword}. Clean flowchart style, modern icons, connecting arrows, professional appearance, light background, clear labels.`,
  
  chart: (keyword, section) => 
    `A professional data chart/graph showing statistics related to "${section}" and ${keyword}. Modern design, gradient colors, clear axis labels, legend included, white background.`,
  
  comparison: (keyword, section) => 
    `A side-by-side comparison visual for "${section}" about ${keyword}. Clean table/grid layout, checkmarks and X marks, professional design, easy to scan, modern color scheme.`,
  
  process: (keyword, section) => 
    `A step-by-step process illustration for "${section}" related to ${keyword}. Numbered steps, clean icons for each step, connecting flow lines, modern flat design, professional appearance.`,
}

// Generate ALT text based on context
function generateAltText(keyword: string, type: string, section: string): string {
  const typeDescriptions: Record<string, string> = {
    hero: `Featured image for ${keyword} guide`,
    screenshot: `Screenshot showing ${section} interface`,
    infographic: `Infographic explaining ${section} for ${keyword}`,
    diagram: `Diagram illustrating ${section} process`,
    chart: `Data chart showing ${section} statistics`,
    comparison: `Comparison chart for ${section}`,
    process: `Step-by-step process for ${section}`,
  }
  return typeDescriptions[type] || `Image for ${keyword} - ${section}`
}

// Generate SEO keywords for image
function generateImageKeywords(keyword: string, section: string): string[] {
  const words = keyword.toLowerCase().split(" ")
  const sectionWords = section.toLowerCase().split(" ").filter(w => w.length > 3)
  
  return [
    keyword.toLowerCase(),
    ...words.slice(0, 2),
    ...sectionWords.slice(0, 2),
    `${words[0]} ${new Date().getFullYear()}`,
  ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
}

// Generate filename
function generateFilename(keyword: string, type: string): string {
  const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return `${slug}-${type}-${new Date().getFullYear()}.webp`
}

export function SmartImagePlaceholder({
  id,
  position,
  type,
  keyword,
  sectionTitle = "",
  onUpload,
  onDataChange,
  onRemove,
}: SmartImagePlaceholderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  
  // SEO fields
  const [prompt, setPrompt] = useState(() => 
    PROMPT_TEMPLATES[type]?.(keyword, sectionTitle) || ""
  )
  const [altText, setAltText] = useState(() => 
    generateAltText(keyword, type, sectionTitle)
  )
  const [seoKeywords, setSeoKeywords] = useState<string[]>(() => 
    generateImageKeywords(keyword, sectionTitle)
  )
  const [filename, setFilename] = useState(() => 
    generateFilename(keyword, type)
  )
  
  // Update generated content when keyword/section changes
  useEffect(() => {
    if (!imageUrl) {
      setPrompt(PROMPT_TEMPLATES[type]?.(keyword, sectionTitle) || "")
      setAltText(generateAltText(keyword, type, sectionTitle))
      setSeoKeywords(generateImageKeywords(keyword, sectionTitle))
      setFilename(generateFilename(keyword, type))
    }
  }, [keyword, sectionTitle, type, imageUrl])
  
  // Notify parent of data changes
  useEffect(() => {
    onDataChange?.(id, {
      prompt,
      altText,
      seoKeywords,
      suggestedFilename: filename,
    })
  }, [id, prompt, altText, seoKeywords, filename, onDataChange])

  const handleFileUpload = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsUploading(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const url = URL.createObjectURL(file)
        setImageUrl(url)
        setIsUploading(false)
        onUpload(id, url)
      }
    }
    input.click()
  }, [id, onUpload])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [prompt])

  const handleRemove = useCallback(() => {
    setImageUrl(null)
    onRemove?.(id)
  }, [id, onRemove])

  // Type labels and icons
  const typeInfo: Record<string, { label: string; color: string }> = {
    hero: { label: "Hero Image", color: "text-amber-400" },
    screenshot: { label: "Screenshot", color: "text-blue-400" },
    infographic: { label: "Infographic", color: "text-emerald-400" },
    diagram: { label: "Diagram", color: "text-purple-400" },
    chart: { label: "Chart/Graph", color: "text-cyan-400" },
    comparison: { label: "Comparison", color: "text-orange-400" },
    process: { label: "Process Flow", color: "text-pink-400" },
  }

  const currentType = typeInfo[type] || { label: "Image", color: "text-slate-400" }

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700">
            <ImageIcon className={cn("h-4 w-4", currentType.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Image #{position}</span>
              <Badge variant="outline" className={cn("text-xs", currentType.color, "border-current/30")}>
                {currentType.label}
              </Badge>
            </div>
            {sectionTitle && (
              <p className="text-xs text-muted-foreground">Section: {sectionTitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Image Upload Area */}
          <div
            onClick={!imageUrl ? handleFileUpload : undefined}
            className={cn(
              "relative w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center transition-all",
              imageUrl 
                ? "border-emerald-500/30 bg-slate-900/50" 
                : "border-slate-600 bg-slate-900/30 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900/50"
            )}
          >
            {imageUrl ? (
              <>
                <img src={imageUrl} alt={altText} className="max-h-full max-w-full object-contain rounded" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setImageUrl(null); }}
                  className="absolute top-2 right-2 h-8 gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </>
            ) : isUploading ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 × 630px</p>
              </div>
            )}
          </div>

          {/* AI Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-purple-400" />
                AI Image Prompt (for Midjourney/DALL-E)
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPrompt}
                className="h-7 px-2 gap-1 text-xs"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="AI image generation prompt..."
              className="min-h-[80px] text-sm bg-slate-900/50 border-slate-700 resize-none"
            />
          </div>

          {/* ALT Text Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              ALT Text (SEO Optimized)
              <span className="ml-auto text-muted-foreground">
                {altText.length}/125
              </span>
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive alt text for accessibility and SEO..."
              className={cn(
                "text-sm bg-slate-900/50 border-slate-700",
                altText.length > 125 && "border-amber-500/50"
              )}
              maxLength={150}
            />
            {altText.toLowerCase().includes(keyword.toLowerCase()) ? (
              <p className="text-xs text-emerald-400">✓ Contains target keyword</p>
            ) : (
              <p className="text-xs text-amber-400">⚠ Consider adding target keyword: "{keyword}"</p>
            )}
          </div>

          {/* SEO Keywords Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              Image SEO Keywords
            </label>
            <div className="flex flex-wrap gap-1.5">
              {seoKeywords.map((kw, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs bg-slate-900/50 border-slate-600 text-slate-300 cursor-pointer hover:bg-slate-800"
                  onClick={() => setSeoKeywords(seoKeywords.filter((_, idx) => idx !== i))}
                >
                  {kw}
                  <XCircle className="h-3 w-3 ml-1 opacity-50 hover:opacity-100" />
                </Badge>
              ))}
              <Input
                placeholder="+ Add keyword"
                className="w-24 h-6 text-xs bg-transparent border-dashed border-slate-600 px-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    setSeoKeywords([...seoKeywords, e.currentTarget.value])
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>
          </div>

          {/* Filename Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Suggested Filename
            </label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="image-filename.webp"
              className="bg-slate-900/50 border-slate-700 font-mono text-xs"
            />
          </div>
        </div>
      )}
    </Card>
  )
}
