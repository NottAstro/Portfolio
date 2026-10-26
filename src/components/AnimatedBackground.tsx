'use client'

import { useEffect, useRef } from 'react'

const BLOBS = [
  // Top left
  'top-10 left-10 w-40 h-40 md:w-56 md:h-56 bg-white blur-[90px] opacity-30',
  // Top right
  'top-10 right-10 w-40 h-40 md:w-56 md:h-56 bg-zinc-300 blur-[100px] opacity-25',
  // Bottom left
  'bottom-10 left-10 w-44 h-44 md:w-60 md:h-60 bg-zinc-400 blur-[110px] opacity-30',
  // Bottom right
  'bottom-10 right-10 w-40 h-40 md:w-56 md:h-56 bg-white blur-[100px] opacity-20',
]

const AnimatedBackground = () => {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const scroll = window.scrollY

      blobRefs.current.forEach((blob, index) => {
        if (!blob) return

        const xOffset = Math.sin(scroll / 120 + index * 0.6) * 100
        const yOffset = Math.cos(scroll / 120 + index * 0.6) * 35

        blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`
      })
    }

    // At most one DOM update per frame, and only while scrolling
    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        {BLOBS.map((className, i) => (
          <div
            key={i}
            ref={(ref) => {
              blobRefs.current[i] = ref
            }}
            className={`absolute rounded-full ${className}`}
            style={{ transition: 'transform 1.2s ease-out' }}
          />
        ))}
      </div>

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:26px_26px]" />
    </div>
  )
}

export default AnimatedBackground
