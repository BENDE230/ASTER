import { useEffect, useState, useCallback } from 'react'
import { getCachedFirst, isCacheFresh } from '../lib/api'
import { useApi } from './useApi'

export function useCachedQuery<T>(path: string, defaultValue: T) {
  const { get } = useApi()
  const [data, setData] = useState<T>(() => getCachedFirst<T>(path) ?? defaultValue)
  const [loading, setLoading] = useState(() => getCachedFirst<T>(path) === null)

  const fetchData = useCallback(() => {
    if (isCacheFresh(path)) return
    let cancelled = false
    get<T>(path)
      .then(result => { if (!cancelled) setData(result) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [path, get])

  useEffect(() => {
    const cleanup = fetchData()
    return cleanup
  }, [fetchData])

  useEffect(() => {
    const handler = (e: Event) => {
      const invalidatedPath = (e as CustomEvent).detail
      // re-fetch if all cache was cleared, or if our specific path was invalidated
      if (invalidatedPath === null || invalidatedPath === path) {
        fetchData()
      }
    }
    window.addEventListener('aster:cache-invalidated', handler)
    return () => window.removeEventListener('aster:cache-invalidated', handler)
  }, [path, fetchData])

  const refresh = useCallback(() => {
    return get<T>(path)
      .then(result => { setData(result); return result })
      .catch(() => defaultValue as T)
  }, [path, get, defaultValue])

  return { data, loading, setData, refresh }
}
