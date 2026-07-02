import { useEffect, useState } from 'react'
import { useApi } from './useApi'

export function usePremium() {
  const { get } = useApi()
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    get<{ is_premium: boolean }>('/api/stripe/user-status')
      .then(data => { if (data?.is_premium) setIsPremium(true) })
      .catch(() => {})
  }, [])

  return isPremium
}
