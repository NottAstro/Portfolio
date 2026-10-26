'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import useFloatingHeader from '@/hooks/useFloatingHeader'
import ContactForm from './ContactForm'
import CommentsSection from './CommentsSection'

export default function ContactSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const header = useFloatingHeader(headerRef)

  return (
    <section
      id="contact"
      className="w-full max-w-[1500px] mx-auto px-5 sm:px-6 md:px-10 lg:px-20 pt-20 sm:pt-24 lg:pt-20 pb-10 lg:pb-4 text-white min-h-screen lg:h-screen lg:min-h-[640px] lg:flex lg:flex-col"
    >
      {/* HEADER */}
      <div ref={headerRef} className="text-center mb-8 sm:mb-10 lg:mb-5 shrink-0">
        <motion.h1
          {...header.title}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 lg:mb-2"
        >
          Contact Me
        </motion.h1>

        <motion.p
          {...header.subtitle}
          className="text-white/60 text-sm sm:text-base max-w-xl sm:max-w-2xl mx-auto leading-relaxed"
        >
          Have something in mind? Send a message and let&apos;s connect.
        </motion.p>
      </div>

      {/* CONTENT (fills the rest of the screen on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 sm:gap-8 md:gap-10 lg:gap-8 lg:flex-1 lg:min-h-0">
        {/* FORM */}
        <div className="w-full lg:min-h-0">
          <ContactForm />
        </div>

        {/* COMMENTS */}
        <div className="w-full lg:min-h-0">
          <CommentsSection />
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="mt-12 lg:mt-3 text-center text-xs text-white/35 shrink-0">
        © 2026 Aaryan Jain — All rights reserved.
      </div>
    </section>
  )
}
