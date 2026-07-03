import { useEffect, useState, useCallback } from 'react'
import { getCachedFirst, isCacheFresh } from '../lib/api'
import { useApi } from './useApi'

export function useCachedQuery<T>(path: string, defaultValue: T) {
  const { get } = useApi()
  const [data, setData] = useState<T>(() => getCachedFirst<T>(path) ?? defaultValue)
  const [loading, setLoading] = useState(() => getCachedFirst<T>(path) === null)

  useEffect(() => {
    if (isCacheFresh(path)) return

    let cancelled = false
    get<T>(path)
      .then(result => { if (!cancelled) setData(result) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [path, get])

  const refresh = useCallback(() => {
    return get<T>(path)
      .then(result => { setData(result); return result })
      .catch(() => defaultValue as T)
  }, [path, get, defaultValue])

  return { data, loading, setData, refresh }
}
