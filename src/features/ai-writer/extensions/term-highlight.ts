import { Extension } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"

export const termHighlightPluginKey = new PluginKey("ai-writer-term-highlight")

export type TermHighlightOptions = {
  enabled: boolean
  terms: string[]
}

export const TermHighlight = Extension.create<TermHighlightOptions>({
  name: "termHighlight",

  addOptions() {
    return {
      enabled: false,
      terms: [],
    }
  },

  // No-op by default. Real implementation can install a ProseMirror plugin
  // that decorates matching terms.
  addProseMirrorPlugins() {
    return []
  },
})
