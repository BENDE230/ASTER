import type { NavigateFunction } from 'react-router-dom'

export const OPEN_PROTOCOL_EVENT = 'aster:open-protocol'
export const PENDING_PROTOCOL_KEY = 'aster:pending-protocol'

/** Opens a protocol even if already on /protocols (keep-alive safe). */
export function openProtocol(id: string, navigate: NavigateFunction) {
  try {
    sessionStorage.setItem(PENDING_PROTOCOL_KEY, id)
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent(OPEN_PROTOCOL_EVENT, { detail: id }))
  navigate(`/protocols?open=${id}`)
}

export function consumePendingProtocol(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_PROTOCOL_KEY)
    if (id) sessionStorage.removeItem(PENDING_PROTOCOL_KEY)
    return id
  } catch {
    return null
  }
}
