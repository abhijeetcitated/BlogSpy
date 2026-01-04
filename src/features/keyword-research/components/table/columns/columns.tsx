"use client"

// ============================================
// TANSTACK TABLE - Column Definitions
// ============================================
// Strict 11-column layout for Keyword Explorer
// Uses TanStack Table v8
// ============================================

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

import type { Keyword } from "../../../types"
import { KeywordColumn } from "./keyword"
import { VolumeColumn } from "./volume"
import { TrendColumn } from "./trend"
import { KdColumn } from "./kd"
import { CpcColumn } from "./cpc"
import { IntentColumn } from "./intent"
import { WeakSpotColumn } from "./weak-spot"
import { GeoColumn } from "./geo"
import { SerpColumn } from "./serp"

// ============================================
// INTENT MAPPING HELPER
// ============================================

const intentShortToFull: Record<string, "informational" | "commercial" | "transactional" | "navigational"> = {
  "I": "informational",
  "C": "commercial",
  "T": "transactional",
  "N": "navigational",
}

function mapIntentCodes(codes: ("I" | "C" | "T" | "N")[]): ("informational" | "commercial" | "transactional" | "navigational")[] {
  return codes.map(code => intentShortToFull[code]).filter(Boolean)
}

// ============================================
// COLUMN HELPER TYPES
// ============================================

interface ColumnMeta {
  className?: string
  headerClassName?: string
}

// ============================================
// CREATE COLUMNS FUNCTION
// ============================================

export function createColumns(options: {
  onKeywordClick?: (keyword: Keyword) => void
  onRefresh?: (id: number) => void
  isRefreshing?: (id: number) => boolean
}): ColumnDef<Keyword, unknown>[] {
  const { onKeywordClick, onRefresh, isRefreshing } = options

  return [
    // ─────────────────────────────────────────
    // COLUMN 1: Checkbox (Row Selection)
    // ─────────────────────────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
      meta: {
        className: "w-[40px]",
        headerClassName: "w-[40px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 2: Keyword (Text + Copy/Search)
    // ─────────────────────────────────────────
    {
      accessorKey: "keyword",
      header: "Keyword",
      cell: ({ row }) => (
        <KeywordColumn
          keyword={row.original.keyword}
          onClick={() => onKeywordClick?.(row.original)}
          className="max-w-[300px]"
        />
      ),
      enableSorting: true,
      size: 300,
      meta: {
        className: "min-w-[200px] max-w-[300px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 3: Volume (Numeric, Sortable)
    // ─────────────────────────────────────────
    {
      accessorKey: "volume",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Volume
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </button>
      ),
      cell: ({ row }) => <VolumeColumn volume={row.original.volume} />,
      enableSorting: true,
      sortingFn: "basic",
      size: 100,
      meta: {
        className: "w-[100px] text-right",
        headerClassName: "text-right",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 4: Trend (Sparkline Chart)
    // ─────────────────────────────────────────
    {
      accessorKey: "trend",
      header: "Trend",
      cell: ({ row }) => (
        <TrendColumn data={row.original.trend} />
      ),
      enableSorting: false,
      size: 80,
      meta: {
        className: "w-[80px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 5: KD (Difficulty Ring/Progress)
    // ─────────────────────────────────────────
    {
      accessorKey: "kd",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          KD
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </button>
      ),
      cell: ({ row }) => <KdColumn kd={row.original.kd} />,
      enableSorting: true,
      sortingFn: "basic",
      size: 80,
      meta: {
        className: "w-[80px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 6: CPC (Currency)
    // ─────────────────────────────────────────
    {
      accessorKey: "cpc",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          CPC
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </button>
      ),
      cell: ({ row }) => <CpcColumn cpc={row.original.cpc} />,
      enableSorting: true,
      sortingFn: "basic",
      size: 80,
      meta: {
        className: "w-[80px] text-right",
        headerClassName: "text-right",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 7: Intent (Badge I/C/T/N)
    // ─────────────────────────────────────────
    {
      accessorKey: "intent",
      header: "Intent",
      cell: ({ row }) => <IntentColumn intent={mapIntentCodes(row.original.intent)} />,
      enableSorting: false,
      size: 80,
      meta: {
        className: "w-[80px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 8: Weak Spot (Reddit/Quora Icon + Rank)
    // ─────────────────────────────────────────
    {
      accessorKey: "weakSpot",
      header: "Weak Spot",
      cell: ({ row }) => {
        const weakSpot = row.original.weakSpot
        // Map weakSpot.type to level
        const level = weakSpot?.type ? (weakSpot.rank && weakSpot.rank <= 5 ? "high" : weakSpot.rank && weakSpot.rank <= 10 ? "medium" : "low") : "none"
        const reasons = weakSpot?.type ? [`${weakSpot.type} ranks #${weakSpot.rank || "??"}`] : undefined
        return (
          <WeakSpotColumn 
            level={level} 
            score={weakSpot?.rank}
            reasons={reasons}
          />
        )
      },
      enableSorting: false,
      size: 90,
      meta: {
        className: "w-[90px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 9: GEO (Robot Icon + Score)
    // ─────────────────────────────────────────
    {
      accessorKey: "geoScore",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GEO
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </button>
      ),
      cell: ({ row }) => <GeoColumn geoScore={row.original.geoScore} />,
      enableSorting: true,
      sortingFn: "basic",
      size: 70,
      meta: {
        className: "w-[70px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 10: SERP (Icons for Video/Snippet)
    // ─────────────────────────────────────────
    {
      accessorKey: "serpFeatures",
      header: "SERP",
      cell: ({ row }) => (
        <SerpColumn 
          features={row.original.serpFeatures as never[]} 
          maxDisplay={3}
        />
      ),
      enableSorting: false,
      size: 100,
      meta: {
        className: "w-[100px]",
      } as ColumnMeta,
    },

    // ─────────────────────────────────────────
    // COLUMN 11: Refresh (Ghost Button)
    // ─────────────────────────────────────────
    {
      id: "refresh",
      header: "",
      cell: ({ row }) => {
        const isLoading = isRefreshing?.(row.original.id) || row.original.isRefreshing

        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRefresh?.(row.original.id)}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
      meta: {
        className: "w-[40px]",
      } as ColumnMeta,
    },
  ]
}

// ============================================
// DEFAULT COLUMNS EXPORT
// ============================================

export const defaultColumns = createColumns({})

// ============================================
// RE-EXPORT INDIVIDUAL COLUMN COMPONENTS
// ============================================

export {
  CheckboxColumn,
  CheckboxHeader,
} from "./checkbox"

export { KeywordColumn } from "./keyword"
export { VolumeColumn } from "./volume"
export { TrendColumn } from "./trend"
export { KdColumn } from "./kd"
export { CpcColumn } from "./cpc"
export { IntentColumn } from "./intent"
export { WeakSpotColumn } from "./weak-spot"
export { GeoColumn } from "./geo"
export { SerpColumn } from "./serp"
export { RefreshColumn } from "./refresh"
export { ActionsColumn } from "./actions"
