"use server"

import "server-only"

import { authenticatedAction, z } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"

export type ProjectSummary = {
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

export const getProjects = authenticatedAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<ProjectSummary[]> => {
    const userId = ctx.userId

    try {
      const projects = await prisma.userProject.findMany({
        where: { userid: userId },
        orderBy: { createdat: "desc" },
        select: {
          id: true,
          userid: true,
          projectname: true,
          domain: true,
          targetcountry: true,
          icon: true,
          gscpropertyid: true,
          createdat: true,
          updatedat: true,
        },
      })

      return projects.map((project) => ({
        ...project,
        createdat: project.createdat.toISOString(),
        updatedat: project.updatedat.toISOString(),
      }))
    } catch (error) {
      console.error("[GetProjects] Prisma query failed:", error instanceof Error ? error.message : error)
      return []
    }
  })
