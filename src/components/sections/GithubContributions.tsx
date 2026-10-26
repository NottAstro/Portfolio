'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  Calendar,
  ArrowUpRight,
  Sparkles,
  GitCommit,
  Trophy,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import useFloatingHeader, { FloatConfig, useFloatIn } from '@/hooks/useFloatingHeader'
import { EASE } from '@/lib/motion'

type ContributionDay = {
  date: string
  count: number
  level: number
}

type ApiResponse = {
  total: Record<string, number>
  contributions: ContributionDay[]
}

type GithubContributionsProps = {
  username?: string
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number)
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(dateStr)
}

const formatDate = (dateStr: string) => {
  try {
    return parseDate(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Level color styling matching sleek dark neon emerald theme
const LEVEL_CLASSES = [
  'bg-white/[0.05] border border-white/[0.06] hover:border-white/30', // Level 0
  'bg-[#0e4429] border border-[#1b6a42]/50 hover:border-emerald-400 hover:shadow-[0_0_8px_rgba(14,68,41,0.8)]', // Level 1
  'bg-[#006d32] border border-[#169b4c]/60 hover:border-emerald-300 hover:shadow-[0_0_10px_rgba(0,109,50,0.9)]', // Level 2
  'bg-[#26a641] border border-[#4be073]/60 hover:border-emerald-200 hover:shadow-[0_0_12px_rgba(38,166,65,1)]', // Level 3
  'bg-[#39d353] border border-[#6eff8b]/80 shadow-[0_0_10px_rgba(57,211,83,0.45)] hover:shadow-[0_0_16px_rgba(57,211,83,1)]', // Level 4
]

/* ================== ANIMATION ================== */

const BADGE: FloatConfig = { hidden: { opacity: 0, y: 20, scale: 0.9 }, duration: 0.6 }
const TITLE: FloatConfig = { hidden: { opacity: 0, y: 40 }, bob: -8, bobDuration: 4 }
const SUBTITLE: FloatConfig = { hidden: { opacity: 0, y: 30 }, delay: 0.1, bob: -4, bobDuration: 4.4 }

const statsContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 25 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASE,
    },
  },
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 35, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: EASE,
    },
  },
}

const EMPTY_STATS = {
  total: 0,
  currentStreak: 0,
  longestStreak: 0,
  activeDays: 0,
  maxDay: { count: 0, date: '' },
}

