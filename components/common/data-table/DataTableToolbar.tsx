"use client"

import { Search, ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DataTableAction } from "./types"

interface DataTableToolbarProps<T> {
  searchable: boolean
  searchPlaceholder: string
  search: string
  onSearchChange: (value: string) => void
  selectedCount: number
  actions?: DataTableAction<T>[]
  onActionClick: (action: DataTableAction<T>) => void
}

export function DataTableToolbar<T>({
  searchable,
  searchPlaceholder,
  search,
  onSearchChange,
  selectedCount,
  actions,
  onActionClick,
}: DataTableToolbarProps<T>) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {searchable && (
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {selectedCount > 0 && actions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-700">
                Actions ({selectedCount})
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-800">
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onActionClick(action)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="outline" size="sm" className="border-slate-700">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
