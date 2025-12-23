"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Code2, 
  Search,
  Copy,
  Check,
  Download,
  Sparkles,
  FileJson,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileCode,
  BookTemplate,
  AlertTriangle,
} from "lucide-react"
import { SchemaTypeCard } from "./SchemaTypeCard"
import { SchemaForm } from "./SchemaForm"
import { SchemaPreview } from "./SchemaPreview"
import { SCHEMA_TYPES, SCHEMA_TEMPLATES, SCHEMA_ICONS } from "../constants"
import { generateSchema, validateSchema, copyToClipboard, generateScriptTag } from "../utils"
import type { SchemaType, SchemaData, ValidationResult } from "../types"

export function SchemaGeneratorDashboard() {
  const [selectedType, setSelectedType] = useState<SchemaType | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [generatedSchema, setGeneratedSchema] = useState<string>("")
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  
  // Timer refs for cleanup
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const copyHtmlTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      if (copyHtmlTimerRef.current) clearTimeout(copyHtmlTimerRef.current)
    }
  }, [])

  const filteredTypes = useMemo(() => {
    if (!searchQuery) return SCHEMA_TYPES
    const query = searchQuery.toLowerCase()
    return SCHEMA_TYPES.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const selectedConfig = useMemo(() => 
    SCHEMA_TYPES.find(t => t.id === selectedType),
    [selectedType]
  )

  const handleTypeSelect = (type: SchemaType) => {
    setSelectedType(type)
    setFormData({})
    setGeneratedSchema("")
    setValidation(null)
    setShowTemplates(false)
  }

  const handleFormChange = (data: Record<string, unknown>) => {
    setFormData(data)
  }

  const handleGenerate = () => {
    if (!selectedType) return
    
    const result = validateSchema(selectedType, formData)
    setValidation(result)
    
    if (result.isValid) {
      const schema = generateSchema(selectedType, formData as unknown as SchemaData)
      setGeneratedSchema(schema)
    }
  }

  const handleCopy = async () => {
    if (!generatedSchema) return
    const success = await copyToClipboard(generatedSchema)
    if (success) {
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyAsHtml = async () => {
    if (!generatedSchema) return
    const htmlCode = generateScriptTag(generatedSchema)
    const success = await copyToClipboard(htmlCode)
    if (success) {
      setCopiedHtml(true)
      if (copyHtmlTimerRef.current) clearTimeout(copyHtmlTimerRef.current)
      copyHtmlTimerRef.current = setTimeout(() => setCopiedHtml(false), 2000)
    }
  }

  const handleTestRichResults = () => {
    const url = `https://search.google.com/test/rich-results?url=&user_agent=1`
    window.open(url, '_blank')
  }

  const handleLoadTemplate = (templateId: string) => {
    if (!selectedType) return
    const template = SCHEMA_TEMPLATES[selectedType]?.find(t => t.id === templateId)
    if (template) {
      setFormData(template.data)
      setShowTemplates(false)
    }
  }

  const handleDownload = () => {
    if (!generatedSchema) return
    const blob = new Blob([generatedSchema], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedType}-schema.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleBack = () => {
    setSelectedType(null)
    setFormData({})
    setGeneratedSchema("")
    setValidation(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Code2 className="h-7 w-7 text-amber-400" />
          Schema Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate structured data (JSON-LD) for rich snippets in Google
        </p>
      </div>

      {!selectedType ? (
        // Schema Type Selection
        <>
          {/* Search */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schema types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schema Type Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Choose Schema Type
              </h2>
              <Badge variant="outline" className="text-muted-foreground">
                {filteredTypes.length} types available
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.map((type) => (
                <SchemaTypeCard 
                  key={type.id}
                  config={type}
                  onSelect={() => handleTypeSelect(type.id)}
                />
              ))}
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Why use Schema Markup?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Structured data helps Google understand your content better, enabling rich snippets 
                    like star ratings, FAQ dropdowns, recipe cards, and more. This can increase your 
                    click-through rate by up to 30%!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Schema Form & Preview
        <div className="space-y-6">
          {/* Breadcrumb & Templates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button 
                onClick={handleBack}
                className="text-primary hover:underline"
              >
                All Schemas
              </button>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium flex items-center gap-1.5">
                {selectedConfig?.icon && SCHEMA_ICONS[selectedConfig.icon] && (
                  (() => {
                    const Icon = SCHEMA_ICONS[selectedConfig.icon]
                    return <Icon className={`h-4 w-4 ${selectedConfig.color}`} />
                  })()
                )}
                {selectedConfig?.name}
              </span>
            </div>
            {SCHEMA_TEMPLATES[selectedType] && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="h-8"
              >
                <BookTemplate className="h-3 w-3 mr-1" />
                Templates
              </Button>
            )}
          </div>

          {/* Template Library */}
          {showTemplates && SCHEMA_TEMPLATES[selectedType] && (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <BookTemplate className="h-4 w-4 text-amber-400" />
                  Quick Start Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SCHEMA_TEMPLATES[selectedType].map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleLoadTemplate(template.id)}
                      className="text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border"
                    >
                      <span className="text-sm font-medium text-foreground">{template.name}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  Fill in Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedConfig && (
                  <SchemaForm 
                    config={selectedConfig}
                    data={formData}
                    onChange={handleFormChange}
                  />
                )}

                {/* Validation Errors */}
                {validation && !validation.isValid && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Please fix these errors:</span>
                    </div>
                    <ul className="text-sm text-red-400/80 space-y-1 ml-6 list-disc">
                      {validation.errors.map((error, i) => (
                        <li key={i}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Validation Warnings */}
                {validation?.isValid && validation.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Suggestions:</span>
                    </div>
                    <ul className="text-sm text-yellow-400/80 space-y-1 ml-6 list-disc">
                      {validation.warnings.map((warning, i) => (
                        <li key={i}>
                          {warning.message}
                          {warning.suggestion && (
                            <span className="block text-muted-foreground">💡 {warning.suggestion}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={handleGenerate}
                  className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Generate Schema
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                    Generated JSON-LD
                  </CardTitle>
                  {generatedSchema && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="h-8"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 mr-1 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyAsHtml}
                        className="h-8"
                      >
                        {copiedHtml ? (
                          <Check className="h-3 w-3 mr-1 text-emerald-400" />
                        ) : (
                          <FileCode className="h-3 w-3 mr-1" />
                        )}
                        {copiedHtml ? "Copied!" : "HTML"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                        className="h-8"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <SchemaPreview 
                  schema={generatedSchema}
                  validation={validation}
                />

                {generatedSchema && validation?.isValid && (
                  <div className="mt-4 space-y-3">
                    {/* Test Button */}
                    <Button
                      variant="outline"
                      onClick={handleTestRichResults}
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test with Google Rich Results
                    </Button>

                    {/* How to Use */}
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">How to use:</span>
                      </div>
                      <ol className="text-sm text-emerald-400/80 space-y-1 ml-6 list-decimal">
                        <li>Copy the generated JSON-LD code or click "HTML" for ready-to-paste code</li>
                        <li>Add it to the {`<head>`} section of your page</li>
                        <li>Test with Google's Rich Results Test tool</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
