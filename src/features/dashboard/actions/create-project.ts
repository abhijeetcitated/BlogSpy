"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { domainToASCII } from "url"
import { Prisma, type UserProject as PrismaUserProject } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { authenticatedAction, z } from "@/lib/safe-action"

const DOMAIN_REGEX =
  /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
const SUPPORTED_PROJECT_COUNTRIES = [
  "US",
  "IN",
  "UK",
  "CA",
  "AU",
  "GLOBAL",
] as const

function normalizeProjectCountry(input: string): string {
  const upper = input.trim().toUpperCase()
  if (upper === "GB") {
    return "UK"
  }
  return upper
}

function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, "")
  domain = domain.replace(/^www\./, "")
  domain = domain.split("/")[0]
  domain = domain.split("?")[0]
  domain = domain.split("#")[0]
  return domain
}

function toAsciiDomain(input: string): string {
  const ascii = domainToASCII(input)
  return ascii?.trim() ?? ""
}

const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "Name is required"),
  domain: z
    .string()
    .min(3, "Domain invalid")
    .transform((value) => toAsciiDomain(normalizeDomain(value)))
    .refine((value) => value.length > 0, "Domain invalid")
    .refine(
      (value) => DOMAIN_REGEX.test(value),
      "Invalid Domain Format (e.g., use google.com)"
    ),
  country: z
    .string()
    .min(2, "Country code is required")
    .transform((value) => normalizeProjectCountry(value))
    .refine(
      (value) =>
        SUPPORTED_PROJECT_COUNTRIES.includes(
          value as (typeof SUPPORTED_PROJECT_COUNTRIES)[number]
        ),
      "Unsupported country. Use US, IN, UK, CA, AU, or GLOBAL."
    ),
  idempotency_key: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export type UserProjectPayload = {
  id: string
  userid: string
  projectname: string
  domain: string
  targetcountry: string
  icon: string | null
  gscpropertyid: string | null
  createdat: string
  updatedat: string
}

export type CreateProjectResult = {
  success: boolean
  project?: UserProjectPayload
  error?: string
  code?: string
}

function serializeProject(project: PrismaUserProject): UserProjectPayload {
  return {
    id: project.id,
    userid: project.userid,
    projectname: project.projectname,
    domain: project.domain,
    targetcountry: project.targetcountry,
    icon: project.icon,
    gscpropertyid: project.gscpropertyid,
    createdat: project.createdat.toISOString(),
    updatedat: project.updatedat.toISOString(),
  }
}

export const createProject = authenticatedAction
  .schema(CreateProjectSchema)
  .action(async ({ parsedInput, ctx }): Promise<CreateProjectResult> => {
    const userId = ctx.userId
    const projectName = parsedInput.name
    const domain = parsedInput.domain

    const [projectCount, profile] = await Promise.all([
      prisma.userProject.count({
        where: {
          userid: userId,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { billing_tier: true },
      }),
    ])

    const billingTier = profile?.billing_tier ?? "free"
    if (billingTier === "free" && projectCount >= 1000) {
      throw new Error("LIMIT_REACHED")
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

    try {
      const newProject = await prisma.$transaction(async (tx) => {
        const createdProject = await tx.userProject.create({
          data: {
            userid: userId,
            projectname: projectName,
            domain,
            targetcountry: parsedInput.country,
            icon: faviconUrl,
          },
        })

        await tx.activityLog.create({
          data: {
            user_id: userId,
            project_id: createdProject.id,
            action_type: "PROJECT_CREATED",
            description: `Created new project '${projectName}'`,
            meta_data: { domain },
          },
        })

        return createdProject
      })

      revalidatePath("/dashboard", "layout")

      return {
        success: true,
        project: serializeProject(newProject),
      }
    } catch (error) {
      console.error("[CreateProject] Error:", error)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("DUPLICATE_DOMAIN")
        }
        if (error.code === "P2003") {
          throw new Error("DATABASE_CONSTRAINT_ERROR")
        }
        throw new Error("DATABASE_ERROR")
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error("DATABASE_UNAVAILABLE")
      }

      if (
        error instanceof Error &&
        (error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT") ||
          error.message.includes("ENOTFOUND") ||
          error.message.includes("connection") ||
          error.message.includes("timeout"))
      ) {
        throw new Error("DATABASE_UNAVAILABLE")
      }

      throw error
    }
  })
