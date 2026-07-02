import { useEffect, useState } from 'react'
import { useApi } from './useApi'

const CACHE_KEY = 'aster_premium'

export function usePremium() {
  const { get } = useApi()
  const [isPremium, setIsPremium] = useState<boolean>(
    () => localStorage.getItem(CACHE_KEY) === 'true'
  )

  useEffect(() => {
    get<{ is_premium: boolean }>('/api/stripe/user-status')
      .then(data => {
        const val = data?.is_premium ?? false
        setIsPremium(val)
        localStorage.setItem(CACHE_KEY, val ? 'true' : 'false')
      })
      .catch(() => {})
  }, [])

  return isPremium
}
