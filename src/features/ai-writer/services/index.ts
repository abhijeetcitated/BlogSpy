// ============================================
// AI WRITER - Services Barrel
// ============================================
// Lightweight, dependency-free defaults to keep builds stable.
// Replace with real implementations as features ship.
// ============================================

export type AIWriterExecuteInput = {
  operation:
    | "expand-text"
    | "rewrite-text"
    | "shorten-text"
    | "write-article"
    | "outline"
    | string
  content?: string
  keyword?: string
}

export type AIWriterExecuteResult = {
  success: boolean
  content?: string
  error?: string
}

export const aiWriterService = {
  async execute(input: AIWriterExecuteInput): Promise<AIWriterExecuteResult> {
    // Deterministic stub. Keeps UI flow working without calling external LLMs.
    const base = (input.content ?? "").trim()
    const kw = (input.keyword ?? "").trim()

    switch (input.operation) {
      case "expand-text":
        return {
          success: true,
          content: base
            ? `${base}\n\nAdditional context${kw ? ` for ${kw}` : ""}.`
            : `Additional context${kw ? ` for ${kw}` : ""}.`,
        }
      case "rewrite-text":
        return {
          success: true,
          content: base ? `Rewritten: ${base}` : "Rewritten text.",
        }
      case "shorten-text":
        return {
          success: true,
          content: base.length > 120 ? `${base.slice(0, 117)}...` : base || "Shortened text.",
        }
      default:
        return {
          success: false,
          error: "AI service not configured",
        }
    }
  },
}

export type Draft = {
  id: string
  title: string
  content: string
  keyword: string
  secondaryKeywords?: string[]
  status?: "draft" | "published"
  createdAt: string
  updatedAt: string
}

function nowIso(): string {
  return new Date().toISOString()
}

