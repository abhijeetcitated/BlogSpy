// ============================================
// AI WRITER - Editor Toolbar Component
// ============================================

"use client"

import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
  Code,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50 rounded-t-lg min-w-max">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0 shrink-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0 shrink-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1 shrink-0" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("bold") && "bg-muted text-emerald-400")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("italic") && "bg-muted text-emerald-400")}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1 shrink-0" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("heading", { level: 1 }) && "bg-muted text-emerald-400")}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("heading", { level: 2 }) && "bg-muted text-emerald-400")}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("heading", { level: 3 }) && "bg-muted text-emerald-400")}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1 shrink-0" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("bulletList") && "bg-muted text-emerald-400")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("orderedList") && "bg-muted text-emerald-400")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1 shrink-0" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("blockquote") && "bg-muted text-emerald-400")}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("h-8 w-8 p-0 shrink-0", editor.isActive("codeBlock") && "bg-muted text-emerald-400")}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
