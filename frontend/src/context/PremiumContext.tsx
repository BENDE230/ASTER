import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useApi } from '../hooks/useApi'

const CACHE_KEY = 'aster_premium'

const PremiumContext = createContext(true)

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { get } = useApi()
  const [isPremium, setIsPremium] = useState(
    () => localStorage.getItem(CACHE_KEY) === 'true',
  )

  useEffect(() => {
    get<{ is_premium: boolean }>('/api/stripe/user-status')
      .then(data => {
        const val = data?.is_premium ?? false
        setIsPremium(val)
        localStorage.setItem(CACHE_KEY, val ? 'true' : 'false')
      })
      .catch(() => {})
  }, [get])

  return (
    <PremiumContext.Provider value={isPremium}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  return useContext(PremiumContext)
}
