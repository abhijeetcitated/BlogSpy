import { PrismaClient, content_status, device_type } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ select: { id: true } })
  if (!user) {
    console.log("[seed] No user found. Skipping.")
    return
  }

  const project = await prisma.userProject.findFirst({
    where: { userid: user.id },
    select: { id: true },
  })

  if (!project) {
    console.log("[seed] No user project found. Skipping.")
    return
  }

  const rankCount = await prisma.ranking.count({
    where: { project_id: project.id },
  })
  if (rankCount === 0) {
    const keywordSlug = "ai-agents"
    const existingKeyword = await prisma.keyword.findFirst({
      where: { slug: keywordSlug },
      select: { id: true },
    })
    const keywordId =
      existingKeyword?.id ??
      (
        await prisma.keyword.create({
          data: {
            slug: keywordSlug,
            keyword: "ai agents",
            country_code: "US",
            match_type: "exact",
          },
          select: { id: true },
        })
      ).id

    await prisma.ranking.createMany({
      data: [
        {
          project_id: project.id,
          keyword_id: keywordId,
          position: 7,
          device: device_type.desktop,
        },
        {
          project_id: project.id,
          keyword_id: keywordId,
          position: 12,
          device: device_type.desktop,
        },
      ],
    })
  }

  const decayCount = await prisma.contentPerformance.count({
    where: { project_id: project.id },
  })
  if (decayCount === 0) {
    await prisma.contentPerformance.createMany({
      data: [
        {
          project_id: project.id,
          url: "https://example.com/ai-tools-2025",
          status: content_status.DECAYING,
        },
        {
          project_id: project.id,
          url: "https://example.com/seo-checklist",
          status: content_status.STABLE,
        },
      ],
    })
  }

  const trendCount = await prisma.trendWatchlist.count({
    where: { project_id: project.id },
  })
  if (trendCount === 0) {
    await prisma.trendWatchlist.createMany({
      data: [
        {
          project_id: project.id,
          topic: "AI Agents",
          growth_percent: 39,
        },
        {
          project_id: project.id,
          topic: "Zero-click SEO",
          growth_percent: 22,
        },
      ],
    })
  }

  await prisma.billCredit.upsert({
    where: { user_id: user.id },
    update: {
      credits_used: 250,
      credits_total: 1000,
    },
    create: {
      user_id: user.id,
      credits_used: 250,
      credits_total: 1000,
    },
  })

  console.log("[seed] Seed data inserted.")
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
