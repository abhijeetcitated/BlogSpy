"use client"

import { useState } from "react"
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ChevronDown,
  Info,
  Zap,
  Target,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BLOG_NICHES, AD_NETWORKS } from "../constants"
import { NicheIcons, NetworkIcons } from "./Icons"
import { calculateEarnings, formatCurrency, formatNumber } from "../utils"
import { BlogNiche, AdNetwork, CalculatorResults } from "../types"
import { RpmChart } from "./RpmChart"
import { NetworkComparison } from "./NetworkComparison"
import { ProjectionChart } from "./ProjectionChart"

export function EarningsCalculator() {
  const [selectedNiche, setSelectedNiche] = useState<BlogNiche>(BLOG_NICHES[4]) // Tech
  const [monthlyPageviews, setMonthlyPageviews] = useState(50000)
  const [selectedNetwork, setSelectedNetwork] = useState<AdNetwork | null>(null)
  const [customRpm, setCustomRpm] = useState<number | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [results, setResults] = useState<CalculatorResults | null>(null)

  const handleCalculate = () => {
    const calculatedResults = calculateEarnings({
      niche: selectedNiche.id,
      monthlyPageviews,
      adNetwork: selectedNetwork,
      customRpm,
    })
    setResults(calculatedResults)
    setHasCalculated(true)
  }

  const handlePageviewsChange = (value: number[]) => {
    setMonthlyPageviews(value[0])
    if (hasCalculated) {
      handleCalculate()
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            Blog Earnings Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estimate your blog's ad revenue potential based on niche and traffic
          </p>
        </div>
      </div>

      {/* Calculator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
              <Target className="h-4 w-4 text-emerald-500" />
              Your Blog Details
            </h2>

            {/* Niche Selector */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                Blog Niche
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border border-border">
                      <p className="max-w-xs text-popover-foreground">Different niches have different RPM rates based on advertiser demand</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-10 sm:h-11 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex-shrink-0">{NicheIcons[selectedNiche.id]}</span>
                      <span className="truncate">{selectedNiche.name}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px] sm:w-[300px] max-h-[300px] overflow-y-auto">
                  {BLOG_NICHES.map((niche) => (
                    <DropdownMenuItem
                      key={niche.id}
                      onClick={() => setSelectedNiche(niche)}
                      className="flex items-center gap-3 py-2.5 sm:py-3"
                    >
                      <span className="flex-shrink-0">{NicheIcons[niche.id]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{niche.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg RPM: ${niche.avgRpm}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-muted-foreground">{selectedNiche.description}</p>
            </div>

            {/* Niche RPM Range */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Niche RPM Range:</span>
                <span className="font-mono text-emerald-400">
                  ${selectedNiche.minRpm} - ${selectedNiche.maxRpm}
                </span>
              </div>
            </div>

            {/* Monthly Pageviews */}
            <div className="space-y-3 sm:space-y-4">
              <label className="text-xs sm:text-sm font-medium text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Monthly Pageviews
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border border-border">
                        <p className="max-w-xs text-popover-foreground">Your estimated monthly page views from Google Analytics</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="font-mono text-emerald-400">{formatNumber(monthlyPageviews)}</span>
              </label>
              <Slider
                value={[monthlyPageviews]}
                onValueChange={handlePageviewsChange}
                min={1000}
                max={1000000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                <span>1K</span>
                <span>100K</span>
                <span>500K</span>
                <span>1M</span>
              </div>
              <Input
                type="number"
                value={monthlyPageviews}
                onChange={(e) => setMonthlyPageviews(Number(e.target.value) || 0)}
                className="h-9 sm:h-10 font-mono text-sm"
                placeholder="Enter exact pageviews"
              />
            </div>

            {/* Ad Network Selector */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Ad Network (Optional)
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-10 sm:h-11 text-sm">
                    <span className="flex items-center gap-2">
                      {selectedNetwork ? (
                        <>
                          <span className="flex-shrink-0">{NetworkIcons[selectedNetwork.id]}</span>
                          <span className="truncate">{selectedNetwork.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Auto-detect best network</span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px] sm:w-[300px]">
                  <DropdownMenuItem onClick={() => setSelectedNetwork(null)} className="py-2.5 sm:py-3">
                    <span className="text-muted-foreground">Auto-detect best network</span>
                  </DropdownMenuItem>
                  {AD_NETWORKS.map((network) => (
                    <DropdownMenuItem
                      key={network.id}
                      onClick={() => setSelectedNetwork(network)}
                      className="flex items-center gap-3 py-2.5 sm:py-3"
                      disabled={network.minTraffic > monthlyPageviews}
                    >
                      <span className="flex-shrink-0">{NetworkIcons[network.id]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{network.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {network.requirements}
                        </p>
                      </div>
                      {network.minTraffic > monthlyPageviews && (
                        <span className="text-xs text-red-400 flex-shrink-0">Need more traffic</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={handleCalculate} 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10 sm:h-12 text-sm sm:text-base"
            >
              <Zap className="h-4 w-4 mr-2" />
              Calculate Earnings
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {hasCalculated && results ? (
            <>
              {/* Earnings Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Daily Earnings</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-400">
                    {formatCurrency(results.dailyEarnings)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Monthly Earnings</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-400">
                    {formatCurrency(results.monthlyEarnings)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Yearly Earnings</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-400">
                    {formatCurrency(results.yearlyEarnings)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Estimated RPM</p>
                  <p className="text-lg sm:text-2xl font-bold text-cyan-400">
                    ${results.estimatedRpm}
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ProjectionChart projections={results.projections} />
                <RpmChart niche={selectedNiche} currentRpm={results.estimatedRpm} />
              </div>

              {/* Network Comparison */}
              <NetworkComparison 
                breakdown={results.breakdown} 
                recommendedNetworks={results.recommendedNetworks}
                currentPageviews={monthlyPageviews}
              />
            </>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 sm:p-12 flex flex-col items-center justify-center text-center min-h-[300px] sm:min-h-[400px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Ready to Calculate Your Blog Earnings?
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4 sm:mb-6">
                Select your blog niche, enter your monthly pageviews, and we'll estimate your potential ad revenue across different networks.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span>12-month projections</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span>Network comparison</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span>RPM by niche</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
