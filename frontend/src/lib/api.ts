export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type RequestOptions = RequestInit & { token?: string }

// Simple in-memory GET cache — 30s TTL
const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 5 * 60_000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null }
  return entry.data as T
}

// Check cache by path only (before token is available)
export function getCachedFirst<T>(path: string): T | null {
  for (const [key, entry] of cache.entries()) {
    if (key.endsWith(`:${path}`)) {
      if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null }
      return entry.data as T
    }
  }
  return null
}

function setCached(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() })
}

export function isCacheFresh(path: string): boolean {
  for (const [key, entry] of cache.entries()) {
    if (key.endsWith(`:${path}`)) {
      return Date.now() - entry.ts <= CACHE_TTL
    }
  }
  return false
}

export function invalidateCache(path?: string) {
  if (path) {
    for (const key of cache.keys()) {
      if (key.endsWith(`:${path}`)) cache.delete(key)
    }
  } else {
    cache.clear()
  }
  window.dispatchEvent(new CustomEvent('aster:cache-invalidated', { detail: path ?? null }))
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail ?? 'Erreur serveur')
  }

  return res.json()
}

export const api = {
  get: <T>(path: string, token?: string): Promise<T> => {
    const cacheKey = `${token?.slice(-8) ?? 'anon'}:${path}`
    const cached = getCached<T>(cacheKey)
    if (cached) return Promise.resolve(cached)
    return request<T>(path, { method: 'GET', token }).then(data => {
      setCached(cacheKey, data)
      return data
    })
  },

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), token }),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
}
