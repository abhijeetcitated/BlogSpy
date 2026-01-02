"use client"

// ============================================
// CHECKBOX COLUMN - Row selection checkbox
// ============================================

import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxColumnProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function CheckboxColumn({
  id,
  checked,
  onCheckedChange,
  disabled = false,
}: CheckboxColumnProps) {
  return (
    <Checkbox
      id={`select-${id}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={`Select row ${id}`}
    />
  )
}

// Header checkbox for select all
interface CheckboxHeaderProps {
  checked: boolean | "indeterminate"
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function CheckboxHeader({
  checked,
  onCheckedChange,
  disabled = false,
}: CheckboxHeaderProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label="Select all rows"
    />
  )
}
