import arcjet, { detectBot, shield } from "@arcjet/next"
import { NextResponse } from "next/server"

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
})

export async function middleware(req: Request) {
  const decision = await aj.protect(req)
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
