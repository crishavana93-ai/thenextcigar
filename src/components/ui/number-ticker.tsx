import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue } from "framer-motion"

import { cn } from "@/lib/utils"

// Direction A — magazine tween, no spring bounce. Matches the editorial easing
// used across the redesign (section reveals, card hovers).
const EASE_DIRECTION_A = [0.16, 1, 0.3, 1] as const

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  duration = 1.8, // seconds — Direction A: 1800ms
  ease = EASE_DIRECTION_A,
  className,
  decimalPlaces = 0,
}: {
  value: number
  direction?: "up" | "down"
  className?: string
  delay?: number // delay in s
  duration?: number // seconds
  ease?: readonly number[]
  decimalPlaces?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const from = direction === "down" ? value : 0
  const to = direction === "down" ? 0 : value
  const motionValue = useMotionValue(from)
  const isInView = useInView(ref, { once: true, margin: "0px" })

  const format = (n: number) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)))

  // Paint each frame of the count into the span.
  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = format(latest)
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionValue, decimalPlaces])

  // Tween on viewport entry — duration + cubic-bezier, not a spring.
  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, to, {
      duration,
      ease: ease as number[],
      delay,
    })
    return () => controls.stop()
  }, [isInView, motionValue, to, duration, ease, delay])

  // Seed the start value so SSR/first paint shows a number, not a blank span.
  return (
    <span className={cn("inline-block tabular-nums", className)} ref={ref}>
      {format(from)}
    </span>
  )
}
