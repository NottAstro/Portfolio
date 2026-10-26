'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  CalendarDays,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Award,
  FolderGit2,
  CheckCircle2,
} from 'lucide-react'
import useFloatingHeader from '@/hooks/useFloatingHeader'
import usePortfolio from '@/hooks/usePortfolio'
import { EASE } from '@/lib/motion'

type EducationEntry = {
  degree: string
  institution: string
  period: string
  status?: string
  grade?: string
  // Optional extras: each list only shows when it has items
  coursework?: string[]
  highlights?: string[]
}

// Newest first. CGPA and grades as of the Semester IV results (June 2026).
const EDUCATION: EducationEntry[] = [
  {
    degree: 'B.Tech in Computer Science',
    institution: "SVKM's NMIMS Mukesh Patel School of Technology Management & Engineering (MPSTME)",
    period: '2024 – 2028',
    status: 'Currently in Semester 5',
    grade: 'CGPA 8.24 / 10',
    coursework: [
      'Data Structures & Algorithms',
      'Design & Analysis of Algorithms',
      'Database Management Systems',
      'Computer Networks',
      'Object-Oriented Programming (Java)',
      'Web Programming',
      'Theoretical Computer Science',
      'Discrete Mathematics',
      'Computer Architecture',
      'Internet of Things',
      'Probability & Statistics',
      'Python Programming',
    ],
    highlights: [
      'Outstanding (O) grades in Programming for Problem Solving, Python Programming and OOP through Java',
      'A+ grades in Web Programming, Theoretical Computer Science, and Probability & Statistics',
    ],
  },
]

const FOCUS_AREAS = [
  'Full-Stack Web Development',
  'Distributed Systems',
  'Computer Vision',
  'Algorithms & Data Structures',
]

const CHIP_CLASS =
  'px-3.5 py-1.5 short:px-3 short:py-1 rounded-lg bg-white/[0.07] border border-white/10 text-[13px] sm:text-[14px] lg:text-[15px] short:text-[13px] font-medium text-white/80 hover:border-white/20 transition-colors'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: '-60px' },
  transition: { duration: 0.8, delay, ease: EASE },
})

function GroupLabel({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-white/60" />
      <span className="text-[12px] sm:text-[13px] text-white/50 font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

// Short sentences, shown as a ticked list
function ListGroup({ icon, label, items }: { icon: typeof BookOpen; label: string; items: string[] }) {
  if (!items.length) return null

  return (
    <div className="flex flex-col gap-3 short:gap-2">
      <GroupLabel icon={icon} label={label} />
      <ul className="flex flex-col gap-2 short:gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[14px] sm:text-[15px] short:text-[14px] leading-relaxed text-white/80">
            <CheckCircle2 size={17} className="shrink-0 mt-[3px] text-emerald-400/80" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChipGroup({ icon: Icon, label, items }: { icon: typeof BookOpen; label: string; items: string[] }) {
  if (!items.length) return null

  return (
    <div className="flex flex-col gap-3 short:gap-2">
      <GroupLabel icon={Icon} label={label} />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={CHIP_CLASS}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Education() {
  const headerRef = useRef<HTMLDivElement>(null)
  const header = useFloatingHeader(headerRef)
  const { projects } = usePortfolio()

  return (
    <section
      id="education"
      className="w-full max-w-[1450px] mx-auto px-8 md:px-12 lg:px-20 pt-28 lg:pt-[88px] short:pt-[76px] pb-16 lg:pb-8 short:pb-3 text-white min-h-screen lg:flex lg:flex-col lg:justify-center"
    >
      {/* HEADER */}
      <div ref={headerRef} className="mb-14 lg:mb-6 short:mb-4 flex flex-col items-center text-center">
        <motion.h2
          {...header.title}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl short:text-5xl font-bold tracking-tight mb-4 lg:mb-3 short:mb-1.5"
        >
          Education
        </motion.h2>
        <motion.p
          {...header.subtitle}
          className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl"
        >
          My academic foundation in computer science.
        </motion.p>
      </div>

      {/* TIMELINE */}
      <div className="relative flex flex-col gap-8">
        {EDUCATION.length > 1 && (
          <div className="absolute left-[27px] top-7 bottom-7 w-px bg-white/10 hidden sm:block" />
        )}

        {EDUCATION.map((entry, i) => (
          <motion.div key={entry.degree} {...fadeUp(i * 0.1)} className="relative flex gap-5 sm:gap-6">
            {/* Timeline node */}
            <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl border border-white/15 bg-[#141414] items-center justify-center z-10">
              <GraduationCap size={24} className="text-white/80" />
            </div>

            {/* Card */}
            <div className="flex-1 min-w-0 rounded-[22px] md:rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 lg:px-12 lg:py-9 short:px-9 short:py-6 flex flex-col gap-6 short:gap-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-3xl sm:text-4xl lg:text-[42px] short:text-[34px] font-bold leading-[1.2] tracking-tight">
                    {entry.degree}
                  </h3>
                  <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-white/60 to-white/10 my-4 short:my-2.5" />
                  <p className="text-[15px] sm:text-[16px] lg:text-[17px] short:text-[15px] leading-[1.8] short:leading-[1.6] text-white/70">
                    {entry.institution}
                  </p>

                  {i === 0 && (
                    <div className="mt-5 short:mt-3">
                      <ChipGroup icon={Sparkles} label="Focus Areas" items={FOCUS_AREAS} />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-col md:items-end gap-2 shrink-0">
                  <span className="inline-flex items-center gap-2 px-4 py-2 short:py-1.5 rounded-full border border-white/10 bg-white/[0.05] text-[13px] sm:text-[14px] text-white/80">
                    <CalendarDays size={15} />
                    {entry.period}
                  </span>
                  {entry.status && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 short:py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[13px] sm:text-[14px] text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {entry.status}
                    </span>
                  )}
                  {entry.grade && (
                    <span className="px-4 py-2 short:py-1.5 rounded-full border border-white/20 bg-white/[0.08] text-[13px] sm:text-[14px] font-semibold text-white">
                      {entry.grade}
                    </span>
                  )}
                </div>
              </div>

              {/* Details: two columns on desktop so the section fits one screen */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-x-12 short:gap-y-4 pt-6 short:pt-4 border-t border-white/10">
                <ChipGroup icon={BookOpen} label="Relevant Coursework" items={entry.coursework || []} />

                <div className="flex flex-col gap-6 short:gap-4">
                  <ListGroup icon={Award} label="Academic Highlights" items={entry.highlights || []} />

                  {/* Current degree: projects built alongside it */}
                  {i === 0 && projects.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <GroupLabel icon={FolderGit2} label="Projects built alongside my studies" />
                      <div className="flex flex-wrap gap-2">
                        {projects.map((project) => (
                          <Link
                            key={project.id}
                            href={`/portfolio/${project.id}`}
                            className={`${CHIP_CLASS} inline-flex items-center gap-1.5 hover:text-white`}
                          >
                            {project.title}
                            <ArrowUpRight size={15} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