function makeId(prefix: string): string {
  // Low-collision, browser-safe ID.
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const DRAFTS_KEY = "blogspy.ai-writer.drafts.v1"

function readDraftsFromStorage(): Draft[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(DRAFTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Draft[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeDraftsToStorage(drafts: Draft[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch {
    // ignore
  }
}

export const draftService = {
  async createDraft(input: { title: string; content: string; keyword: string }): Promise<Draft> {
    const drafts = readDraftsFromStorage()
    const id = makeId("draft")
    const createdAt = nowIso()
    const d: Draft = {
      id,
      title: input.title,
      content: input.content,
      keyword: input.keyword,
      secondaryKeywords: [],
      status: "draft",
      createdAt,
      updatedAt: createdAt,
    }
    drafts.unshift(d)
    writeDraftsToStorage(drafts)
    return d
  },

  async updateDraft(id: string, patch: Partial<Pick<Draft, "title" | "content" | "keyword" | "secondaryKeywords" | "status">>): Promise<Draft | null> {
    const drafts = readDraftsFromStorage()
    const idx = drafts.findIndex((d) => d.id === id)
    if (idx === -1) return null

    const updated: Draft = {
      ...drafts[idx],
      ...patch,
      updatedAt: nowIso(),
    }

    drafts[idx] = updated
    writeDraftsToStorage(drafts)
    return updated
  },

  async getDraft(id: string): Promise<Draft | null> {
    const drafts = readDraftsFromStorage()
    return drafts.find((d) => d.id === id) ?? null
  },

  async listDrafts(): Promise<Draft[]> {
    return readDraftsFromStorage()
  },
}

export type VersionHistoryEntry = {
  id: string
  draftId: string
  title: string
  content: string
  createdAt: string
  wordCount: number
  version: number
  changeType?: string
  changeDescription?: string
}

const VERSIONS_KEY = "blogspy.ai-writer.versions.v1"

function readVersionsFromStorage(): VersionHistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(VERSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as VersionHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeVersionsToStorage(versions: VersionHistoryEntry[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions))
  } catch {
    // ignore
  }
}

function nextVersionNumber(versions: VersionHistoryEntry[], draftId: string): number {
  let max = 0
  for (const v of versions) {
    if (v.draftId === draftId && v.version > max) max = v.version
  }
  return max + 1
}

export const versionHistoryService = {
  async createVersion(input: {
    draftId: string
    content: string
    title: string
    changeType?: string
    changeDescription?: string
  }): Promise<VersionHistoryEntry> {
    const text = input.content.replace(/<[^>]+>/g, " ")
    const words = text.trim() ? text.trim().split(/\s+/).length : 0

    const versions = readVersionsFromStorage()
    const entry: VersionHistoryEntry = {
      id: makeId("ver"),
      draftId: input.draftId,
      title: input.title,
      content: input.content,
      createdAt: nowIso(),
      wordCount: words,
      version: nextVersionNumber(versions, input.draftId),
      changeType: input.changeType,
      changeDescription: input.changeDescription,
    }

    versions.push(entry)
    writeVersionsToStorage(versions)

    return entry
  },

  async getVersions(draftId: string): Promise<VersionHistoryEntry[]> {
    return readVersionsFromStorage()
      .filter((v) => v.draftId === draftId)
      .sort((a, b) => a.version - b.version)
  },

  async getVersion(draftId: string, versionId: string): Promise<VersionHistoryEntry | null> {
    const versions = readVersionsFromStorage()
    const v = versions.find((vv) => vv.draftId === draftId && vv.id === versionId)
    return v ?? null
  },
}

const AI_WRITER_CREDITS_KEY = "blogspy.ai-writer.credits.v1"
const DEFAULT_CREDIT_BALANCE = 100

function readCreditBalance(): number {
  if (typeof window === "undefined") return DEFAULT_CREDIT_BALANCE
  try {
    const raw = window.localStorage.getItem(AI_WRITER_CREDITS_KEY)
    if (!raw) return DEFAULT_CREDIT_BALANCE
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_CREDIT_BALANCE
  } catch {
    return DEFAULT_CREDIT_BALANCE
  }
}

function writeCreditBalance(balance: number): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AI_WRITER_CREDITS_KEY, String(Math.max(0, Math.floor(balance))))
  } catch {
    // ignore
  }
}

function getOperationCost(operation: string): number {
  // Lightweight pricing table (stub). Unknown ops default to 1.
  const costs: Record<string, number> = {
    "generate-faq": 3,
    "generate-conclusion": 2,
    "expand-text": 1,
    "rewrite-text": 1,
    "shorten-text": 1,
    outline: 2,
    "write-article": 6,
  }

  const cost = costs[operation]
  return Number.isFinite(cost) && cost > 0 ? cost : 1
}

export const creditsService = {
  getBalance(): number {
    return readCreditBalance()
  },

  hasEnoughCredits(operation: string): boolean {
    const cost = getOperationCost(operation)
    return readCreditBalance() >= cost
  },

  async deductCredits(operation: string): Promise<void> {
    const cost = getOperationCost(operation)
    const current = readCreditBalance()
    const next = Math.max(0, current - cost)
    writeCreditBalance(next)
  },
}

export type ExportFormat = "markdown" | "html" | "wordpress" | "json" | "docx"

export type ExportResult = {
  success: boolean
  content: string
  mimeType: string
  filename: string
}

export const exportService = {
  async export(
    html: string,
    metadata: {
      title: string
      metaTitle: string
      metaDescription: string
      slug: string
      focusKeyword: string
      secondaryKeywords: string[]
    },
    opts: { format: ExportFormat }
  ): Promise<ExportResult> {
    const safeTitle = (metadata.title || "export")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)

    switch (opts.format) {
      case "html":
        return { success: true, content: html, mimeType: "text/html", filename: `${safeTitle || "article"}.html` }
      case "wordpress":
        return {
          success: true,
          content: html,
          mimeType: "text/html",
          filename: `${safeTitle || "article"}.wordpress.html`,
        }
      case "json":
        return {
          success: true,
          content: JSON.stringify({ metadata, html }, null, 2),
          mimeType: "application/json",
          filename: `${safeTitle || "article"}.json`,
        }
      case "markdown":
      default:
        // Minimal HTML->MD-ish pass-through.
        return {
          success: true,
          content: html,
          mimeType: "text/markdown",
          filename: `${safeTitle || "article"}.md`,
        }
    }
  },
}

export const schemaService = {
  generateArticleSchema(input: {
    headline: string
    description: string
    datePublished: string
    keywords: string[]
    author: { name: string; url?: string }
    publisher: { name: string; logo?: string }
  }): { script: string } {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: input.headline,
      description: input.description,
      datePublished: input.datePublished,
      keywords: input.keywords,
      author: {
        "@type": "Person",
        name: input.author.name,
        url: input.author.url,
      },
      publisher: {
        "@type": "Organization",
        name: input.publisher.name,
        logo: input.publisher.logo
          ? { "@type": "ImageObject", url: input.publisher.logo }
          : undefined,
      },
    }

    return {
      script: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    }
  },
}

export type ReadabilityAnalysis = {
  score: {
    fleschKincaidGrade: number
    readingLevel: string
  }
  stats: {
    readingTimeMinutes: number
  }
  issues: Array<{ suggestion: string }>
}

export const readabilityService = {
  analyze(text: string): ReadabilityAnalysis {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200))

    // Very rough placeholder.
    const fleschKincaidGrade = Math.min(18, Math.max(3, Math.round(words / 250 + 6)))
    const readingLevel = fleschKincaidGrade <= 6 ? "Easy" : fleschKincaidGrade <= 10 ? "Medium" : "Hard"

    return {
      score: { fleschKincaidGrade, readingLevel },
      stats: { readingTimeMinutes },
      issues: [],
    }
  },
}

// Optional: present but unused in the refactored UI.
export const schemaGeneratorService = schemaService
