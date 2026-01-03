"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Mail, Sparkles, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forgot-password",
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
          <CardDescription className="text-slate-400">
            We&apos;ve sent a password reset link to
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
            <p className="text-emerald-400 font-medium">{email}</p>
          </div>
          
          <div className="text-sm text-slate-400 text-center space-y-2">
            <p>Click the link in the email to reset your password.</p>
            <p>If you don&apos;t see it, check your spam folder.</p>
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="w-full border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              Try a different email
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <Link
            href="/login"
            className="flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors mx-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white">Forgot password?</CardTitle>
        <CardDescription className="text-slate-400">
          No worries, we&apos;ll send you reset instructions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
          >
            {isLoading ? (
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
      </CardContent>

      <CardFooter>
        <Link
          href="/login"
          className="flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors mx-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
