import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import {
  initAnalytics,
  trackPageView,
  identifyUser,
  resetUser,
  trackSignupIfNew,
} from '../lib/analytics'

export default function PostHogProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user, isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
      })
      trackSignupIfNew(user.id, user.createdAt ? new Date(user.createdAt) : null)
    } else {
      resetUser()
    }
  }, [user, isSignedIn, isLoaded])

  return children
}
