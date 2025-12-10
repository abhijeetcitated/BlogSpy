"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Globe, 
  Loader2, 
  Search,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UrlAnalyzerFormProps {
  onAnalyze: (url: string, keyword?: string) => void | Promise<void>
  isLoading?: boolean
  placeholder?: string
  showKeywordInput?: boolean
  className?: string
}

export function UrlAnalyzerForm({
  onAnalyze,
  isLoading = false,
  placeholder = "Enter a URL to analyze (e.g., https://example.com/blog/post)",
  showKeywordInput = true,
  className,
}: UrlAnalyzerFormProps) {
  const [url, setUrl] = useState("")
  const [keyword, setKeyword] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const validateUrl = (input: string): boolean => {
    try {
      const urlObj = new URL(input)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    // Add https:// if missing
    let processedUrl = url.trim()
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl
    }

    if (!validateUrl(processedUrl)) {
      setError("Please enter a valid URL")
      return
    }

    onAnalyze(processedUrl, keyword || undefined)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        setError("")
      }
    } catch (err) {
      console.error("Failed to paste:", err)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Page URL
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError("")
              }}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                "h-12 pl-12 pr-24 text-base bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20",
                error && "border-red-500 focus:border-red-500"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-8 px-2 text-slate-500 hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                className="h-8 px-2 text-slate-500 hover:text-white"
              >
                Paste
              </Button>
            </div>
          </div>
          {error && (
            <p className="flex items-center gap-1 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        {/* Target Keyword Input (Optional) */}
        {showKeywordInput && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Target Keyword <span className="text-slate-500">(optional)</span>
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter a target keyword to check optimization"
                disabled={isLoading}
                className="h-12 pl-12 text-base bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <p className="text-xs text-slate-500">
              Add a keyword to get specific optimization suggestions for that term.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Page...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze Page
            </>
          )}
        </Button>
      </form>

      {/* Quick Examples */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-2">Try analyzing:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "https://example.com/blog/seo-guide",
            "https://example.com/product-page",
          ].map((exampleUrl) => (
            <Badge
              key={exampleUrl}
              variant="outline"
              className="cursor-pointer border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
              onClick={() => {
                setUrl(exampleUrl)
                setError("")
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {exampleUrl.replace("https://", "").slice(0, 30)}...
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

// Compact version for embedding in other components
export function UrlInputCompact({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Enter URL...",
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  placeholder?: string
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>
      <Button
        onClick={onSubmit}
        disabled={isLoading || !value.trim()}
        className="bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
      </Button>
    </div>
  )
}
