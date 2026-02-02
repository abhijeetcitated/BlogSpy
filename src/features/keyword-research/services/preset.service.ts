import "server-only"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import type { FilterPreset } from "../store"

type PresetRow = {
  id: string
  name: string
  filters: unknown
  is_default: boolean
  created_at: string
}

function mapPreset(row: PresetRow): FilterPreset {
  return {
    id: row.id,
    name: row.name,
    filters: row.filters as FilterPreset["filters"],
    isDefault: row.is_default,
    createdAt: row.created_at,
  }
}

export async function fetchPresetsDB(userId: string): Promise<FilterPreset[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("kw_filter_presets")
    .select("id, name, filters, is_default, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data as PresetRow[] | null)?.map(mapPreset) ?? []
}

export async function savePresetDB(
  userId: string,
  name: string,
  filters: Record<string, unknown>,
  isDefault: boolean
): Promise<FilterPreset> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("kw_filter_presets")
    .insert({
      user_id: userId,
      name,
      filters,
      is_default: isDefault,
    })
    .select("id, name, filters, is_default, created_at")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapPreset(data as PresetRow)
}

export async function deletePresetDB(userId: string, presetId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("kw_filter_presets")
    .delete()
    .eq("id", presetId)
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateDefaultPresetDB(
  userId: string,
  presetId: string
): Promise<FilterPreset> {
  const admin = createAdminClient()
  const { error: clearError } = await admin
    .from("kw_filter_presets")
    .update({ is_default: false })
    .eq("user_id", userId)

  if (clearError) {
    throw new Error(clearError.message)
  }

  const { data, error } = await admin
    .from("kw_filter_presets")
    .update({ is_default: true })
    .eq("user_id", userId)
    .eq("id", presetId)
    .select("id, name, filters, is_default, created_at")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapPreset(data as PresetRow)
}
