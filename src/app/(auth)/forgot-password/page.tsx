"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Mail, CheckCircle, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "../actions/forgot-password"

type ActionState = {
  success: boolean
  error?: string
  message?: string
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
          <Search className="h-5 w-5 text-zinc-950" />
        </div>
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 opacity-40 blur-md -z-10" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-white">
        Cita<span className="text-amber-400">Ted</span>
      </span>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    forgotPassword,
    { success: false }
  )

  useEffect(() => {
    if (state.error) {
      toast.error("Error", { description: state.error })
    }
  }, [state])

  // Success state - show confirmation
  if (state.success && state.message) {
    return (
      <div className="dark flex min-h-screen w-full overflow-hidden noise-bg bg-zinc-950">
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-16">
          <div className="mx-auto w-full max-w-md space-y-8">
            <Logo />

            <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-8 space-y-6">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Check your email</h1>
                <p className="text-zinc-400 text-sm">
                  {state.message}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Mail className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p>Click the link in the email to reset your password.</p>
                    <p className="text-zinc-500 mt-1">If you don&apos;t see it, check your spam folder.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full h-11 border-white/5 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Try a different email
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default state - show form
  return (
    <div className="dark flex min-h-screen w-full overflow-hidden noise-bg bg-zinc-950">
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <Logo />

          <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
                  <Mail className="h-6 w-6 text-zinc-950" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
              <p className="text-zinc-400 text-sm">
                No worries, we&apos;ll send you reset instructions
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-zinc-400">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 bg-zinc-900 border-white/5 shadow-inner transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-bold hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:shadow-xl border-0"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2">
              <Link
                href="/login"
                className="flex items-center justify-center text-sm text-zinc-500 hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>

          {/* Security note */}
          <p className="text-center text-xs text-zinc-600">
            For security, we&apos;ll only send a reset link if an account exists with this email.
          </p>
        </div>
      </div>
    </div>
  )
}
