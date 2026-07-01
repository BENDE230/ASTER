import { useAuth } from '@clerk/clerk-react'
import { useCallback } from 'react'
import { api } from '../lib/api'

export function useApi() {
  const { getToken } = useAuth()

  const get = useCallback(async <T>(path: string): Promise<T> => {
    const token = await getToken()
    return api.get<T>(path, token ?? undefined)
  }, [getToken])

  const post = useCallback(async <T>(path: string, body: unknown): Promise<T> => {
    const token = await getToken()
    return api.post<T>(path, body, token ?? undefined)
  }, [getToken])

  const patch = useCallback(async <T>(path: string, body: unknown): Promise<T> => {
    const token = await getToken()
    return api.patch<T>(path, body, token ?? undefined)
  }, [getToken])

  const del = useCallback(async <T>(path: string): Promise<T> => {
    const token = await getToken()
    return api.delete<T>(path, token ?? undefined)
  }, [getToken])

  return { get, post, patch, delete: del }
}
