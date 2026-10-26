'use client'

import { RefObject, useEffect } from 'react'
import { useAnimation, useInView } from 'framer-motion'
import { EASE } from '@/lib/motion'

export type FloatConfig = {
  hidden: { opacity: number; y: number; scale?: number }
  duration?: number
  delay?: number
  // Vertical distance of the idle "bob" after the entrance (omit for none).
  bob?: number
  bobDuration?: number
}

export const HEADER_TITLE: FloatConfig = {
  hidden: { opacity: 0, y: 50 },
  bob: -10,
  bobDuration: 4,
}

export const HEADER_SUBTITLE: FloatConfig = {
  hidden: { opacity: 0, y: 35 },
  delay: 0.1,
  bob: -5,
  bobDuration: 4.4,
}

// Fades an element up while `inView`, then keeps it gently bobbing;
// resets to `hidden` when out of view. Spread the result onto a motion element.
// Pass a module-level config so its identity is stable.
export function useFloatIn(inView: boolean, config: FloatConfig) {
  const controls = useAnimation()

  useEffect(() => {
    const { hidden, duration = 0.8, delay = 0, bob, bobDuration = 4 } = config

    if (!inView) {
      controls.start(hidden)
      return
    }

    controls
      .start({
        opacity: 1,
        y: 0,
        ...(hidden.scale !== undefined && { scale: 1 }),
        transition: { duration, delay, ease: EASE },
      })
      .then(() => {
        if (bob === undefined) return
        controls.start({
          y: [0, bob, 0],
          transition: { duration: bobDuration, repeat: Infinity, ease: 'easeInOut' },
        })
      })
  }, [inView, controls, config])

  return { initial: config.hidden, animate: controls }
}

// Section header (observed via `ref`) with a floating title + subtitle.
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
