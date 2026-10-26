'use client'

import { useEffect, useState } from 'react'
import { fetchProjects, fetchTechStacks } from '@/lib/portfolioService'

type PortfolioData = {
  projects: any[]
  techStacks: any[]
}

const CACHE_KEYS: Record<keyof PortfolioData, string> = {
  projects: 'portfolioProjects',
  techStacks: 'portfolioTechStacks',
}

export const readCached = (key: keyof PortfolioData): any[] | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEYS[key])
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// Shared by every component that mounts at the same time (About + Showcase),
// so the page makes one round of requests instead of one per component.
let inFlight: Promise<PortfolioData> | null = null

const loadPortfolio = () => {
  inFlight ??= Promise.all([fetchProjects(), fetchTechStacks()])
    .then(([projects, techStacks]) => {
      const data = { projects, techStacks }
      for (const key of Object.keys(CACHE_KEYS) as (keyof PortfolioData)[]) {
        sessionStorage.setItem(CACHE_KEYS[key], JSON.stringify(data[key]))
      }
      return data
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

export default function usePortfolio() {
  const [data, setData] = useState<PortfolioData>({
    projects: [],
    techStacks: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const cached = {
      projects: readCached('projects'),
      techStacks: readCached('techStacks'),
    }

    // Render cached data immediately while fresh data loads in background
    if (cached.projects || cached.techStacks) {
      setData({
        projects: cached.projects || [],
        techStacks: cached.techStacks || [],
      })
      setLoading(false)
    }

    loadPortfolio()
      .then((fresh) => active && setData(fresh))
      .catch((error) => console.error('Failed to load portfolio data:', error))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  return { ...data, loading }
}
