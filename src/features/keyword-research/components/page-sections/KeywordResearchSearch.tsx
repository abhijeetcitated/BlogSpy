"use client"

// ============================================
// KEYWORD RESEARCH SEARCH - Page Section
// ============================================
// Seed search (credit-gated) + filter input
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Check, ChevronDown, Loader2, Monitor, RotateCcw, Search, Smartphone, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TrapInput } from "@/features/keyword-research/components/search/TrapInput"
import { ForensicToggle } from "@/features/keyword-research/components/search/ForensicToggle"
import { useUIStore } from "@/store/ui-store"
import { bulkSearchKeywords } from "@features/keyword-research/actions/fetch-keywords"
import { parseBulkKeywords, sanitizeKeywordInput } from "@/features/keyword-research/utils/input-parser"
import {
  LANGUAGE_OPTIONS,
  getLanguageLabel,
  getPrimaryLanguage,
  getSupportedLanguages,
} from "@/features/keyword-research/config/location-registry"
import { BulkModeToggle, CountrySelector, MatchTypeToggle } from "../index"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "../../constants"
import type { Country, BulkMode, MatchType } from "../../types"
import { useKeywordStore } from "../../store"

interface KeywordResearchSearchProps {
  mode?: "seed" | "filter"
  value?: string
  onChange?: (text: string) => void
  onSubmit?: (text: string) => void
  isGuest?: boolean
  selectedCountry?: Country | null
  countryOpen?: boolean
  onCountryOpenChange?: (open: boolean) => void
  onCountrySelect?: (country: Country | null) => void
  bulkMode?: BulkMode
  onBulkModeChange?: (mode: BulkMode) => void
  matchType?: MatchType
  onMatchTypeChange?: (type: MatchType) => void
  activeFilterCount?: number
  onResetFilters?: () => void
}

const POPULAR_LANGUAGE_CODES = [
  "en",
  "es",
  "fr",
  "de",
  "hi",
  "it",
  "pt",
  "ja",
  "nl",
  "ru",
  "pl",
] as const

