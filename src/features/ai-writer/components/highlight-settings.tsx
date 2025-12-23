// ============================================
// AI WRITER - HIGHLIGHT SETTINGS COMPONENT
// ============================================
// Feature #4: UI controls for term highlighting
// preferences and visibility
// ============================================

'use client'

import React from 'react'
import {
  Eye,
  EyeOff,
  Settings2,
  Minus,
  Circle,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { HighlightPanelState } from '../types/term-highlight.types'

// ============================================
// PROPS
// ============================================

interface HighlightSettingsProps {
  state: HighlightPanelState
  onChange: (newState: Partial<HighlightPanelState>) => void
  className?: string
}

// ============================================
// COMPONENT
// ============================================

export const HighlightSettings: React.FC<HighlightSettingsProps> = ({
  state,
  onChange,
  className
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 gap-2', className)}
        >
          {state.enabled ? (
            <Eye className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs">Highlights</span>
          <Settings2 className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-72">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Term Highlighting</h4>
            <Switch
              checked={state.enabled}
              onCheckedChange={(checked) => onChange({ enabled: checked })}
            />
          </div>
          
          {/* Status Filters */}
          <div className={cn(
            'space-y-3',
            !state.enabled && 'opacity-50 pointer-events-none'
          )}>
            <Label className="text-xs text-muted-foreground">
              Show terms by status
            </Label>
            
            {/* Underused */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500/30 border-2 border-yellow-500" />
                <span className="text-sm">Underused</span>
              </div>
              <Switch
                checked={state.showUnderused}
                onCheckedChange={(checked) => onChange({ showUnderused: checked })}
              />
            </div>
            
            {/* Optimal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/30 border-2 border-green-500" />
                <span className="text-sm">Optimal</span>
              </div>
              <Switch
                checked={state.showOptimal}
                onCheckedChange={(checked) => onChange({ showOptimal: checked })}
              />
            </div>
            
            {/* Overused */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/30 border-2 border-red-500" />
                <span className="text-sm">Overused</span>
              </div>
              <Switch
                checked={state.showOverused}
                onCheckedChange={(checked) => onChange({ showOverused: checked })}
              />
            </div>
          </div>
          
          {/* Priority Filter */}
          <div className={cn(
            'space-y-2',
            !state.enabled && 'opacity-50 pointer-events-none'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Primary only</span>
              </div>
              <Switch
                checked={state.showOnlyPrimary}
                onCheckedChange={(checked) => onChange({ showOnlyPrimary: checked })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only highlight primary importance terms
            </p>
          </div>
          
          {/* Intensity */}
          <div className={cn(
            'space-y-2',
            !state.enabled && 'opacity-50 pointer-events-none'
          )}>
            <Label className="text-xs text-muted-foreground">
              Highlight intensity
            </Label>
            <Select
              value={state.intensity}
              onValueChange={(value) => 
                onChange({ intensity: value as HighlightPanelState['intensity'] })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subtle">
                  <div className="flex items-center gap-2">
                    <Minus className="h-3 w-3" />
                    <span>Subtle</span>
                  </div>
                </SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3" />
                    <span>Normal</span>
                  </div>
                </SelectItem>
                <SelectItem value="strong">
                  <div className="flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    <span>Strong</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Legend */}
          <div className="pt-2 border-t border-border/50">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Legend
            </Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-1 bg-yellow-500/20 border-b-2 border-dashed border-yellow-500 rounded">
                  term
                </span>
                <span className="text-muted-foreground">Underused</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-1 bg-green-500/15 border-b-2 border-green-500/50 rounded">
                  term
                </span>
                <span className="text-muted-foreground">Optimal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-1 bg-red-500/20 border-b-2 border-red-500 rounded">
                  term
                </span>
                <span className="text-muted-foreground">Overused</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-1 line-through decoration-wavy decoration-red-500">
                  term
                </span>
                <span className="text-muted-foreground">Avoid</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default HighlightSettings
