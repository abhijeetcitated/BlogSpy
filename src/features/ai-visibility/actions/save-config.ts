"use server"

import type { AIVisibilityConfig } from "../types"

export type SaveConfigResponse = {
  success: boolean
  data?: AIVisibilityConfig
  error?: string
}

export type GetConfigResponse = {
  success: boolean
  data?: AIVisibilityConfig
  error?: string
}

export type ListConfigResponse = {
  success: boolean
  data?: AIVisibilityConfig[]
  error?: string
}

type ActionResponse<T> = {
  data: T
  serverError?: string
}

export async function saveVisibilityConfig(
  _input: Record<string, unknown>
): Promise<ActionResponse<SaveConfigResponse>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}

export async function getVisibilityConfig(
  _input: Record<string, unknown>
): Promise<ActionResponse<GetConfigResponse>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}

export async function listVisibilityConfigs(
  _input: Record<string, unknown>
): Promise<ActionResponse<ListConfigResponse>> {
  return {
    data: {
      success: true,
      data: [],
    },
  }
}

export async function deleteVisibilityConfig(
  _input: Record<string, unknown>
): Promise<ActionResponse<SaveConfigResponse>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}