export function KeywordResearchSearch({
  mode = "filter",
  value,
  onChange,
  onSubmit,
  isGuest = false,
  selectedCountry,
  countryOpen,
  onCountryOpenChange,
  onCountrySelect,
  bulkMode: bulkModeProp,
  onBulkModeChange,
  matchType,
  onMatchTypeChange,
  activeFilterCount = 0,
  onResetFilters,
}: KeywordResearchSearchProps) {
  const isSeedMode = mode === "seed"
  const [seedValue, setSeedValue] = useState("")
  const [forensicEnabled, setForensicEnabled] = useState(false)
  const [forensicDepth, setForensicDepth] = useState<"top5" | "top10">("top5")
  const [localCountryOpen, setLocalCountryOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [languageQuery, setLanguageQuery] = useState("")

  const storeCountry = useKeywordStore((state) => state.search.country)
  const bulkMode = useKeywordStore((state) => state.search.mode)
  const bulkKeywords = useKeywordStore((state) => state.search.bulkKeywords)
  const languageCode = useKeywordStore((state) => state.search.languageCode)
  const deviceType = useKeywordStore((state) => state.search.deviceType)
  const userCredits = useKeywordStore((state) => state.credits)
  const storeMatchType = useKeywordStore((state) => state.filters.matchType)
  const setSeedKeyword = useKeywordStore((state) => state.setSeedKeyword)
  const setSearching = useKeywordStore((state) => state.setSearching)
  const setKeywords = useKeywordStore((state) => state.setKeywords)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const setCountry = useKeywordStore((state) => state.setCountry)
  const setMode = useKeywordStore((state) => state.setMode)
  const setLanguageCode = useKeywordStore((state) => state.setLanguageCode)
  const setDeviceType = useKeywordStore((state) => state.setDeviceType)
  const { executeAsync: executeAuthenticated, status: authStatus } = useAction(bulkSearchKeywords)
  // Note: Guest users are redirected to login before API calls, so no guest action needed
  const [perceptionDelay, setPerceptionDelay] = useState(false)
  const isExecuting = authStatus === "executing" || perceptionDelay

  const router = useRouter()
  const openPricingModal = useUIStore((state) => state.openPricingModal)

  const [loaderMessage, setLoaderMessage] = useState<string | null>(null)

  const currentValue = isSeedMode ? seedValue : value ?? ""
  const placeholder = isSeedMode
    ? "Enter a seed keyword (e.g., \"best crm software\")"
    : "Filter keywords"

  const effectiveBulkMode = bulkModeProp ?? bulkMode
  const effectiveCountryOpen = countryOpen ?? localCountryOpen
  const handleCountryOpenChange = onCountryOpenChange ?? setLocalCountryOpen

  const bulkKeywordCount = useMemo(() => parseBulkKeywords(bulkKeywords).length, [bulkKeywords])
  const totalCost = useMemo(() => {
    const forensicCost = forensicEnabled ? (forensicDepth === "top10" ? 10 : 5) : 0
    return 1 + forensicCost
  }, [forensicDepth, forensicEnabled])

  const analyzeButtonLabel = useMemo(() => {
    return `Analyze (${totalCost} Credits)`
  }, [totalCost])

  const canAfford = typeof userCredits === "number" ? userCredits >= totalCost : true
  const analyzeDisabled = isExecuting
  const analyzeNeedsInput = currentValue.trim().length === 0

  const derivedSelectedCountry =
    selectedCountry ??
    POPULAR_COUNTRIES.find((country) => country.code === storeCountry) ??
    ALL_COUNTRIES.find((country) => country.code === storeCountry) ??
    null

  const effectiveMatchType = matchType ?? storeMatchType

  const allLanguageOptions = useMemo(() => LANGUAGE_OPTIONS, [])

  const supportedLanguageCodes = useMemo(() => {
    const supported = getSupportedLanguages(storeCountry)
    return supported.length > 0 ? supported : ["en"]
  }, [storeCountry])

  const supportedLanguageOptions = useMemo(
    () => allLanguageOptions.filter((option) => supportedLanguageCodes.includes(option.code)),
    [allLanguageOptions, supportedLanguageCodes]
  )

  const defaultLanguage = useMemo(() => {
    const primary = getPrimaryLanguage(storeCountry)
    return supportedLanguageCodes.includes(primary) ? primary : supportedLanguageCodes[0] ?? "en"
  }, [storeCountry, supportedLanguageCodes])

  const selectedLanguage = languageCode || defaultLanguage

  const filteredLanguages = useMemo(() => {
    const query = languageQuery.trim().toLowerCase()
    if (!query) return supportedLanguageOptions
    return supportedLanguageOptions.filter((option) => {
      const label = option.label.toLowerCase()
      return label.includes(query) || option.code.toLowerCase().includes(query)
    })
  }, [languageQuery, supportedLanguageOptions])

  const popularLanguages = useMemo(
    () =>
      filteredLanguages.filter((option) =>
        POPULAR_LANGUAGE_CODES.includes(option.code as (typeof POPULAR_LANGUAGE_CODES)[number])
      ),
    [filteredLanguages]
  )

  const otherLanguages = useMemo(
    () =>
      filteredLanguages.filter(
        (option) =>
          !POPULAR_LANGUAGE_CODES.includes(option.code as (typeof POPULAR_LANGUAGE_CODES)[number])
      ),
    [filteredLanguages]
  )

  useEffect(() => {
    if (!supportedLanguageCodes.includes(languageCode)) {
      setLanguageCode(defaultLanguage)
    }
  }, [defaultLanguage, languageCode, setLanguageCode, supportedLanguageCodes])

  useEffect(() => {
    if (!languageOpen) {
      setLanguageQuery("")
    }
  }, [languageOpen])

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (isSeedMode) {
        setSeedValue(nextValue)
        setSeedKeyword(nextValue)
      }
      onChange?.(nextValue)
    },
    [isSeedMode, onChange, setSeedKeyword]
  )

  const handleActionError = useCallback(
    (code: string) => {
      if (code === "PLG_LOGIN_REQUIRED") {
        router.push("/login")
        return
      }

      if (code === "INSUFFICIENT_CREDITS" || code === "LOW_BALANCE") {
        toast.error("You need more credits")
        openPricingModal()
        router.push("/pricing")
        return
      }

      if (code === "BOT_DETECTED") {
        toast.error("Security verification failed")
        return
      }

      if (code === "API_FAILURE_REFUNDED") {
        toast.error("Connection error. Your credits have been refunded.")
        return
      }

      toast.error(code || "An unexpected error occurred")
    },
    [openPricingModal, router]
  )

  useEffect(() => {
    if (!isExecuting) {
      setLoaderMessage(null)
      return
    }

    if (forensicEnabled) {
      setLoaderMessage("Deducting Credits...")
    } else {
      setLoaderMessage("Verifying Credits...")
    }

    const stageTwoTimer = setTimeout(() => {
      if (forensicEnabled) {
        setLoaderMessage("Discovering Keywords...")
      } else {
        setLoaderMessage("Retrieving from Vault...")
      }
    }, 1000)

    const stageThreeTimer = setTimeout(() => {
      if (forensicEnabled) {
        setLoaderMessage("Dispatching Forensic Scans...")
      } else {
        setLoaderMessage("Mapping Data...")
      }
    }, 5000)

    return () => {
      clearTimeout(stageTwoTimer)
      clearTimeout(stageThreeTimer)
    }
  }, [forensicEnabled, isExecuting])

  const handleSeedSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const isBulkMode = effectiveBulkMode === "bulk"
      const bulkList = isBulkMode ? parseBulkKeywords(bulkKeywords) : []
      const keyword = isBulkMode ? "" : sanitizeKeywordInput(seedValue)

      if (isBulkMode && bulkList.length === 0) {
        toast.error("Please enter at least one keyword to analyze")
        return
      }

      if (!isBulkMode && !keyword) {
        toast.error("Please enter a keyword to search")
        return
      }

      if (isGuest && isBulkMode) {
        toast.info("Sign up to unlock bulk analysis.")
        return
      }

      if (isGuest) {
        toast.info("Please sign in to run live searches.")
        router.push("/login")
        return
      }

      if (!canAfford) {
        toast.error("You need more credits")
        openPricingModal()
        router.push("/pricing")
        return
      }

      const formData = new FormData(event.currentTarget)
      const priorityRaw = formData.get("user_system_priority")
      const userSystemPriority =
        typeof priorityRaw === "string" && priorityRaw.trim().length > 0
          ? priorityRaw
          : undefined
      const tokenRaw = formData.get("admin_validation_token")
      const adminValidationToken =
        typeof tokenRaw === "string" && tokenRaw.trim().length > 0
          ? tokenRaw
          : undefined

      const idempotencyKey = crypto.randomUUID()

      setKeywords([])
      setSearching(true)
      const startedAt = Date.now()
      const minBulkDelayMs = 2500

      try {
        const result = await executeAuthenticated({
          keyword: isBulkMode ? undefined : keyword,
          keywords: isBulkMode ? bulkList : undefined,
          country: storeCountry || "US",
          languageCode: languageCode || "en",
          deviceType,
          user_system_priority: userSystemPriority,
          admin_validation_token: adminValidationToken,
          idempotency_key: idempotencyKey,
          isForensic: forensicEnabled,
          depth: forensicEnabled ? (forensicDepth === "top10" ? 10 : 5) : undefined,
          matchType: effectiveMatchType,
        })

        const serverError =
          typeof result?.serverError === "string" ? result.serverError : undefined
        if (serverError) {
          handleActionError(serverError)
          return
        }

        const keywordErrors = result?.validationErrors?.keywords
        const keywordsValidation = Array.isArray(keywordErrors)
          ? keywordErrors.find((entry) => entry?._errors?.length)?._errors?.[0]
          : keywordErrors?._errors?.[0]
        const validationMessage =
          result?.validationErrors?.keyword?._errors?.[0] ??
          keywordsValidation ??
          result?.validationErrors?.idempotency_key?._errors?.[0]

        if (validationMessage) {
          toast.error(validationMessage)
          return
        }

        if (!result?.data || result.data.success !== true) {
          toast.error("Failed to fetch keywords")
          return
        }

        if (isBulkMode) {
          const elapsed = Date.now() - startedAt
          if (elapsed < minBulkDelayMs) {
            setPerceptionDelay(true)
            await new Promise((resolve) => setTimeout(resolve, minBulkDelayMs - elapsed))
            setPerceptionDelay(false)
          }
        }

        setKeywords(result.data.data)

        if (typeof result.data.balance === "number") {
          setCredits(result.data.balance)
        }

        if (result.data.forensicError) {
          const refundAmount =
            typeof result.data.forensicRefund === "number"
              ? result.data.forensicRefund
              : forensicEnabled
                ? forensicDepth === "top10"
                  ? 10
                  : 5
                : 0
          const refundMessage = refundAmount
            ? `${refundAmount} credits have been refunded to your account.`
            : "Forensic credits have been refunded to your account."
          toast.warning("⚠️ Discovery data loaded, but Forensic Scan failed.", {
            description: refundMessage,
          })
        }

        if (isBulkMode) {
          toast.success(
            `Analyzed ${bulkList.length} keywords successfully. ${bulkList.length} credits deducted.`
          )
        } else {
          toast.success(`Found ${result.data.data.length} keywords for "${keyword}"`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred"
        handleActionError(message)
      } finally {
        setPerceptionDelay(false)
        setSearching(false)
      }
    },
    [
      executeAuthenticated,
      handleActionError,
      isGuest,
      effectiveBulkMode,
      bulkKeywords,
      seedValue,
      setCredits,
      setKeywords,
      setSearching,
      storeCountry,
      languageCode,
      deviceType,
      effectiveMatchType,
    ]
  )

  if (!isSeedMode) {
    return (
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={currentValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return
            const trimmed = currentValue.trim()
            if (!trimmed) return
            onSubmit?.(trimmed)
          }}
          className="pl-9 pr-8 h-9 bg-muted/30 border-border/50 focus:bg-background"
        />
        {currentValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => handleValueChange("")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSeedSubmit} className="flex items-center gap-2">
        <input type="hidden" name="forensic_enabled" value={String(forensicEnabled)} />
        <input type="hidden" name="forensic_depth" value={forensicEnabled ? forensicDepth : "off"} />
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={placeholder}
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={isExecuting}
            className="pl-9 pr-9 h-10 bg-muted/30 border-border/50 focus:bg-background"
          />
          {currentValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => handleValueChange("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <Button
          type="submit"
          disabled={analyzeDisabled}
          className={`h-10 px-6 gap-2 ${analyzeNeedsInput ? "opacity-90" : ""}`}
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loaderMessage ?? "Securing Connection..."}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {analyzeButtonLabel}
            </>
          )}
        </Button>
        <div className="hidden md:flex items-center">
          <ForensicToggle
            enabled={forensicEnabled}
            onEnabledChange={(next) => {
              setForensicEnabled(next)
              if (next) setForensicDepth("top5")
            }}
            depth={forensicDepth}
            onDepthChange={setForensicDepth}
            className="w-auto"
          />
        </div>
        <TrapInput />
      </form>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between md:flex-wrap lg:flex-nowrap gap-4 w-full pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-start sm:gap-3">
            <BulkModeToggle
              value={effectiveBulkMode}
              onChange={(next) => {
                if (onBulkModeChange) {
                  onBulkModeChange(next)
                  return
                }
                setMode(next)
              }}
            />

            <div className="hidden sm:block w-[1px] h-6 bg-border" />

            <CountrySelector
              selectedCountry={derivedSelectedCountry}
              open={effectiveCountryOpen}
              onOpenChange={handleCountryOpenChange}
              onSelect={(country) => {
                const nextCountry = country?.code || "US"
                const primaryLanguage = getPrimaryLanguage(nextCountry)
                if (onCountrySelect) {
                  onCountrySelect(country)
                } else {
                  setCountry(nextCountry)
                }
                const supported = getSupportedLanguages(nextCountry)
                const safeLanguage = supported.includes(primaryLanguage)
                  ? primaryLanguage
                  : supported[0] ?? "en"
                setLanguageCode(safeLanguage)
              }}
              popularCountries={POPULAR_COUNTRIES}
              allCountries={ALL_COUNTRIES}
            />

            <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 min-w-[120px] sm:min-w-[160px] bg-secondary/50 border-border justify-between px-2 sm:px-3"
                >
                  <span className="text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-none">
                    {getLanguageLabel(selectedLanguage)} ({selectedLanguage})
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="end" sideOffset={8}>
                <div className="p-2 border-b border-border">
                  <Input
                    placeholder="Search languages..."
                    value={languageQuery}
                    onChange={(e) => setLanguageQuery(e.target.value)}
                    className="h-8 text-sm bg-input border-border"
                  />
                </div>
                <div className="max-h-[240px] overflow-y-auto p-1">
                  {popularLanguages.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Popular
                      </div>
                      {popularLanguages.map((option) => {
                        const isSelected = selectedLanguage === option.code
                        return (
                          <button
                            key={option.code}
                            type="button"
                            onClick={() => {
                              setLanguageCode(option.code)
                              setLanguageOpen(false)
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors ${
                              isSelected ? "bg-accent" : ""
                            }`}
                          >
                            <span>{option.label}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">{option.code}</span>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        )
                      })}
                    </>
                  )}

                  {otherLanguages.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-2">
                        All Languages
                      </div>
                      {otherLanguages.map((option) => {
                        const isSelected = selectedLanguage === option.code
                        return (
                          <button
                            key={option.code}
                            type="button"
                            onClick={() => {
                              setLanguageCode(option.code)
                              setLanguageOpen(false)
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors ${
                              isSelected ? "bg-accent" : ""
                            }`}
                          >
                            <span>{option.label}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">{option.code}</span>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        )
                      })}
                    </>
                  )}

                  {filteredLanguages.length === 0 && (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      No languages found
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <ToggleGroup
              type="single"
              value={deviceType === "all" ? "desktop" : deviceType}
              onValueChange={(value) => {
                if (!value) return
                setDeviceType(value as "desktop" | "mobile" | "all")
              }}
              variant="default"
              size="sm"
              className="inline-flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border h-9 gap-0.5"
            >
              <ToggleGroupItem
                value="desktop"
                aria-label="Desktop"
                className="h-8 w-9 rounded-md flex items-center justify-center text-xs font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-accent/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground shadow-sm"
              >
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="mobile"
                aria-label="Mobile"
                className="h-8 w-9 rounded-md flex items-center justify-center text-xs font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-accent/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground shadow-sm"
              >
                <Smartphone className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-border" />

          <div className="md:hidden">
            <ForensicToggle
              enabled={forensicEnabled}
              onEnabledChange={(next) => {
                setForensicEnabled(next)
                if (next) setForensicDepth("top5")
              }}
              depth={forensicDepth}
              onDepthChange={setForensicDepth}
            />
          </div>
        </div>

        {effectiveBulkMode === "explore" && onMatchTypeChange && (
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto md:w-full md:justify-end md:pt-2 lg:w-auto lg:pt-0">
            {activeFilterCount > 0 && onResetFilters && (
              <Button
                size="sm"
                onClick={onResetFilters}
                className="text-xs font-medium gap-1.5 bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-600/20 dark:focus-visible:ring-red-600/40 dark:bg-red-600/80 dark:hover:bg-red-600/70"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset ({activeFilterCount})
              </Button>
            )}

            <MatchTypeToggle value={effectiveMatchType} onChange={onMatchTypeChange} />
          </div>
        )}
      </div>
    </div>
  )
}
