import { Node, mergeAttributes } from "@tiptap/core"

/**
 * TipTap extension for <summary> element (child of <details>).
 * Accepts text and inline nodes inside.
 */
export const DetailsSummary = Node.create({
  name: "detailsSummary",
  group: "block",           // Allow it as a block child inside details
  content: "text*",         // Plain text content (keep it simple)
  defining: true,
  selectable: true,
  parseHTML() {
    return [{ tag: "summary" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["summary", mergeAttributes(HTMLAttributes), 0]
  },
})

/**
 * TipTap extension for <details> element (FAQ dropdown).
 * Accepts summary + any block nodes (paragraphs, lists, etc.).
 */
export const Details = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary block+",  // summary first, then 1+ blocks
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: (element) => element.hasAttribute("open"),
        renderHTML: (attributes) => (attributes.open ? { open: "" } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "details" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["details", mergeAttributes(HTMLAttributes), 0]
  },
})
