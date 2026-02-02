"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { createCheckoutSession } from "@/features/billing/actions/create-checkout"
import { Button } from "@/components/ui/button"

interface BuyCreditsButtonProps {
  variantId: string
  credits: number
  label?: string
  className?: string
}

export function BuyCreditsButton({
  variantId,
  credits,
  label,
  className,
}: BuyCreditsButtonProps) {
  const { executeAsync, status } = useAction(createCheckoutSession)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const isLoading = status === "executing" || isRedirecting

  const handleCheckout = async () => {
    const result = await executeAsync({
      variantId,
      credits,
      redirectUrl: window.location.href,
    })
    const url = result?.data?.url
    if (url) {
      setIsRedirecting(true)
      window.location.href = url
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className}>
      {isLoading ? "Redirecting..." : label ?? `Buy ${credits} Credits`}
    </Button>
  )
}
