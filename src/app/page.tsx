'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'

import AnimatedBackground from '@/components/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import PortfolioShowcase, { SECTION_BASE_CLASS } from '@/components/sections/PortfolioShowcase'
import GithubContributions from '@/components/sections/GithubContributions'
import Education from '@/components/sections/Education'
import ContactSection from '@/components/sections/contact/ContactSection'
import WelcomeScreen from '@/components/WelcomeScreen'

import {
  hasPlayedIntro,
  isPageReload,
  markHomeMounted,
  resetIntroFlags,
  setIntroPlayed,
} from '@/lib/introState'
import { clearActiveProjectId, consumeReturnToProjects } from '@/lib/projectReturn'

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [showApp, setShowApp] = useState(true)

  // Refreshing on a section link (e.g. /#about) restarts from a clean "/"
  useLayoutEffect(() => {
    if (isPageReload() && window.location.hash !== '') {
      resetIntroFlags(true)
      window.location.replace('/')
    }
  }, [])

  // Any later visit to this page in the same tab is a return, not a reload
  useEffect(() => () => markHomeMounted(), [])

  useEffect(() => {
    // Coming back from a project page (its Back button or the browser's):
    // skip the intro and land on the Projects section, on the same project
    const returning = !isPageReload() && consumeReturnToProjects()

    if (returning || window.location.hash === '#projects') {
      setShowWelcome(false)
      setShowApp(true)

      if (returning) {
        setTimeout(() =>
          document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' })
        )
      }
      return
    }

    if (isPageReload()) {
      resetIntroFlags()
      consumeReturnToProjects()
      clearActiveProjectId()

      if (window.location.hash) {
        history.replaceState(null, '', '/')
      }

      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    if (hasPlayedIntro()) {
      setShowWelcome(false)
      setShowApp(true)
      return
    }

    setShowWelcome(true)
    setShowApp(false)

    const timer = setTimeout(() => {
      setShowWelcome(false)
      setShowApp(true)
      setIntroPlayed()
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  return (
    // Visitors who turned off animations in their system settings get fades only
    <MotionConfig reducedMotion="user">
    <main style={{ position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <Hero showApp={showApp} />
        <About />
        <PortfolioShowcase />
        <Education />
        <section className={`${SECTION_BASE_CLASS} pt-0`}>
          <GithubContributions username="NottAstro" />
        </section>
        <ContactSection />
      </div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            onAnimationStart={(definition) => {
              if (definition === 'exit') {
                setShowApp(true)
              }
            }}
            transition={{
              duration: 1.2,
              ease: [0.76, 0, 0.24, 1],
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
            }}
          >
            <WelcomeScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </MotionConfig>
  )
}
