"use client"

/**
 * Register Page - Supabase Authentication
 * Dedicated sign-up experience
 */

import { useActionState, useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { Loader2, Mail, Lock, Chrome, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp, signInWithGoogle } from "../actions/auth"
import { toast } from "sonner"

const features = [
  "Unlimited keyword research",
  "Rank tracking for 50+ keywords",
  "AI-powered content analysis",
  "Priority support",
]

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  // Signup form state
  const [signupState, signupAction] = useActionState(signUp, { success: true })

  // Show error toast when action fails
  useEffect(() => {
    if (signupState && !signupState.success && signupState.error) {
      toast.error("Sign up failed", {
        description: signupState.error,
      })
    }
  }, [signupState])

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true)
    startTransition(async () => {
      const result = await signInWithGoogle()
      if (!result.success && result.error) {
        toast.error("Google sign-in failed", {
          description: result.error,
        })
        setIsGoogleLoading(false)
      }
    })
  }

  return (
    <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-white">Create Your Account</CardTitle>
        <CardDescription className="text-zinc-400">
          Start optimizing your content today
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Signup Form */}
        <form action={signupAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-zinc-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-zinc-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="signup-password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-zinc-500">Must be at least 6 characters</p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isPending}
          className="w-full bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Google...
            </>
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </>
          )}
        </Button>

        {/* Features List */}
        <div className="pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-400 mb-3 text-center">What you&apos;ll get:</p>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Links */}
        <div className="space-y-3">
          <div className="text-center text-xs text-zinc-500">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-emerald-500 hover:text-emerald-400 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-emerald-500 hover:text-emerald-400 underline">
              Privacy Policy
            </a>
          </div>

          <div className="text-center text-sm text-zinc-400 pt-2 border-t border-zinc-800">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
