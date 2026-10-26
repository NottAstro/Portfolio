'use client'

import { motion } from 'framer-motion'

const shimmer =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent'

function Bone({ className }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-white/[0.06] ${shimmer} ${className || ''}`} />
  )
}

/* ─── Shared pieces ─── */
function StackSkeleton({ className }: { className: string }) {
  return (
    <div className={`relative aspect-[4/3] ${className}`}>
      {[3, 2, 1, 0].map((depth) => (
        <div
          key={depth}
          className="absolute top-0 left-0 w-[calc(100%-80px)]"
          style={{
            transform: `translate(${depth * 30}px, ${depth * 40}px)`,
            zIndex: 4 - depth,
          }}
        >
          <div className={`w-full aspect-[4/3] rounded-[22px] border border-white/10 bg-white/[0.04] ${shimmer}`} />
        </div>
      ))}
    </div>
  )
}

function DetailsSkeleton({ tagCount, tagClassName }: { tagCount: number; tagClassName: string }) {
  return (
    <>
      <Bone className="h-8 w-[65%]" />
      <Bone className="h-[2px] w-10" />
      <div className="flex flex-col gap-2">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-[90%]" />
        <Bone className="h-3 w-[75%]" />
      </div>
      <div className="flex flex-col gap-2 mt-1">
        <Bone className="h-3 w-20" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: tagCount }).map((_, i) => (
            <Bone key={i} className={tagClassName} />
          ))}
        </div>
      </div>
    </>
  )
}

/* ─── Projects Skeleton ─── */
export function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-4 lg:gap-8 items-center">
      {/* Left */}
      <div className="flex flex-col gap-4 order-2 lg:order-1">
        <DetailsSkeleton tagCount={5} tagClassName="h-6 w-16 rounded-md" />
        <div className="flex gap-2.5 mt-2">
          <Bone className="h-9 w-24 rounded-xl" />
          <Bone className="h-9 w-28 rounded-xl" />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-4 w-12" />
          <Bone className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Right — stacked card skeleton */}
      <StackSkeleton className="order-1 lg:order-2" />
    </div>
  )
}

/* ─── Tech Stack Skeleton ─── */
export function TechStackSkeleton() {
  return (
    <div className="flex justify-center items-center gap-6 h-[250px]">
      {Array.from({ length: 5 }).map((_, i) => {
        const isCenter = i === 2
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="shrink-0"
            style={{
              transform: `scale(${isCenter ? 1 : 0.85 - Math.abs(i - 2) * 0.05})`,
              opacity: isCenter ? 1 : 0.4 + (1 - Math.abs(i - 2) * 0.15),
            }}
          >
            <div className="flex flex-col items-center justify-center gap-4 w-[200px] h-[180px]">
              <Bone className="w-[80px] h-[80px] rounded-2xl" />
              <Bone className="h-4 w-[60%] rounded-md" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
