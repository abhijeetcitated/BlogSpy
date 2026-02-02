import { z } from "zod"

const MAX_NAME_LENGTH = 100

function isValidIanaTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value })
    return true
  } catch {
    return false
  }
}

export const ProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(MAX_NAME_LENGTH, "Full name must be 100 characters or less"),
  timezone: z.string().refine(isValidIanaTimeZone, "Invalid timezone"),
  dateFormat: z.string().optional(),
  language: z.string().optional(),
})

export type ProfileInput = z.infer<typeof ProfileSchema>
