"use client"

import { useCallback, useMemo, useState } from 'react'

export type HighlightMode = 'off' | 'basic'

export type TermHighlightSettings = {
  enabled: boolean
  mode: HighlightMode
}

export type UseTermHighlightOptions = {
  initialEnabled?: boolean
}

export type UseTermHighlightReturn = {
  settings: TermHighlightSettings
  setEnabled: (enabled: boolean) => void
  toggle: () => void
}

export function useTermHighlight(options: UseTermHighlightOptions = {}): UseTermHighlightReturn {
  const [enabled, setEnabledState] = useState<boolean>(options.initialEnabled ?? true)

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v)
  }, [])

  const toggle = useCallback(() => {
    setEnabledState((v) => !v)
  }, [])

  const settings = useMemo<TermHighlightSettings>(() => {
    return {
      enabled,
      mode: enabled ? 'basic' : 'off'
    }
  }, [enabled])

  return {
    settings,
    setEnabled,
    toggle
  }
}
