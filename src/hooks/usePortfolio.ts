'use client'

import { useEffect, useState } from 'react'
import {
  fetchCertificates,
  fetchProjects,
  fetchTechStacks,
} from '@/lib/portfolioService'

type PortfolioData = {
  projects: any[]
  certificates: any[]
  techStacks: any[]
}

const CACHE_KEYS: Record<keyof PortfolioData, string> = {
  projects: 'portfolioProjects',
  certificates: 'portfolioCertificates',
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
  inFlight ??= Promise.all([
    fetchProjects(),
    fetchCertificates(),
    fetchTechStacks(),
  ])
    .then(([projects, certificates, techStacks]) => {
      const data = { projects, certificates, techStacks }
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
    certificates: [],
    techStacks: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const cached = {
      projects: readCached('projects'),
      certificates: readCached('certificates'),
      techStacks: readCached('techStacks'),
    }

    // Render cached data immediately while fresh data loads in background
    if (cached.projects || cached.certificates || cached.techStacks) {
      setData({
        projects: cached.projects || [],
        certificates: cached.certificates || [],
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
