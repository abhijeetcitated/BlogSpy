"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// ═══════════════════════════════════════════════════════════════════════════
// useAnimatedCounter — Animates a number from 0 to target value
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Smoothly animates a number from 0 to target.
 * Uses requestAnimationFrame for 60fps butter-smooth animation.
 * Re-triggers when `target` changes (e.g., new scan result).
 */
export function useAnimatedCounter(target: number, duration = 800): number {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    const startValue = prevTarget.current
    prevTarget.current = target

    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (target - startValue) * eased)
      setValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}

// ═══════════════════════════════════════════════════════════════════════════
// useInView — Triggers when element scrolls into viewport
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns a ref and a boolean. Attach ref to any element.
 * `inView` becomes true (and stays true) when element enters viewport.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string; once?: boolean } = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px 0px -40px 0px", once = true } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}

// ═══════════════════════════════════════════════════════════════════════════
// FadeUp — Wrapper component for scroll-triggered fade-up animation
// ═══════════════════════════════════════════════════════════════════════════

interface FadeUpProps {
  children: React.ReactNode
  /** Delay in ms (stagger children) */
  delay?: number
  className?: string
}

/**
 * Wraps children in a div that fades up when scrolled into view.
 * Uses IntersectionObserver (no framer-motion needed).
 */
export function FadeUp({ children, delay = 0, className = "" }: FadeUpProps) {
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
