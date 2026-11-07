// Remembers which project was on screen so coming back from a project page
// (the page's Back button or the browser's) lands on that same project.

const ACTIVE_KEY = 'activeProjectId'
const RETURN_KEY = 'returnToProjects'

const storage = () => (typeof window === 'undefined' ? null : window.sessionStorage)

export const getActiveProjectId = () => storage()?.getItem(ACTIVE_KEY) ?? null

export const setActiveProjectId = (id: string) => storage()?.setItem(ACTIVE_KEY, id)

export const clearActiveProjectId = () => storage()?.removeItem(ACTIVE_KEY)

// Called when opening a project page from the Projects section
export const markReturnToProjects = () => storage()?.setItem(RETURN_KEY, '1')

export const cameFromProjects = () => storage()?.getItem(RETURN_KEY) === '1'

// Returns true (once) if the home page should jump back to the Projects section
export const consumeReturnToProjects = () => {
  if (!cameFromProjects()) return false
  storage()?.removeItem(RETURN_KEY)
  return true
}
