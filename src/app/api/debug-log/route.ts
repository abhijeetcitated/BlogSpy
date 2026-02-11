import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Simple direct Prisma test
    const result = await prisma.activityLog.create({
      data: {
        user_id: "458b5e43-b3f6-448d-948c-cf19c98f3560",
        action_type: "DEBUG_TEST",
        description: "Direct Prisma test - " + new Date().toISOString(),
        meta_data: { test: true },
      },
    })

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error("Debug log error:", error)
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
