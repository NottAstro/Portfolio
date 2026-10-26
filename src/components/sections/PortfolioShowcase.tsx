'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Code2, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import usePortfolio from '@/hooks/usePortfolio'
import useFloatingHeader from '@/hooks/useFloatingHeader'
import { EASE } from '@/lib/motion'
import { splitList } from '@/lib/list'
import CascadingSlider from './CascadingSlider'
import StackedProjectCards from './StackedProjectCards'
import { ProjectsSkeleton, TechStackSkeleton } from './Skeletons'
import GithubContributions from './GithubContributions'

const SECTION_CLASS =
  'w-full max-w-[1450px] mx-auto px-8 md:px-12 lg:px-20 pt-28 pb-16 text-white min-h-screen'

const TAG_CLASS =
  'px-3.5 py-1.5 rounded-lg bg-white/[0.07] border border-white/10 text-[12px] sm:text-[13px] font-medium text-white/80 hover:border-white/20 transition-colors'

const OUTLINE_BUTTON_CLASS =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-[13px] sm:text-[14px] font-medium text-white shadow-sm'

const SOLID_BUTTON_CLASS =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-[13px] sm:text-[14px] hover:bg-white/90 hover:shadow-lg transition-all duration-300'

const PAGER_BUTTON_CLASS =
  'w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/20 active:scale-95 transition-all duration-200 flex items-center justify-center text-white/80 hover:text-white'

// Props for a column that slides in from the left (-1) or right (1)
const slideIn = (from: -1 | 1, delay = 0) => ({
  initial: { opacity: 0, x: 80 * from },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, margin: '-80px' },
  transition: { duration: 0.8, delay, ease: EASE },
})

