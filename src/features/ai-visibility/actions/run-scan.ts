"use server"

import type { FullScanResult } from "../services/scan.service"

export interface RunScanInput {
  keyword: string
  brandName: string
  targetDomain: string
}

export type RunScanResult = FullScanResult

export async function runFullScan(
  _input: RunScanInput
): Promise<{ success: boolean; data?: RunScanResult; error?: string; creditsUsed: number }> {
  return {
    success: false,
    error: "This feature is being rebuilt in V2",
    creditsUsed: 0,
  }
}

export async function getScanHistory(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return {
    success: true,
    data: [],
  }
}

export async function getKeywordScanResult(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return {
    success: false,
    error: "This feature is being rebuilt in V2",
  }
}

export async function getCreditBalance(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return {
    success: false,
    error: "This feature is being rebuilt in V2",
  }
}
