"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export interface FeatureLockedProps {
  title?: string
}

export function FeatureLocked({ title = "Feature unavailable" }: FeatureLockedProps) {
  return (
    <div className="w-full">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-10">
        <Card className="w-full border-zinc-800 bg-zinc-950/60 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
              <Lock className="h-6 w-6 text-zinc-300" />
            </div>

            <h1 className="text-balance text-xl font-semibold text-zinc-50 sm:text-2xl">
              {title}
            </h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-zinc-400">
              This tool is currently disabled for your workspace. If you need access, enable it in your rollout plan or upgrade your plan.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing">
                <Button className="bg-linear-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
                  View pricing
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-zinc-800 text-zinc-200 hover:bg-zinc-900">
                  Back to dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
