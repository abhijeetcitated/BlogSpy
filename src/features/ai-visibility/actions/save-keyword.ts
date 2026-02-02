"use server"

export type KeywordResponse = {
  success: boolean
  data?: unknown
  error?: string
}

type ActionResponse<T> = {
  data: T
  serverError?: string
}

export async function addTrackedKeyword(
  _input: Record<string, unknown>
): Promise<ActionResponse<KeywordResponse>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}

export async function getTrackedKeywords(
  _input: Record<string, unknown>
): Promise<ActionResponse<KeywordResponse>> {
  return {
    data: {
      success: true,
      data: [],
    },
  }
}

export async function deleteTrackedKeyword(
  _input: Record<string, unknown>
): Promise<ActionResponse<KeywordResponse>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}
