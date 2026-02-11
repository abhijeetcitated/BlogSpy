import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

type LogActivityInput = {
  userId: string
  projectId?: string | null
  action: string
  description: string
  meta?: Prisma.InputJsonValue
}

export async function logActivity({
  userId,
  projectId,
  action,
  description,
  meta,
}: LogActivityInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      user_id: userId,
      project_id: projectId ?? null,
      action_type: action,
      description,
      meta_data: meta ?? {},
    },
  })
}

type LoggerPayload = Record<string, unknown>

export const logger = {
  info: (message: string, payload?: LoggerPayload) => {
    console.log(message, payload ?? {})
  },
  error: (message: string, payload?: LoggerPayload) => {
    console.error(message, payload ?? {})
  },
  warn: (message: string, payload?: LoggerPayload) => {
    console.warn(message, payload ?? {})
  },
  debug: (message: string, payload?: LoggerPayload) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(message, payload ?? {})
    }
  },
}
