'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import useFloatingHeader from '@/hooks/useFloatingHeader'
import { SECTION_TITLE_CLASS } from '@/lib/styles'

type SectionHeaderProps = {
  title: string
  subtitle: string
  // Spacing below the header / below the title (sections that fit one screen use tighter values)
  className?: string
  titleClassName?: string
}

// Centered title + subtitle shared by every section, so they all look the same
export default function SectionHeader({
  title,
  subtitle,
  className = 'mb-14',
  titleClassName = 'mb-4',
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const header = useFloatingHeader(ref)

  return (
    <div ref={ref} className={`flex flex-col items-center text-center ${className}`}>
      <motion.h2 {...header.title} className={`${SECTION_TITLE_CLASS} ${titleClassName}`}>
        {title}
      </motion.h2>
      <motion.p
        {...header.subtitle}
        className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl"
      >
        {subtitle}
      </motion.p>
    </div>
  )
}
