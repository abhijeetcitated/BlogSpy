// ============================================
// AI WRITER - Featured Image Placeholder Component
// ============================================
// Enhanced with AI prompt, ALT text, SEO suggestions

"use client"

import { useState, useCallback, useEffect } from "react"
import { 
  Loader2, 
  Upload, 
  XCircle, 
  Wand2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ImagePlaceholderProps {
  onUpload: (url: string) => void
  keyword?: string
  title?: string
}

// Generate AI prompt for featured image
function generatePrompt(keyword: string, title: string): string {
  if (!keyword) return ""
  return `A professional hero image for a blog post about "${keyword}". Modern, clean design with subtle tech elements, gradient lighting in blue and emerald tones, minimalist style, high quality, 4K resolution, suitable for web header. Article title: "${title}"`
}

// Generate ALT text
function generateAltText(keyword: string, title: string): string {
  if (!keyword) return "Featured image"
  return `Featured image for ${title || keyword} - comprehensive guide`
}

// Generate filename suggestion
function generateFilename(keyword: string): string {
  if (!keyword) return "featured-image.webp"
  const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return `${slug}-featured-${new Date().getFullYear()}.webp`
}

// Generate SEO keywords for image
function generateImageKeywords(keyword: string): string[] {
  if (!keyword) return []
  const words = keyword.toLowerCase().split(" ")
  return [
    keyword.toLowerCase(),
    ...words.slice(0, 2),
    `${words[0]} ${new Date().getFullYear()}`,
  ].filter((v, i, a) => a.indexOf(v) === i)
}

export function ImagePlaceholder({ onUpload, keyword = "", title = "" }: ImagePlaceholderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  
  // SEO fields
  const [prompt, setPrompt] = useState(() => generatePrompt(keyword, title))
  const [altText, setAltText] = useState(() => generateAltText(keyword, title))
  const [filename, setFilename] = useState(() => generateFilename(keyword))
  const [seoKeywords, setSeoKeywords] = useState<string[]>(() => generateImageKeywords(keyword))
  
  // Update when keyword/title changes
  useEffect(() => {
    if (!imageUrl) {
      setPrompt(generatePrompt(keyword, title))
      setAltText(generateAltText(keyword, title))
      setFilename(generateFilename(keyword))
      setSeoKeywords(generateImageKeywords(keyword))
    }
  }, [keyword, title, imageUrl])

  const handleClick = useCallback(() => {
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
        onUpload(url)
      }
    }
    input.click()
  }, [onUpload])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [prompt])

  return (
    <div className="w-full bg-card/30 rounded-lg mb-8 border border-border overflow-hidden">
      {/* Image Preview / Upload Area */}
      {imageUrl ? (
        <div className="relative w-full h-64">
          <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
          <button
            onClick={() => setImageUrl(null)}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
          {/* SEO Badge */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-xs">
              <Tag className="h-3 w-3 mr-1" />
              ALT: {altText.slice(0, 30)}...
            </Badge>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="relative w-full h-48 flex items-center justify-center cursor-pointer hover:bg-card/50 transition-all group"
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Upload className="w-7 h-7 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                Click to upload Featured Image
              </p>
              <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 × 630px</p>
            </div>
          )}
        </div>
      )}
      
      {/* SEO Details Toggle */}
      {keyword && (
        <div className="border-t border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              Smart Image SEO
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {isExpanded && (
            <div className="px-4 pb-4 space-y-3">
              {/* AI Prompt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Wand2 className="h-3 w-3 text-purple-400" />
                    AI Prompt (for DALL-E / Midjourney)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="h-6 px-2 gap-1 text-xs"
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
                  className="min-h-16 text-xs bg-background/50 border-border resize-none"
                  placeholder="AI prompt for generating image..."
                />
              </div>
              
              {/* ALT Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-cyan-400" />
                  ALT Text (Auto-generated)
                </label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="h-8 text-xs bg-background/50 border-border"
                  placeholder="Image alt text..."
                />
              </div>
              
              {/* Filename */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Suggested Filename
                </label>
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="h-8 text-xs bg-background/50 border-border font-mono"
                  placeholder="filename.webp"
                />
              </div>
              
              {/* SEO Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-emerald-400" />
                  Image Keywords
                </label>
                <div className="flex flex-wrap gap-1">
                  {seoKeywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
