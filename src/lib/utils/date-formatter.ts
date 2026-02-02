"use client"

import { useUser } from "@/hooks/use-user"

type DateInput = Date | string

const DEFAULT_FORMAT = "DD/MM/YYYY"

function getDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((p) => p.type === "year")?.value ?? ""
  const month = parts.find((p) => p.type === "month")?.value ?? ""
  const day = parts.find((p) => p.type === "day")?.value ?? ""

  const monthShort = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
  }).format(date)

  return { year, month, day, monthShort }
}

/**
 * Format a date using the user's saved timezone and date format.
 * Must be called inside React components (reads User Context).
 */
export function formatUserDate(date: DateInput): string {
  const { profile } = useUser()
  const timeZone =
    profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const format = profile?.dateFormat || DEFAULT_FORMAT

  const dateObj = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(dateObj.getTime())) return ""

  const { year, month, day, monthShort } = getDateParts(dateObj, timeZone)

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`
    case "DD MMM YYYY":
      return `${day} ${monthShort} ${year}`
    case "MMM DD, YYYY":
      return `${monthShort} ${day}, ${year}`
    default:
      return `${day}/${month}/${year}`
  }
}
