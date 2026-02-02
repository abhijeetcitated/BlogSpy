// ============================================
// GREETING UTILS - Time-based Greeting System
// ============================================
// Automatically works for ALL countries/timezones
// Browser's Date API uses user's local timezone
// ============================================

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night"

export interface GreetingConfig {
  greeting: string
  emoji: string
  timeOfDay: TimeOfDay
}

/**
 * Get time of day based on user's local time
 * Works automatically for any timezone in the world
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours() // Automatically uses user's local timezone
  
  if (hour >= 5 && hour < 12) return "morning"      // 5 AM - 11:59 AM
  if (hour >= 12 && hour < 17) return "afternoon"   // 12 PM - 4:59 PM
  if (hour >= 17 && hour < 21) return "evening"     // 5 PM - 8:59 PM
  return "night"                                     // 9 PM - 4:59 AM
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(date: Date = new Date()): GreetingConfig {
  const timeOfDay = getTimeOfDay(date)
  
  const greetings: Record<TimeOfDay, GreetingConfig> = {
    morning: {
      greeting: "Good morning",
      emoji: "🌅",
      timeOfDay: "morning",
    },
    afternoon: {
      greeting: "Good afternoon", 
      emoji: "☀️",
      timeOfDay: "afternoon",
    },
    evening: {
      greeting: "Good evening",
      emoji: "🌆",
      timeOfDay: "evening",
    },
    night: {
      greeting: "Good night",
      emoji: "🌙",
      timeOfDay: "night",
    },
  }
  
  return greetings[timeOfDay]
}

/**
 * Motivational messages - random selection
 */
const MOTIVATIONAL_MESSAGES = [
  "Ready to dominate the SERPs?",
  "Let's find some winning keywords!",
  "Time to outrank your competitors!",
  "Let's grow your traffic today!",
  "Ready to discover new opportunities?",
  "Let's make your content shine!",
]

export function getMotivationalMessage(): string {
  const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
  return MOTIVATIONAL_MESSAGES[index]
}

/**
 * Format date for user's locale
 * Automatically uses user's browser locale (language + region)
 */
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric", 
    month: "long",
    day: "numeric",
  })
}

/**
 * Format time for user's locale
 */
export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Get complete greeting data
 */
export interface GreetingData {
  greeting: string
  emoji: string
  message: string
  date: string
  time: string
  timeOfDay: TimeOfDay
  timezone: string
}

export function getGreetingData(userName?: string): GreetingData {
  const now = new Date()
  const { greeting, emoji, timeOfDay } = getGreeting(now)
  
  return {
    greeting: userName ? `${greeting}, ${userName}!` : `${greeting}!`,
    emoji,
    message: getMotivationalMessage(),
    date: formatDate(now),
    time: formatTime(now),
    timeOfDay,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}
