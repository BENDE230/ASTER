import { useAuth } from '@clerk/clerk-react'
import { useCallback, useRef } from 'react'
import { api, getCachedFirst } from '../lib/api'

const TOKEN_TTL = 50_000

export function useApi() {
  const { getToken } = useAuth()
  const tokenCache = useRef<{ value: string; ts: number } | null>(null)

  const getFreshToken = useCallback(async (): Promise<string | undefined> => {
    const now = Date.now()
    if (tokenCache.current && now - tokenCache.current.ts < TOKEN_TTL) {
      return tokenCache.current.value
    }
    const token = await getToken()
    if (token) tokenCache.current = { value: token, ts: now }
    return token ?? undefined
  }, [getToken])

  const get = useCallback(async <T>(path: string): Promise<T> => {
    const cached = getCachedFirst<T>(path)
    if (cached) return cached
    const token = await getFreshToken()
    return api.get<T>(path, token)
  }, [getFreshToken])

  const post = useCallback(async <T>(path: string, body: unknown): Promise<T> => {
    const token = await getFreshToken()
    return api.post<T>(path, body, token)
  }, [getFreshToken])

  const patch = useCallback(async <T>(path: string, body: unknown): Promise<T> => {
    const token = await getFreshToken()
    return api.patch<T>(path, body, token)
  }, [getFreshToken])

  const del = useCallback(async <T>(path: string): Promise<T> => {
    const token = await getFreshToken()
    return api.delete<T>(path, token)
  }, [getFreshToken])

  return { get, post, patch, delete: del }
}
