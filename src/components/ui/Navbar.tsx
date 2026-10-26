'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '@/lib/motion'

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Certificates', id: 'certificates' },
  { label: 'Tech Stack', id: 'techstack' },
  { label: 'Contributions', id: 'contributions' },
  { label: 'Contact', id: 'contact' },
]

const mono = "var(--font-dm-mono), 'DM Mono', monospace"

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mounted, setMounted] = useState(false)

  // Navbar appears only once
  const [showNavbar, setShowNavbar] = useState(false)

  useEffect(() => {
    setMounted(true)

    let frame = 0

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const updateScroll = () => {
      frame = 0
      setScrolled(window.scrollY > 20)

      for (const { id } of NAV_ITEMS) {
        const section = document.getElementById(id)
        if (!section) continue

        const rect = section.getBoundingClientRect()

        if (rect.top <= 160 && rect.bottom >= 160) {
          setActiveSection(id)
          break
        }
      }
    }

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScroll)
    }

    handleResize()
    updateScroll()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Navbar animation only plays on refresh
  useEffect(() => {
    if (sessionStorage.getItem('navbarPlayed')) {
      setShowNavbar(true)
      return
    }

    const timer = setTimeout(() => {
      setShowNavbar(true)
      sessionStorage.setItem('navbarPlayed', 'true')
    }, 3800)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  const smoothScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault()

    const target = document.querySelector(targetId)
    if (!target) return

    const navbarOffset = targetId === '#contributions' ? 80 : 3
    const startPosition = window.scrollY
    const distance = target.getBoundingClientRect().top - navbarOffset
    const duration = 200

    let startTime: number | null = null

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime

      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)

      window.scrollTo({
        top: startPosition + distance * easeInOutCubic(progress),
      })

      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
    setOpen(false)
  }

  const linkColor = (id: string) =>
    activeSection === id ? 'var(--text-primary)' : 'var(--text-secondary)'

  return (
    <motion.nav
      initial={{ opacity: 0, y: -40 }}
      animate={{
        opacity: showNavbar ? 1 : 0,
        y: showNavbar ? 0 : -40,
      }}
      transition={{
        duration: 0.8,
        ease: EASE,
      }}
      style={{
        position: 'fixed',
        top: 20,
        left: isMobile ? 20 : 60,
        right: isMobile ? 20 : 60,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 30px',
          width: '100%',
          borderRadius: 999,
          backgroundColor: scrolled
            ? 'rgba(13,13,13,0.85)'
            : 'rgba(13,13,13,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 13,
            color: 'var(--text-secondary)',
            letterSpacing: '0.1em',
          }}
        >
          aaryan.dev
        </span>

        {isMobile ? (
          <div
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 20, height: 2, background: 'white' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'clamp(16px, 2.2vw, 34px)', alignItems: 'center' }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => smoothScrollTo(e, `#${item.id}`)}
                style={{
                  position: 'relative',
                  fontFamily: mono,
                  fontSize: 13,
                  color: linkColor(item.id),
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  paddingBottom: 4,
                  transition: '0.25s ease',
                }}
              >
                {item.label}

                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 1,
                    background: 'white',
                    transform: activeSection === item.id ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {isMobile && open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: 10,
            borderRadius: 16,
            background: 'rgba(13,13,13,0.9)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => smoothScrollTo(e, `#${item.id}`)}
              style={{
                fontFamily: mono,
                fontSize: 13,
                color: linkColor(item.id),
              }}
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  )
}
