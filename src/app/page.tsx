'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import AnimatedBackground from '@/components/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import PortfolioShowcase from '@/components/sections/PortfolioShowcase'
import ContactSection from '@/components/sections/contact/ContactSection'
import WelcomeScreen from '@/components/WelcomeScreen'

import {
  hasPlayedIntro,
  isPageReload,
  resetIntroFlags,
  setIntroPlayed,
} from '@/lib/introState'

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

  useEffect(() => {
    // If navigating back from detail to projects
    if (window.location.hash === '#projects') {
      setShowWelcome(false)
      setShowApp(true)
      return
    }

    if (isPageReload()) {
      resetIntroFlags()

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
    <main style={{ position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <Hero showApp={showApp} />
        <About />
        <PortfolioShowcase />
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
  )
}
