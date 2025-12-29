"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Rocket, 
  Globe, 
  Tag, 
  Info, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Bot,
  Zap,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface SetupWizardProps {
  onComplete: (config: { domain: string; brandName: string }) => void
  isLoading?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FEATURES LIST
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: Bot,
    title: "Track AI Citations",
    description: "Monitor mentions across ChatGPT, Claude, Perplexity & more",
  },
  {
    icon: Sparkles,
    title: "Visibility Score",
    description: "Get a real-time score of your AI presence",
  },
  {
    icon: Zap,
    title: "Opportunity Alerts",
    description: "Find keywords where competitors are beating you",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function SetupWizard({ onComplete, isLoading = false }: SetupWizardProps) {
  const [domain, setDomain] = useState("")
  const [brandName, setBrandName] = useState("")
  const [domainError, setDomainError] = useState("")
  const [brandError, setBrandError] = useState("")

  // Validate domain format
  const validateDomain = (value: string) => {
    if (!value.trim()) {
      setDomainError("Domain is required")
      return false
    }
    // Simple domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(value.replace(/^(https?:\/\/)?(www\.)?/, ""))) {
      setDomainError("Enter a valid domain (e.g., blogspy.com)")
      return false
    }
    setDomainError("")
    return true
  }

  // Validate brand name
  const validateBrand = (value: string) => {
    if (!value.trim()) {
      setBrandError("Brand name is required")
      return false
    }
    if (value.length < 2) {
      setBrandError("Brand name must be at least 2 characters")
      return false
    }
    setBrandError("")
    return true
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const isDomainValid = validateDomain(domain)
    const isBrandValid = validateBrand(brandName)
    
    if (isDomainValid && isBrandValid) {
      // Clean domain (remove protocol and www)
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").trim()
      onComplete({ domain: cleanDomain, brandName: brandName.trim() })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Setup your AI Visibility Tracker
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            We need your domain and brand name to detect mentions in ChatGPT, Perplexity, and Google AI Overviews.
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Project Configuration
            </CardTitle>
            <CardDescription>
              This information helps us track your brand across AI platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Field */}
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Domain URL
                </Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="blogspy.com"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value)
                    if (domainError) validateDomain(e.target.value)
                  }}
                  className={`bg-background ${domainError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {domainError && (
                  <p className="text-xs text-red-500">{domainError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your main website domain (without https://)
                </p>
              </div>

              {/* Brand Name Field */}
              <div className="space-y-2">
                <TooltipProvider>
                  <Label htmlFor="brandName" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Brand Name
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px]">
                        <p className="text-xs">
                          Used to find text mentions in AI answers. We&apos;ll search for this exact term.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </TooltipProvider>
                <Input
                  id="brandName"
                  type="text"
                  placeholder="BlogSpy"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value)
                    if (brandError) validateBrand(e.target.value)
                  }}
                  className={`bg-background ${brandError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {brandError && (
                  <p className="text-xs text-red-500">{brandError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  How your brand appears in AI responses (case-insensitive)
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Initialize Project
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border"
            >
              <div className="p-2 rounded-lg bg-primary/10 mb-3">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Your data is secure and never shared with third parties</span>
        </div>
      </div>
    </div>
  )
}
