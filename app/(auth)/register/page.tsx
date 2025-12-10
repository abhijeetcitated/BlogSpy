"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, Sparkles, Construction, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  "500 keyword searches/month",
  "10 rank tracking keywords",
  "Basic content analysis",
  "Email support",
]

export default function RegisterPage() {
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
        <CardTitle className="text-2xl font-bold text-white">Get Started Free</CardTitle>
        <CardDescription className="text-slate-400">
          Try BlogSpy with a demo account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coming Soon Notice */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <Construction className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium text-sm">Registration Coming Soon</p>
              <p className="text-amber-400/70 text-xs mt-1">
                Account creation will be available soon. For now, explore all features with our demo account.
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
              Starting Demo...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Try Demo Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* Free Plan Features */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-400 mb-3 text-center">What you&apos;ll get with free plan:</p>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Already have account */}
        <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
