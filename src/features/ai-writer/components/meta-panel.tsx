// ============================================
// AI WRITER - Meta Panel Component
// ============================================
// Auto-generates and validates SEO meta tags

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  Link2,
  FileText,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { MetaSettings, WriterContext, SearchIntent } from "../types"

interface MetaPanelProps {
  title: string
  content: string
  targetKeyword: string
  context?: WriterContext | null
  onMetaChange?: (meta: MetaSettings) => void
}

// Generate meta title based on keyword and intent
function generateMetaTitle(keyword: string, intent?: SearchIntent): string {
  const year = new Date().getFullYear()
  const capitalizedKeyword = keyword
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  
  switch (intent) {
    case "commercial":
      return `Best ${capitalizedKeyword} in ${year} (Tested & Reviewed)`
    case "transactional":
      return `${capitalizedKeyword} - Get Started Today | Official Guide`
    case "informational":
      return `${capitalizedKeyword}: Complete Guide ${year} | Everything You Need`
    default:
      return `${capitalizedKeyword} - Ultimate Guide ${year}`
  }
}

// Generate meta description based on keyword and intent
function generateMetaDescription(keyword: string, intent?: SearchIntent): string {
  const year = new Date().getFullYear()
  
  switch (intent) {
    case "commercial":
      return `Looking for the best ${keyword.toLowerCase()}? We tested and reviewed the top options. See pricing, features, pros & cons. Updated for ${year}.`
    case "transactional":
      return `Get started with ${keyword.toLowerCase()} today. Step-by-step guide, pricing, and everything you need to know. Quick setup in minutes.`
    case "informational":
      return `Learn everything about ${keyword.toLowerCase()} in this comprehensive guide. Expert tips, best practices, and real examples. Updated ${year}.`
    default:
      return `Discover ${keyword.toLowerCase()} in this complete guide. Expert insights, tips, and best practices for ${year}.`
  }
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 60)
}

// Extract secondary keywords from content
function extractSecondaryKeywords(content: string, primaryKeyword: string): string[] {
  const words = content.toLowerCase().split(/\s+/)
  const primaryWords = primaryKeyword.toLowerCase().split(/\s+/)
  
  // Find 2-3 word phrases that appear multiple times
  const phrases: Record<string, number> = {}
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = words.slice(i, i + 2).join(" ")
    if (!primaryWords.some(pw => phrase.includes(pw)) && phrase.length > 5) {
      phrases[phrase] = (phrases[phrase] || 0) + 1
    }
  }
  
  // Return top phrases
  return Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase)
}

