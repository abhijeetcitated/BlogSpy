"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, Sparkles, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    
    // Set demo user in localStorage
    const demoUser = {
      id: "demo_user_001",
      email: "demo@blogspy.io",
      name: "Demo User",
      plan: "PRO",
      credits: 999,
    }
    
    localStorage.setItem("auth_token", "demo_token_" + Date.now())
    localStorage.setItem("user", JSON.stringify(demoUser))
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push("/dashboard")
    setIsLoading(false)
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white">Welcome to BlogSpy</CardTitle>
        <CardDescription className="text-slate-400">
          Try our SEO tools with a demo account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coming Soon Notice */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <Construction className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium text-sm">Authentication Coming Soon</p>
              <p className="text-amber-400/70 text-xs mt-1">
                Full login & signup will be available in the next update. For now, use the demo account to explore all features.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Login Button - Primary Action */}
        <Button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Entering Demo...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Try Demo Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* Features Preview */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center mb-3">Demo includes full access to:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Keyword Research
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Rank Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Content Analyzer
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI Writer
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
