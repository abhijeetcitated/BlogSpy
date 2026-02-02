"use server"
import "server-only"

// ============================================
// FILTER PRESETS ACTIONS
// ============================================

import { authenticatedAction, z } from "@/lib/safe-action"
import type { FilterPreset } from "../store"
import {
  fetchPresetsDB,
  savePresetDB,
  deletePresetDB,
  updateDefaultPresetDB,
} from "../services/preset.service"

const SaveFilterPresetSchema = z.object({
  name: z.string().min(1, "Preset name is required"),
  filters: z.record(z.string(), z.unknown()),
  isDefault: z.boolean().optional(),
})

const DeleteFilterPresetSchema = z.object({
  id: z.string().uuid(),
})

const DefaultPresetSchema = z.object({
  id: z.string().uuid(),
})

export interface SaveFilterPresetResult {
  success: true
  preset: FilterPreset
}

export interface GetFilterPresetsResult {
  success: true
  presets: FilterPreset[]
}

export interface DeleteFilterPresetResult {
  success: true
  id: string
}

export interface SetDefaultPresetResult {
  success: true
  preset: FilterPreset
}

export const saveFilterPreset = authenticatedAction
  .schema(SaveFilterPresetSchema)
  .action(async ({ parsedInput, ctx }): Promise<SaveFilterPresetResult> => {
    const preset = await savePresetDB(
      ctx.userId,
      parsedInput.name.trim(),
      parsedInput.filters,
      parsedInput.isDefault ?? false
    )
    return {
      success: true,
      preset,
    }
  })

export const getFilterPresets = authenticatedAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<GetFilterPresetsResult> => {
    const presets = await fetchPresetsDB(ctx.userId)
    return { success: true, presets }
  })

export const deleteFilterPreset = authenticatedAction
  .schema(DeleteFilterPresetSchema)
  .action(async ({ parsedInput, ctx }): Promise<DeleteFilterPresetResult> => {
    await deletePresetDB(ctx.userId, parsedInput.id)
    return { success: true, id: parsedInput.id }
  })

export const setDefaultPreset = authenticatedAction
  .schema(DefaultPresetSchema)
  .action(async ({ parsedInput, ctx }): Promise<SetDefaultPresetResult> => {
    const preset = await updateDefaultPresetDB(ctx.userId, parsedInput.id)
    return { success: true, preset }
  })