export function MetaPanel({ 
  title, 
  content, 
  targetKeyword, 
  context,
  onMetaChange 
}: MetaPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // Meta fields
  const [metaTitle, setMetaTitle] = useState(() => 
    generateMetaTitle(targetKeyword, context?.intent)
  )
  const [metaDescription, setMetaDescription] = useState(() => 
    generateMetaDescription(targetKeyword, context?.intent)
  )
  const [slug, setSlug] = useState(() => generateSlug(title))
  const [focusKeyword, setFocusKeyword] = useState(targetKeyword)
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([])
  
  // Schema options
  const [schemaTypes, setSchemaTypes] = useState({
    article: true,
    breadcrumb: true,
    faq: false,
    howTo: false,
    review: false,
  })
  
  // Validation
  const validation = useMemo(() => {
    const titleLength = metaTitle.length
    const descLength = metaDescription.length
    const titleHasKeyword = metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())
    const descHasKeyword = metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
    const slugHasKeyword = slug.includes(focusKeyword.toLowerCase().split(" ")[0])
    
    return {
      title: {
        length: titleLength,
        isValid: titleLength >= 30 && titleLength <= 60,
        hasKeyword: titleHasKeyword,
        issues: [
          titleLength < 30 && "Too short (min 30 chars)",
          titleLength > 60 && "Too long (max 60 chars)",
          !titleHasKeyword && "Missing focus keyword",
        ].filter(Boolean) as string[],
      },
      description: {
        length: descLength,
        isValid: descLength >= 120 && descLength <= 160,
        hasKeyword: descHasKeyword,
        issues: [
          descLength < 120 && "Too short (min 120 chars)",
          descLength > 160 && "Too long (max 160 chars)",
          !descHasKeyword && "Missing focus keyword",
        ].filter(Boolean) as string[],
      },
      slug: {
        isValid: slug.length > 0 && slug.length <= 60 && !slug.includes("--"),
        hasKeyword: slugHasKeyword,
        issues: [
          slug.length === 0 && "Slug is empty",
          slug.length > 60 && "Too long",
          slug.includes("--") && "Contains double dashes",
          !slugHasKeyword && "Consider adding keyword",
        ].filter(Boolean) as string[],
      },
    }
  }, [metaTitle, metaDescription, slug, focusKeyword])
  
  // Auto-update when keyword changes
  useEffect(() => {
    setFocusKeyword(targetKeyword)
  }, [targetKeyword])
  
  // Auto-extract secondary keywords from content
  useEffect(() => {
    if (content.length > 100) {
      const extracted = extractSecondaryKeywords(content, targetKeyword)
      setSecondaryKeywords(extracted)
    }
  }, [content, targetKeyword])
  
  // Notify parent of changes
  useEffect(() => {
    onMetaChange?.({
      title: metaTitle,
      titleLength: metaTitle.length,
      description: metaDescription,
      descriptionLength: metaDescription.length,
      slug,
      focusKeyword,
      secondaryKeywords,
      isTitleValid: validation.title.isValid && validation.title.hasKeyword,
      isDescriptionValid: validation.description.isValid && validation.description.hasKeyword,
      isSlugValid: validation.slug.isValid,
    })
  }, [metaTitle, metaDescription, slug, focusKeyword, secondaryKeywords, validation, onMetaChange])
  
  // Regenerate meta with AI
  const handleRegenerate = useCallback((field: "title" | "description") => {
    if (field === "title") {
      setMetaTitle(generateMetaTitle(focusKeyword, context?.intent))
    } else {
      setMetaDescription(generateMetaDescription(focusKeyword, context?.intent))
    }
  }, [focusKeyword, context?.intent])
  
  // Copy to clipboard
  const handleCopy = useCallback(async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])
  
  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    isValid ? (
      <Check className="h-3.5 w-3.5 text-emerald-400" />
    ) : (
      <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
    )
  )

  return (
    <Card className="bg-card/50 border-border overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-card border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Meta & SEO Settings</h3>
            <p className="text-xs text-muted-foreground">
              {validation.title.isValid && validation.description.isValid 
                ? "✓ All meta tags optimized" 
                : "Configure your SEO meta tags"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-5">
          {/* Meta Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                Meta Title
                <ValidationIcon isValid={validation.title.isValid && validation.title.hasKeyword} />
              </label>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-xs",
                  validation.title.isValid ? "text-emerald-400" : "text-amber-400"
                )}>
                  {validation.title.length}/60
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRegenerate("title")}
                  className="h-6 w-6 p-0"
                  title="Regenerate"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy("title", metaTitle)}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "title" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className={cn(
                "text-sm bg-background/50",
                !validation.title.isValid && "border-amber-500/50"
              )}
              placeholder="SEO-optimized page title..."
            />
            {validation.title.issues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {validation.title.issues.map((issue, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
            {validation.title.hasKeyword && (
              <p className="text-xs text-emerald-400">✓ Contains focus keyword</p>
            )}
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                Meta Description
                <ValidationIcon isValid={validation.description.isValid && validation.description.hasKeyword} />
              </label>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-xs",
                  validation.description.isValid ? "text-emerald-400" : "text-amber-400"
                )}>
                  {validation.description.length}/160
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRegenerate("description")}
                  className="h-6 w-6 p-0"
                  title="Regenerate"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy("description", metaDescription)}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "description" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={cn(
                "text-sm bg-background/50 min-h-[80px] resize-none",
                !validation.description.isValid && "border-amber-500/50"
              )}
              placeholder="Compelling meta description for search results..."
            />
            {validation.description.issues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {validation.description.issues.map((issue, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
            {validation.description.hasKeyword && (
              <p className="text-xs text-emerald-400">✓ Contains focus keyword</p>
            )}
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                URL Slug
                <ValidationIcon isValid={validation.slug.isValid} />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">/blog/</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="text-sm bg-background/50 font-mono flex-1"
                placeholder="url-slug"
              />
            </div>
            {validation.slug.issues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {validation.slug.issues.map((issue, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Focus Keyword */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              Focus Keyword
            </label>
            <Input
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              className="text-sm bg-background/50"
              placeholder="Primary keyword to target..."
            />
          </div>

          {/* Secondary Keywords */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Secondary Keywords (Auto-detected)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {secondaryKeywords.length > 0 ? (
                secondaryKeywords.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs bg-background/50 border-border"
                  >
                    {kw}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  Write more content to auto-detect keywords
                </span>
              )}
            </div>
          </div>

          {/* Schema Markup */}
          <div className="space-y-3 pt-3 border-t border-border">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              Schema Markup (Structured Data)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(schemaTypes).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) => 
                      setSchemaTypes(prev => ({ ...prev, [key]: !!checked }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-muted-foreground capitalize">
                    {key === "howTo" ? "HowTo" : key === "faq" ? "FAQ" : key}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Schema markup helps search engines understand your content better
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