const pad = (n: number) => String(n).padStart(2, '0')

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const header = useFloatingHeader(ref)

  return (
    <div ref={ref} className="mb-14 flex flex-col items-center text-center">
      <motion.h2
        {...header.title}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
      >
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

// Title / divider / description / tag list for the active project
function ItemDetails({
  itemKey,
  title,
  description,
  metaIcon: MetaIcon,
  metaLabel,
  children,
}: {
  itemKey: string | number
  title?: string
  description?: string
  metaIcon: LucideIcon
  metaLabel: string
  children?: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={itemKey}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <div className="min-h-[48px] sm:min-h-[54px] flex items-center">
          <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.2] tracking-tight text-white">
            {title}
          </h3>
        </div>

        <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-white/60 to-white/10" />

        <div className="min-h-[90px] sm:min-h-[100px] flex items-start">
          <p className="text-[15px] sm:text-[16px] lg:text-[17px] leading-[1.8] text-white/70 font-normal line-clamp-4">
            {description}
          </p>
        </div>

        <div className="min-h-[70px] sm:min-h-[76px] flex flex-col justify-start">
          {children && (
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center gap-2">
                <MetaIcon size={15} className="text-white/60" />
                <span className="text-[11px] sm:text-[12px] text-white/50 font-semibold uppercase tracking-wider">
                  {metaLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">{children}</div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function Pager({
  index,
  total,
  onChange,
  label,
  className = '',
}: {
  index: number
  total: number
  onChange: (index: number) => void
  label: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full p-1.5 backdrop-blur-md ${className}`}>
      <button
        onClick={() => onChange((index - 1 + total) % total)}
        aria-label={`Previous ${label}`}
        className={PAGER_BUTTON_CLASS}
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-[13px] sm:text-[14px] font-semibold text-white/80 tabular-nums px-2 tracking-wider">
        {pad(index + 1)}{' '}
        <span className="text-white/35 font-normal">/</span>{' '}
        {pad(total)}
      </span>

      <button
        onClick={() => onChange((index + 1) % total)}
        aria-label={`Next ${label}`}
        className={PAGER_BUTTON_CLASS}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

function ExternalButton({ href, label, className = OUTLINE_BUTTON_CLASS }: { href: string; label: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
      <ArrowUpRight size={15} />
    </a>
  )
}

export default function PortfolioShowcase() {
  const router = useRouter()
  const {
    projects,
    techStacks,
    loading,
  } = usePortfolio()

  const [activeProjectIndex, setActiveProjectIndex] = useState(0)

  const activeProject = projects[activeProjectIndex] || null
  const techList = activeProject ? splitList(activeProject.technologies) : []

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* PROJECTS SECTION                           */}
      {/* ═══════════════════════════════════════════ */}
      <section id="projects" className={SECTION_CLASS}>
        <SectionHeader
          title="Projects"
          subtitle="A collection of my recent software engineering work."
        />

        {/* Projects Content */}
        {loading && <ProjectsSkeleton />}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 xl:gap-20 items-center">
            {/* LEFT — Description (slides in from left) */}
            <motion.div
              {...slideIn(-1)}
              className="order-2 lg:order-1 flex flex-col justify-between min-h-[440px] sm:min-h-[470px] lg:min-h-[490px]"
            >
              {/* DYNAMIC CONTENT AREA */}
              <div className="flex-1 flex flex-col justify-start">
                <ItemDetails
                  itemKey={activeProject?.id || activeProjectIndex}
                  title={activeProject?.title}
                  description={activeProject?.description}
                  metaIcon={Code2}
                  metaLabel="Technologies"
                >
                  {techList.length > 0 && (
                    <>
                      {techList.slice(0, 8).map((t, i) => (
                        <span key={i} className={TAG_CLASS}>
                          {t}
                        </span>
                      ))}
                      {techList.length > 8 && (
                        <span className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] text-[12px] sm:text-[13px] font-medium text-white/40">
                          +{techList.length - 8} more
                        </span>
                      )}
                    </>
                  )}
                </ItemDetails>
              </div>

              {/* FIXED ACTION BUTTONS & NAVIGATION ARROWS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-6 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  {activeProject?.live_url && (
                    <ExternalButton href={activeProject.live_url} label="Live Demo" />
                  )}

                  {activeProject?.github_url && (
                    <ExternalButton href={activeProject.github_url} label="GitHub" />
                  )}

                  {activeProject?.id && (
                    <button
                      onClick={() =>
                        router.push(`/portfolio/${activeProject.id}`)
                      }
                      className={SOLID_BUTTON_CLASS}
                    >
                      View Details
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>

                {/* PROJECT SWITCHER ARROWS */}
                <Pager
                  index={activeProjectIndex}
                  total={projects.length}
                  onChange={setActiveProjectIndex}
                  label="project"
                />
              </div>
            </motion.div>

            {/* RIGHT — Stacked Cards (slides in from right) */}
            <motion.div
              {...slideIn(1, 0.1)}
              className="order-1 lg:order-2 flex justify-center lg:justify-end w-full lg:pl-6 xl:pl-10"
            >
              <div className="w-full max-w-[580px] lg:max-w-[620px] ml-auto">
                <StackedProjectCards
                  items={projects}
                  activeIndex={activeProjectIndex}
                  onSelect={setActiveProjectIndex}
                />
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* TECH STACK SECTION                         */}
      {/* ═══════════════════════════════════════════ */}
      <section id="techstack" className={SECTION_CLASS}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-14 flex flex-col items-center text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Tech Stack
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            The modern technologies and tools I work with every day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          {loading && <TechStackSkeleton />}
          {!loading && techStacks.length > 0 && (
            <CascadingSlider
              items={techStacks}
              renderItem={(item) => (
                <div className="group relative p-6 flex flex-col items-center justify-center gap-6 h-[180px] w-full max-w-[280px] mx-auto">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-[120px] h-[120px] rounded-full bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500" />

                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={item.name}
                        className="relative z-10 w-[96px] h-[96px] object-contain"
                      />
                    ) : (
                      <div className="relative z-10 w-[96px] h-[96px] rounded-2xl bg-white/10" />
                    )}
                  </div>
                  <p className="text-[18px] font-semibold text-white/90 text-center leading-tight">
                    {item.name}
                  </p>
                </div>
              )}
            />
          )}
        </motion.div>

        {/* GITHUB CONTRIBUTIONS GRAPH */}
        <GithubContributions username="NottAstro" />
      </section>
    </>
  )
}