export default function GithubContributions({
  username = 'NottAstro',
}: GithubContributionsProps) {
  const [selectedYear, setSelectedYear] = useState<string>('last')
  const [availableYears, setAvailableYears] = useState<string[]>(['last', '2026', '2025'])
  const [data, setData] = useState<ContributionDay[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay
    x: number
    y: number
  } | null>(null)

  // Header floating animations
  const headerRef = useRef<HTMLDivElement>(null)
  const header = useFloatingHeader(headerRef, TITLE, SUBTITLE)
  const badge = useFloatIn(header.inView, BADGE)

  // Fetch contributions data (sessionStorage copy first, then live)
  useEffect(() => {
    let isMounted = true
    const cacheKey = `gh_contribs_${username}_${selectedYear}`

    const apply = (json: ApiResponse) => {
      const contributions = json.contributions || []
      setData(contributions)
      setTotalCount(
        json.total?.[selectedYear === 'last' ? 'lastYear' : selectedYear] ??
          contributions.reduce((acc, c) => acc + c.count, 0)
      )
    }

    async function loadData() {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached && isMounted) {
          apply(JSON.parse(cached))
          setLoading(false)
        }
      } catch {
        // ignore cache read error
      }

      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=${selectedYear}`
        )
        if (!res.ok) throw new Error('Failed to fetch contributions')
        const json: ApiResponse = await res.json()

        if (!isMounted) return

        apply(json)

        if (json.total) {
          const years = Object.keys(json.total).filter((y) => y !== 'lastYear')
          if (years.length > 0) {
            setAvailableYears(['last', ...years.sort().reverse()])
          }
        }

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(json))
        } catch {
          // ignore cache write error
        }
      } catch (err) {
        console.error('Error fetching github contributions:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [username, selectedYear])

  // Group into 7-day columns (weeks)
  const { weeks, monthLabels, stats } = useMemo(() => {
    if (!data || data.length === 0) {
      return { weeks: [], monthLabels: [], stats: EMPTY_STATS }
    }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let activeDays = 0
    let maxDay = { count: 0, date: '' }
    let totalContribs = 0

    for (const d of data) {
      totalContribs += d.count
      if (d.count > 0) {
        activeDays++
        tempStreak++
        if (tempStreak > longestStreak) longestStreak = tempStreak
        if (d.count > maxDay.count) {
          maxDay = { count: d.count, date: d.date }
        }
      } else {
        tempStreak = 0
      }
    }

    // Current streak (backward from last day)
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].count > 0) {
        currentStreak++
      } else if (i === data.length - 1) {
        continue
      } else {
        break
      }
    }

    // Generate weeks array, padding the first week so columns start on Sunday
    const groupedWeeks: Array<Array<ContributionDay | null>> = []
    let currentWeek: Array<ContributionDay | null> = Array(
      parseDate(data[0].date).getDay()
    ).fill(null)

    data.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        groupedWeeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      groupedWeeks.push(currentWeek)
    }

    // Calculate month label positions
    const labels: Array<{ name: string; colIndex: number }> = []
    let lastMonth = -1

    groupedWeeks.forEach((wk, colIdx) => {
      const validDay = wk.find((d) => d !== null)
      if (validDay) {
        const m = parseDate(validDay.date).getMonth()
        if (m !== lastMonth) {
          if (labels.length === 0 || colIdx - labels[labels.length - 1].colIndex >= 3) {
            labels.push({ name: MONTH_NAMES[m], colIndex: colIdx })
            lastMonth = m
          }
        }
      }
    })

    return {
      weeks: groupedWeeks,
      monthLabels: labels,
      stats: {
        total: totalCount || totalContribs,
        currentStreak,
        longestStreak,
        activeDays,
        maxDay,
      },
    }
  }, [data, totalCount])

  // Memoized so hovering a cell (tooltip state) doesn't re-render ~370 cells
  const weekColumns = useMemo(
    () =>
      weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-[3.5px] flex-1">
          {week.map((day, dayIdx) =>
            day ? (
              <div
                key={day.date || dayIdx}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setHoveredDay({
                    day,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  })
                }}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-full aspect-square rounded-[3px] transition-all duration-150 cursor-pointer hover:scale-[1.35] hover:z-30 ${
                  LEVEL_CLASSES[Math.min(day.level, 4)] || LEVEL_CLASSES[0]
                }`}
              />
            ) : (
              <div
                key={dayIdx}
                className="w-full aspect-square rounded-[3px] opacity-0"
              />
            )
          )}
        </div>
      )),
    [weeks]
  )

  const periodLabel = selectedYear === 'last' ? 'the last year' : selectedYear

  const metrics = [
    {
      label: 'Total Contributions',
      icon: <GitCommit size={15} className="text-white/60" />,
      value: stats.total,
      note: `in ${periodLabel}`,
    },
    {
      label: 'Active Days',
      icon: <Calendar size={15} className="text-white/60" />,
      value: stats.activeDays,
      note: 'days with commits',
    },
    {
      label: 'Longest Streak',
      icon: <Trophy size={15} className="text-amber-400/80" />,
      value: `${stats.longestStreak} days`,
      note: 'consecutive activity',
    },
    {
      label: 'Max in a Day',
      icon: <Sparkles size={15} className="text-emerald-400/80" />,
      value: stats.maxDay.count,
      note: stats.maxDay.date ? formatDate(stats.maxDay.date) : 'single day peak',
      valueClassName: 'text-emerald-400',
    },
  ]

  return (
    <div id="contributions" className="w-full mt-24 sm:mt-28 scroll-mt-28">
      {/* SECTION SUBHEADER WITH DEFAULT FLOATING BOB ANIMATIONS */}
      <div
        ref={headerRef}
        className="flex flex-col items-center text-center mb-10"
      >
        <motion.div
          {...badge}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[12px] font-medium text-white/80 backdrop-blur-md mb-3.5 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono tracking-wider uppercase text-[11px] text-white/70">
            Open Source Activity
          </span>
        </motion.div>

        <motion.h3
          {...header.title}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3"
        >
          GitHub Contributions
        </motion.h3>

        <motion.p
          {...header.subtitle}
          className="text-white/60 text-sm sm:text-base max-w-lg leading-relaxed"
        >
          Live commit history and code activity from{' '}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-emerald-400 underline underline-offset-4 transition-colors font-medium"
          >
            @{username}
          </a>
          .
        </motion.p>
      </div>

      {/* MAIN CONTAINER CARD WITH FADE-UP ENTRANCE */}
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: '-70px' }}
        className="relative rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 md:p-9 shadow-2xl overflow-hidden"
      >
        {/* Soft Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BAR: Profile + Year Switcher + Profile Link */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
              className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shadow-inner"
            >
              <FaGithub size={22} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] sm:text-[18px] font-bold text-white tracking-tight">
                  @{username}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-[11px] font-medium tracking-wide">
                  Live
                </span>
              </div>
              <p className="text-[12px] text-white/50 font-mono">
                github.com/{username}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Filters */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
              {availableYears.map((year) => (
                <motion.button
                  key={year}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedYear === year
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {year === 'last' ? 'Last 12 Months' : year}
                </motion.button>
              ))}
            </div>

            {/* Direct GitHub Profile Link */}
            <motion.a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/10 hover:bg-white/15 hover:border-white/25 text-white text-xs font-medium transition-all duration-300 shadow-sm"
            >
              <span>Profile</span>
              <ArrowUpRight size={14} />
            </motion.a>
          </div>
        </div>

        {/* METRICS ROW (STAGGERED POP ANIMATIONS) */}
        <motion.div
          variants={statsContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: '-50px' }}
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6"
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={popVariants}
              whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between transition-colors hover:border-white/25"
            >
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] sm:text-[12px] font-medium uppercase tracking-wider">
                  {metric.label}
                </span>
                {metric.icon}
              </div>
              <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${metric.valueClassName || 'text-white'}`}>
                {loading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  metric.value
                )}
              </div>
              <span className="text-[11px] text-white/40 mt-1">
                {metric.note}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CALENDAR GRAPH */}
        <div className="relative z-10 mt-2 pt-4 border-t border-white/10">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <p className="text-xs text-white/50 font-mono">
                Fetching GitHub activity for @{username}...
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              // -mr-4/pr-4: extend the clip box into the card's padding so hovered
              // last-column cells (scaled 1.35x, with glow) aren't cut off
              className="relative overflow-x-auto pb-4 pt-2 -mr-4 pr-4 custom-scroll"
            >
              <div className="min-w-[760px] flex flex-col select-none">
                {/* Month labels header row */}
                <div className="flex text-[11px] text-white/45 font-mono mb-2 h-4 relative">
                  <div className="w-8 flex-shrink-0" /> {/* Spacer for day labels */}
                  <div className="flex-1 relative">
                    {monthLabels.map((lbl, i) => (
                      <span
                        key={i}
                        className="absolute"
                        style={{
                          left: `${(lbl.colIndex / weeks.length) * 100}%`,
                        }}
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Graph Grid: Left Day Labels + 53 Week Columns */}
                <div className="flex items-start gap-2">
                  {/* Left Day Labels */}
                  <div className="flex flex-col justify-between h-[98px] py-[2px] text-[10px] text-white/40 font-mono w-7 text-right select-none flex-shrink-0">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* 53 Columns */}
                  <div className="flex-1 flex gap-[3.5px]">{weekColumns}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* BOTTOM FOOTER / LEGEND */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-white/[0.08] text-xs text-white/50">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">
                {stats.total} contributions in{' '}
                {selectedYear === 'last' ? 'the last 12 months' : selectedYear}
              </span>
            </div>

            {/* Less -> More Legend */}
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>Less</span>
              <div className="flex items-center gap-1">
                {LEVEL_CLASSES.map((cls, i) => (
                  <div
                    key={i}
                    className={`w-[11px] h-[11px] rounded-[2.5px] ${cls}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FLOATING HOVER TOOLTIP */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            // x: '-50%' centers the tooltip over the cell (a plain CSS
            // transform would be overwritten by the animated y/scale)
            initial={{ opacity: 0, x: '-50%', y: 6, scale: 0.92 }}
            animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
            exit={{ opacity: 0, x: '-50%', scale: 0.92 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: hoveredDay.y - 48,
              left: hoveredDay.x,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="px-3 py-1.5 rounded-lg bg-[#18181b] border border-white/20 text-white shadow-2xl text-[11px] font-medium whitespace-nowrap backdrop-blur-md"
          >
            <span className="font-bold text-emerald-400">
              {hoveredDay.day.count} {hoveredDay.day.count === 1 ? 'contribution' : 'contributions'}
            </span>{' '}
            <span className="text-white/60">on</span>{' '}
            <span className="text-white/90">{formatDate(hoveredDay.day.date)}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#18181b] border-r border-b border-white/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
