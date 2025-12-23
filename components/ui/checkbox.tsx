"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer shrink-0 rounded-[3px] border border-muted-foreground/50 bg-background shadow-xs transition-all outline-none",
        "!h-[12px] !w-[12px] !min-h-[12px] !min-w-[12px] !max-h-[12px] !max-w-[12px]",
        "sm:!h-4 sm:!w-4 sm:!min-h-4 sm:!min-w-4 sm:!max-h-4 sm:!max-w-4 sm:rounded-[4px]",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        "dark:border-muted-foreground/60 dark:bg-muted/30",
        "dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
      >
        <CheckIcon className="!h-[8px] !w-[8px] sm:!h-3 sm:!w-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
