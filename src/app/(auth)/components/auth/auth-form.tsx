"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithGoogle, signUp } from "../../actions/auth"
import type { AuthTab } from "./auth-page"
import { Logo } from "./logo"
import { SocialAuthButtons } from "./social-auth-buttons"

interface AuthFormProps {
  activeTab: AuthTab
  setActiveTab: (tab: AuthTab) => void
}

type ActionState = {
  success: boolean
  error?: string
}

export function AuthForm({ activeTab, setActiveTab }: AuthFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const [loginState, loginAction] = useActionState<ActionState, FormData>(signIn, { success: true })
  const [signupState, signupAction] = useActionState<ActionState, FormData>(signUp, { success: true })

  useEffect(() => {
    if (loginState && !loginState.success && loginState.error) {
      toast.error("Login failed", { description: loginState.error })
    }
  }, [loginState])

  useEffect(() => {
    if (signupState && !signupState.success && signupState.error) {
      toast.error("Sign up failed", { description: signupState.error })
    }
  }, [signupState])

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true)
    startTransition(async () => {
      const result = await signInWithGoogle()
      if (!result.success && result.error) {
        toast.error("Google sign-in failed", { description: result.error })
        setIsGoogleLoading(false)
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <Logo />

      <div className="relative">
        <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-white/5">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300 ease-out shadow-lg shadow-amber-500/20"
            style={{ left: activeTab === "login" ? "4px" : "calc(50% + 0px)" }}
          />

          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-300 rounded-lg ${activeTab === "login" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
              }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-300 rounded-lg ${activeTab === "signup" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
              }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SocialAuthButtons onGoogleClick={handleGoogleSignIn} isGoogleLoading={isGoogleLoading || isPending} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-3 text-zinc-500">Or continue with</span>
          </div>
        </div>
      </div>

      {activeTab === "login" ? (
        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm text-zinc-400">
              Email
            </Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              className="h-11 bg-zinc-900 border-white/5 shadow-inner transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-sm text-zinc-400">
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 bg-zinc-900 border-white/5 shadow-inner pr-10 transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-bold hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:shadow-xl border-0"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-zinc-500 hover:text-amber-400 transition-colors">
              Forgot password?
            </Link>
            <Link href="/terms" className="text-zinc-500 hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </form>
      ) : (
        <form action={signupAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-sm text-zinc-400">
              Full Name
            </Label>
            <Input
              id="signup-name"
              name="name"
              type="text"
              placeholder="John Doe"
              className="h-11 bg-zinc-900 border-white/5 shadow-inner transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm text-zinc-400">
              Email
            </Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              className="h-11 bg-zinc-900 border-white/5 shadow-inner transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-sm text-zinc-400">
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 bg-zinc-900 border-white/5 shadow-inner pr-10 transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Must be 8+ chars with uppercase, lowercase, number, and symbol.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-bold hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:shadow-xl border-0"
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

          <div className="flex items-center justify-between text-sm">
            <Link href="/terms" className="text-zinc-500 hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
