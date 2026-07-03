import { useEffect } from 'react'
import { useApi } from '../hooks/useApi'

const PREFETCH_PATHS = [
  '/api/checkins/stats',
  '/api/journal',
  '/api/insights',
  '/api/stripe/subscription',
  '/api/notifications/settings',
  '/api/stripe/user-status',
]

export default function PrefetchAppData() {
  const { get } = useApi()

  useEffect(() => {
    PREFETCH_PATHS.forEach(path => {
      get(path).catch(() => {})
    })
  }, [get])

  return null
}
