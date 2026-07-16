import type { NavigateFunction } from 'react-router-dom'

export const OPEN_PROTOCOL_EVENT = 'aster:open-protocol'

/** Opens a protocol even if already on /protocols (keep-alive safe). */
export function openProtocol(id: string, navigate: NavigateFunction) {
  window.dispatchEvent(new CustomEvent(OPEN_PROTOCOL_EVENT, { detail: id }))
  navigate(`/protocols?open=${id}`)
}
