"use client"

import { useActionState, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Lock, CheckCircle, Search, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "../actions/reset-password"
import { createBrowserClient } from "@/lib/supabase/client"

type ActionState = {
    success: boolean
    error?: string
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

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createBrowserClient()

    // Check if we are verifying a code
    const initialCode = searchParams.get("code")
    const [isVerifying, setIsVerifying] = useState(!!initialCode)
    const verificationAttempted = useRef(false) // Strict Mode Guard

    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        resetPassword,
        { success: false }
    )

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Handle Code Exchange
    useEffect(() => {
        const code = searchParams.get("code")
        if (code && !verificationAttempted.current) {
            verificationAttempted.current = true // Mark as attempting

            const exchangeCode = async () => {
                try {
                    const { error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) {
                        // Check if we actually have a session despite error (race condition)
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session) {
                            toast.success("Identity verified")
                            setIsVerifying(false)
                            return
                        }
                        toast.error("Invalid or expired link. Please request a new one.")
                    } else {
                        toast.success("Identity verified", { description: "Set your new password now." })
                        // Clean URL but keep user on page
                        router.replace("/reset-password")
                    }
                } catch (err) {
                    console.error("Auth error:", err)
                    toast.error("Authentication failed")
                } finally {
                    setIsVerifying(false)
                }
            }
            exchangeCode()
        } else if (!code) {
            // If accessed without code, stop verifying loader
            setIsVerifying(false)
        }
    }, [searchParams, supabase.auth, router])

    useEffect(() => {
        if (state.error) {
            toast.error("Error", { description: state.error })
        }
    }, [state])

    return (
        <div className="dark flex min-h-screen w-full overflow-hidden noise-bg bg-zinc-950">
            <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-16">
                <div className="mx-auto w-full max-w-md space-y-8">
                    <Logo />

                    <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
                                    <Lock className="h-6 w-6 text-zinc-950" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                            <p className="text-zinc-400 text-sm">
                                Enter your new password below
                            </p>
                        </div>

                        {/* Loading State for Code Exchange */}
                        {isVerifying ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                                <p className="text-sm text-zinc-400">Verifying secure link...</p>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm text-zinc-400">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-11 bg-zinc-900 border-white/5 shadow-inner pr-10 transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm text-zinc-400">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-11 bg-zinc-900 border-white/5 shadow-inner pr-10 transition-all duration-300 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20 focus:bg-zinc-900/80 placeholder:text-zinc-600 text-white"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}

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
                </div>
            </div>
        </div>
    )
}
