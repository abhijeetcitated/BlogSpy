import { NextResponse } from "next/server"

const FEATURE_NOT_AVAILABLE = {
  success: false,
  error: "FEATURE_NOT_AVAILABLE",
}

export async function GET() {
  return NextResponse.json(FEATURE_NOT_AVAILABLE, { status: 503 })
}

export async function POST() {
  return NextResponse.json(FEATURE_NOT_AVAILABLE, { status: 503 })
}

export async function PATCH() {
  return NextResponse.json(FEATURE_NOT_AVAILABLE, { status: 503 })
}

export async function DELETE() {
  return NextResponse.json(FEATURE_NOT_AVAILABLE, { status: 503 })
}
