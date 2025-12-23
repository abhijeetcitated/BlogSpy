// Schema Generator Helper Utilities

/**
 * Generate HTML script tag for JSON-LD
 */
export function generateScriptTag(jsonLd: string): string {
  return `<script type="application/ld+json">
${jsonLd}
</script>`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Download content as a file
 */
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Format ISO duration to readable format
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return isoDuration
  
  const hours = match[1] ? `${match[1]}h ` : ''
  const minutes = match[2] ? `${match[2]}m ` : ''
  const seconds = match[3] ? `${match[3]}s` : ''
  
  return `${hours}${minutes}${seconds}`.trim() || isoDuration
}
