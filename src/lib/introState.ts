export const hasPlayedIntro = () => {
  if (typeof window === 'undefined') return false

  return sessionStorage.getItem('introPlayed') === 'true'
}

export const setIntroPlayed = () => {
  if (typeof window === 'undefined') return

  sessionStorage.setItem('introPlayed', 'true')
}

// True until the home page has mounted once in this browser tab. Later visits
// (e.g. Back from a project page) are client-side and must not replay the intro.
let firstHomeMount = true

export const markHomeMounted = () => {
  firstHomeMount = false
}

// True when the home page is showing again after an in-site navigation,
// so the intro has already played and everything should appear in place
export const isReturnVisit = () => !firstHomeMount

// Only the first load of the page can be a reload: the browser keeps reporting
// "reload" for the whole life of the tab, even after client-side navigation.
export const isPageReload = () => {
  if (!firstHomeMount) return false

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
