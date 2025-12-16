import { useState, useEffect } from "react"

const LOADING_MESSAGES = [
  "Fetching page content...",
  "Analyzing HTML structure...",
  "Checking meta tags...",
  "Scanning images and alt tags...",
  "Validating internal links...",
  "Extracting NLP keywords...",
  "Checking mobile responsiveness...",
  "Calculating SEO score...",
  "Finalizing report...",
]

export function useLoadingMessage(progress: number) {
  const [message, setMessage] = useState(LOADING_MESSAGES[0])

  useEffect(() => {
    const index = Math.floor((progress / 100) * LOADING_MESSAGES.length)
    const messageIndex = Math.min(index, LOADING_MESSAGES.length - 1)
    setMessage(LOADING_MESSAGES[messageIndex])
  }, [progress])

  return message
}
