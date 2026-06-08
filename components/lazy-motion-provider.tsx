"use client"

import { LazyMotion, domMax } from "framer-motion"

/**
 * Loads framer-motion features lazily and only the DOM feature set.
 * Combined with using the `m` component (instead of `motion`) across the app,
 * this cuts framer-motion's initial bundle from ~110kb to ~30kb.
 *
 * `domMax` is required because the navbar uses layout animations (`layoutId`).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  )
}
