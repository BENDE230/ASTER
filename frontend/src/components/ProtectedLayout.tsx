import { useEffect, useState, type ComponentType } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import PrefetchAppData from './PrefetchAppData'
import { PremiumProvider } from '../context/PremiumContext'
import Dashboard from '../pages/Dashboard'
import CheckIn from '../pages/CheckIn'
import Journal from '../pages/Journal'
import Protocols from '../pages/Protocols'
import Insights from '../pages/Insights'
import Profile from '../pages/Profile'

const PAGES: Record<string, ComponentType> = {
  '/dashboard': Dashboard,
  '/checkin': CheckIn,
  '/journal': Journal,
  '/protocols': Protocols,
  '/insights': Insights,
  '/profile': Profile,
}

export default function ProtectedLayout() {
  const location = useLocation()
  const path = location.pathname
  const Page = PAGES[path]

  const [visited, setVisited] = useState<string[]>(() => (Page ? [path] : []))

  useEffect(() => {
    if (Page) {
      setVisited(prev => (prev.includes(path) ? prev : [...prev, path]))
      // signal the newly-visible page to refresh if its cache was invalidated
      window.dispatchEvent(new CustomEvent(`aster:refresh:${path}`))
    }
  }, [path, Page])

  if (!Page) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PremiumProvider>
      <PrefetchAppData />
      <div className="min-h-screen bg-navy-950 flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {visited.map(p => {
            const CachedPage = PAGES[p]
            if (!CachedPage) return null
            const active = p === path
            return (
              <div
                key={p}
                className={active ? 'block' : 'hidden'}
                aria-hidden={!active}
              >
                <CachedPage />
              </div>
            )
          })}
        </div>
      </div>
    </PremiumProvider>
  )
}
