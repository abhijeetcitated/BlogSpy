import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type ChevronProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * react-day-picker v9 uses semantic table markup and new classNames keys.
 * Our older shadcn-style keys (row/cell/day_selected etc.) can accidentally
 * apply button styles to <td>, which breaks layout and can turn the calendar
 * into a vertical “strip”.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const navButton = cn(
    buttonVariants({ variant: "outline", size: "icon-sm" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // Layout
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 flex flex-col",

        // Header
        month_caption: "flex justify-center pt-1 relative items-center order-first",
        caption_label: "text-sm font-medium",

        // Nav
        nav: "flex items-center justify-center gap-1 order-last pt-3 border-t border-border mt-3",
        button_previous: navButton,
        button_next: navButton,

        // Grid
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        weeks: "flex w-full flex-col",
        week: "flex w-full mt-2",

        // Day cell vs day button (CRITICAL)
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),

        // Flags + selection states (v9 keys)
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: (chevronProps: ChevronProps) => {
          const { orientation, className: chevronClassName, disabled, size } = chevronProps
          const iconClassName = cn("h-4 w-4", chevronClassName)

          if (orientation === "left") {
            return <ChevronLeft className={iconClassName} aria-hidden={disabled} />
          }

          if (orientation === "right") {
            return <ChevronRight className={iconClassName} aria-hidden={disabled} />
          }

          // Fallback to default SVG for up/down (dropdown chevrons)
          // to preserve expected behavior.
          return (
            <svg
              className={cn(chevronClassName)}
              width={size ?? 24}
              height={size ?? 24}
              viewBox="0 0 24 24"
              aria-hidden={disabled}
            >
              {orientation === "up" && (
                <polygon points="6.77 17 12.5 11.43 18.24 17 20 15.28 12.5 8 5 15.28" />
              )}
              {orientation === "down" && (
                <polygon points="6.77 8 12.5 13.57 18.24 8 20 9.72 12.5 17 5 9.72" />
              )}
            </svg>
          )
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
