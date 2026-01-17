"use server"

interface SaveToRoadmapResult {
  success: boolean
  error?: string
}

export async function saveToRoadmap(input: { keyword: string }): Promise<SaveToRoadmapResult> {
  const keyword = input.keyword?.trim()
  if (!keyword) {
    return { success: false, error: "Keyword is required" }
  }

  // TODO: Wire to Content Roadmap persistence layer.
  return { success: true }
}
