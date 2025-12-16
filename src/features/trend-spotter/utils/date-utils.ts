/**
 * Calculate the number of days until a specific date
 * @param monthIndex - 0-based month index (0 = January)
 * @param day - Day of the month
 * @param eventYear - Year of the event
 * @returns Number of days until the event (negative if past)
 */
export function calculateDaysUntil(
  monthIndex: number, 
  day: number, 
  eventYear: number
): number {
  const today = new Date()
  const eventDate = new Date(eventYear, monthIndex, day)
  const diffTime = eventDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Get current date information
 */
export function getCurrentDateInfo() {
  const currentDate = new Date()
  return {
    currentDate,
    currentMonth: currentDate.getMonth(),
    currentYear: currentDate.getFullYear(),
    currentDay: currentDate.getDate(),
  }
}

/**
 * Parse exact date string (format: "MM-DD")
 * @param exactDate - Date string in "MM-DD" format
 * @returns Object with month and day
 */
export function parseExactDate(exactDate: string): { month: number; day: number } {
  const [month, day] = exactDate.split("-").map(Number)
  return { month, day }
}
