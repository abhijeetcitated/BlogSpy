"use server"

import "server-only"

import { Prisma, device_type } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getServerUser as auth } from "@/lib/auth/server-auth"
import { publicAction, z } from "@/lib/safe-action"
import { buildCacheSlug, sanitizeKeywordInput } from "@/features/keyword-research/utils/input-parser"

const AddKeywordSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  keyword: z
    .string()
    .min(1, "Keyword is required")
    .transform((value) => sanitizeKeywordInput(value)),
  location: z.string().min(2, "Location is required"),
  device: z.nativeEnum(device_type).default(device_type.desktop),
})

export type AddKeywordInput = z.infer<typeof AddKeywordSchema>

type AddKeywordResult = {
  success: boolean
  rankingId?: string
  keywordId?: string
}

export const addKeyword = publicAction
  .schema(AddKeywordSchema)
  .action(async ({ parsedInput }): Promise<AddKeywordResult> => {
    const authResult = await auth()
    if (!authResult.isAuthenticated || !authResult.user) {
      throw new Error("UNAUTHORIZED")
    }

    const userId = authResult.user.id
    const { projectId, keyword, location, device } = parsedInput

    const project = await prisma.userProject.findFirst({
      where: { id: projectId, userid: userId },
      select: { id: true },
    })

    if (!project) {
      throw new Error("PROJECT_NOT_FOUND")
    }

    const slug = buildCacheSlug(keyword, location, "en", device)
    const countryCode = location.trim().toUpperCase()

    const keywordRecord = await prisma.keyword.upsert({
      where: { slug },
      create: {
        slug,
        keyword,
        country_code: countryCode,
        match_type: "exact",
      },
      update: {},
      select: { id: true },
    })

    const ranking = await prisma.ranking.create({
      data: {
        project_id: projectId,
        keyword_id: keywordRecord.id,
        position: 0,
        device,
      },
      select: { id: true },
    })

    await prisma.activityLog.create({
      data: {
        user_id: userId,
        project_id: projectId,
        action_type: "KEYWORD_ADDED",
        description: `Added keyword '${keyword}'`,
        meta_data: { keyword, location, device },
      },
    })

    return {
      success: true,
      rankingId: ranking.id,
      keywordId: keywordRecord.id,
    }
  })

export type { AddKeywordResult }
