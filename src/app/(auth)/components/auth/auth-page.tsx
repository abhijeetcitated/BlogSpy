"use client"

import { useState } from "react"
import { AuthForm } from "./auth-form"
import { MarketingShowcase } from "./marketing-showcase"

export type AuthTab = "login" | "signup"

type AuthPageProps = {
  defaultTab: AuthTab
}

export function AuthPage({ defaultTab }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab)

  return (
    <div className="dark flex h-screen w-full overflow-hidden noise-bg bg-zinc-950">
      {/* Left Side - Auth Form (40%) */}
      <div className="relative z-10 flex w-full flex-col justify-center px-8 py-8 lg:w-[40%] lg:px-16">
        <AuthForm activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Right Side - Marketing Showcase (60%) */}
      <div className="relative hidden w-[60%] overflow-hidden lg:block">
        <MarketingShowcase />
      </div>
    </div>
  )
}
