import { useEffect, useRef } from "react"

export interface KeyboardShortcutHandlers {
  onFocusSearch?: () => void
  onScan?: () => void
  onExport?: () => void
  onCloseModal?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handlersRef = useRef(handlers)

  // Keep handlers up to date
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "k":
            // Focus search input
            e.preventDefault()
            handlersRef.current.onFocusSearch?.()
            break
          case "enter":
            // Run scan
            e.preventDefault()
            handlersRef.current.onScan?.()
            break
          case "s":
            // Export/Save
            e.preventDefault()
            handlersRef.current.onExport?.()
            break
        }
      }

      // ESC to close modal
      if (e.key === "Escape") {
        handlersRef.current.onCloseModal?.()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])
}
