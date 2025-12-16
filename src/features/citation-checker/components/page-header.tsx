"use client"

import { QuoteIcon, SearchIcon, GlobeIcon } from "@/components/icons/platform-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PageHeaderProps {
  inputDomain: string
  onInputChange: (value: string) => void
  onCheckDomain: () => void
}

export function PageHeader({ inputDomain, onInputChange, onCheckDomain }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <QuoteIcon className="h-7 w-7 text-purple-500" />
          Am I Cited?
        </h1>
        <p className="text-muted-foreground mt-1">
          Check if Google&apos;s AI Overview cites your content
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter your domain..."
            value={inputDomain}
            onChange={(e) => onInputChange(e.target.value)}
            className="pl-9 w-[200px]"
            onKeyDown={(e) => e.key === "Enter" && onCheckDomain()}
          />
        </div>
        <Button onClick={onCheckDomain}>
          <SearchIcon className="h-4 w-4 mr-2" />
          Check Citations
        </Button>
      </div>
    </div>
  )
}
