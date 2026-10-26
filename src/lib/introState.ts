export const hasPlayedIntro = () => {
  if (typeof window === 'undefined') return false

  return sessionStorage.getItem('introPlayed') === 'true'
}

export const setIntroPlayed = () => {
  if (typeof window === 'undefined') return

  sessionStorage.setItem('introPlayed', 'true')
}

export const isPageReload = () => {
  const [entry] = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[]

  return entry?.type === 'reload'
}

// Clears the "already played" flags so the intro sequence runs again.
export const resetIntroFlags = (includeNavbar = false) => {
  sessionStorage.removeItem('introPlayed')
  sessionStorage.removeItem('heroPlayed')
  if (includeNavbar) sessionStorage.removeItem('navbarPlayed')
}
