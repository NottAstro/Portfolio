'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { readCached } from '@/hooks/usePortfolio'
import { EASE } from '@/lib/motion'
import { splitList } from '@/lib/list'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Sparkles,
  Code2,
  Layers,
  X,
  Box,
  LucideIcon,
} from 'lucide-react'

const EMPTY_PROJECT = {
  title: '',
  description: '',
  technologies: '',
  key_features: '',
  image_url: '',
  image_urls: [],
  live_url: '',
  github_url: '',
}

// Slide/fade in from `x`, easing with the site curve
const slide = (x: number, duration: number, delay = 0) => ({
  initial: { opacity: 0, x },
  animate: { opacity: 1, x: 0 },
  transition: { duration, delay, ease: EASE },
})

function ProjectLink({ href, icon: Icon, label }: { href?: string; icon: LucideIcon; label: string }) {
  return href ? (
    <a
      href={href}
      target="_blank"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#111] to-[#181818] border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-sm"
    >
      <Icon size={14} />
      {label}
    </a>
  ) : (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#101010] border border-white/10 text-white/40 text-sm">
      <Icon size={14} />
      {label} Unavailable
    </div>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-gradient-to-br from-[#111] to-[#171717] border border-white/10 rounded-2xl p-3 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-base font-semibold">{value}</p>
        <p className="text-[10px] text-white/40">{label}</p>
      </div>
    </motion.div>
  )
}

export default function PortfolioDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [project, setProject] = useState<any>(EMPTY_PROJECT)
  const [currentImage, setCurrentImage] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    // Show the copy cached by the homepage instantly, then refresh from the DB
    const cached = readCached('projects')?.find((p) => String(p.id) === String(id))
    if (cached) setProject(cached)

    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setProject(data)
      })
  }, [id])

  const tech = splitList(project?.technologies)
  const features = splitList(project?.key_features)

  const galleryImages: string[] = Array.isArray(project?.image_urls)
    ? project.image_urls
    : project?.image_url
      ? [project.image_url]
      : []

  const hasPrev = currentImage > 0
  const hasNext = currentImage < galleryImages.length - 1

  const nextImage = () => {
    if (hasNext) setCurrentImage((prev) => prev + 1)
  }

  const prevImage = () => {
    if (hasPrev) setCurrentImage((prev) => prev - 1)
  }

  return (
    <>
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
            >
              <X size={18} />
            </button>

            {hasPrev && (
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <motion.img
              key={currentImage}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.6, ease: EASE }}
              src={galleryImages[currentImage]}
              className="max-w-[85vw] max-h-[80vh] rounded-3xl object-contain"
            />

            {hasNext && (
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen text-white px-6 md:px-10 lg:px-16 py-8 relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#1a1a1a_0%,#0a0a0a_35%,#050505_100%)]" />
        <div className="absolute top-[-200px] left-[-120px] w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-[140px] -z-10" />
        <div className="absolute bottom-[-250px] right-[-150px] w-[550px] h-[550px] rounded-full bg-white/[0.04] blur-[160px] -z-10" />

        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-10 items-start">
          {/* LEFT */}
          <motion.div {...slide(-80, 0.95)} className="max-w-[520px]">
            {/* BACK + TITLE */}
            <motion.div {...slide(-70, 1)} className="mb-8">
              <button
                onClick={() => router.push('/#projects')}
                className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition-all duration-300 mb-6"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <motion.h1
                {...slide(-40, 0.9, 0.08)}
                className="text-[28px] md:text-[38px] font-bold leading-tight tracking-tight mb-3"
              >
                {project.title}
              </motion.h1>

              <motion.div
                initial={{ width: 0, x: -20 }}
                animate={{ width: 65, x: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                className="h-[2px] rounded-full bg-gradient-to-r from-white/40 to-white/5 mb-5"
              />
            </motion.div>

            <motion.p
              {...slide(40, 0.8, 0.15)}
              className="text-[12px] leading-6 text-white/60 text-justify whitespace-pre-line mb-7"
            >
              {project.description}
            </motion.p>

            {/* STATS */}
            <motion.div
              {...slide(-60, 0.85, 0.2)}
              className="grid grid-cols-2 gap-3 mb-7 max-w-[420px]"
            >
              <StatCard icon={Code2} value={tech.length} label="Technologies Used" />
              <StatCard icon={Layers} value={features.length} label="Key Features" />
            </motion.div>

            {/* BUTTONS */}
            <motion.div
              {...slide(55, 0.8, 0.28)}
              className="flex flex-wrap gap-3 mb-7"
            >
              <ProjectLink href={project.live_url} icon={ExternalLink} label="Live Demo" />
              <ProjectLink href={project.github_url} icon={GitBranch} label="GitHub" />
            </motion.div>

            {/* TECH */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Code2 size={14} className="text-white/70" />
                <p className="text-[13px] font-semibold">
                  Technologies Used
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tech.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.12 + i * 0.04,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-[#101010] to-[#181818] border border-white/10 text-[11px] text-white/75"
                  >
                    <Box size={11} className="text-white/40" />
                    {t.trim()}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* FEATURES */}
            <motion.div
              {...slide(-55, 0.9, 0.22)}
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-[#101010] to-[#171717] border border-white/10 rounded-3xl p-5 mt-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-white/70" />
                <p className="text-sm font-semibold">Key Features</p>
              </div>

              <ul className="space-y-2.5 text-[12px] text-white/65 leading-6">
                {features.map((f, i) => (
                  <motion.li
                    key={i}
                    {...slide(i % 2 === 0 ? 30 : -30, 0.55, i * 0.05)}
                    className="flex gap-3"
                  >
                    <span className="text-white/35">•</span>
                    <span>{f.trim()}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* RIGHT */}
          <motion.div {...slide(80, 1)} className="w-full pt-10 md:pt-14">
            {/* IMAGE */}
            {galleryImages.length > 0 && (
              <motion.div {...slide(55, 0.85, 0.12)} className="mb-5">
                <div className="relative rounded-[26px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#111] to-[#171717] max-w-[560px] mx-auto">
                  <motion.img
                    key={currentImage}
                    {...slide(60, 0.6)}
                    src={galleryImages[currentImage]}
                    onClick={() => setPreviewOpen(true)}
                    className="w-full h-auto block cursor-pointer"
                  />

                  {hasPrev && (
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-all duration-300"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}

                  {hasNext && (
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-all duration-300"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="flex justify-center gap-2 mt-3">
                    {galleryImages.map((_, i) => (
                      <motion.button
                        key={i}
                        initial={{
                          opacity: 0,
                          x: i % 2 === 0 ? -10 : 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: i * 0.04,
                          duration: 0.45,
                        }}
                        onClick={() => setCurrentImage(i)}
                        className={`rounded-full transition-all duration-300 ${
                          currentImage === i
                            ? 'w-6 h-1.5 bg-white'
                            : 'w-1.5 h-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
