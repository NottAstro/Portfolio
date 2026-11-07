'use client'

import { RefObject, useEffect } from 'react'
import { useAnimation, useInView } from 'framer-motion'
import { EASE } from '@/lib/motion'

export type FloatConfig = {
  hidden: { opacity: number; y: number }
  duration?: number
  delay?: number
}

export const HEADER_TITLE: FloatConfig = {
  hidden: { opacity: 0, y: 24 },
}

export const HEADER_SUBTITLE: FloatConfig = {
  hidden: { opacity: 0, y: 16 },
  delay: 0.1,
}

// Fades an element up while `inView` and back out when it leaves the screen,
// so the entrance replays on every scroll past. Spread the result onto a motion
// element. Pass a module-level config so its identity is stable.
export function useFloatIn(inView: boolean, config: FloatConfig) {
  const controls = useAnimation()

  useEffect(() => {
    const { hidden, duration = 0.6, delay = 0 } = config

    if (!inView) {
      controls.start({ ...hidden, transition: { duration: 0.3, ease: EASE } })
      return
    }

    controls.start({ opacity: 1, y: 0, transition: { duration, delay, ease: EASE } })
  }, [inView, controls, config])

  return { initial: config.hidden, animate: controls }
}

// Section header (observed via `ref`) with a title + subtitle that fade in on scroll.
export default function useFloatingHeader(
  ref: RefObject<Element | null>,
  titleConfig: FloatConfig = HEADER_TITLE,
  subtitleConfig: FloatConfig = HEADER_SUBTITLE
) {
  const inView = useInView(ref, { once: false, amount: 0.3 })

  return {
    inView,
    title: useFloatIn(inView, titleConfig),
    subtitle: useFloatIn(inView, subtitleConfig),
  }
}
