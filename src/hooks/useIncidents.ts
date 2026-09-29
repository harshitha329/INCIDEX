import { useEffect, useState } from 'react'
import { readAll, subscribe } from '../services/historyStore'
export function useIncidents() { const [l, setL] = useState(readAll); useEffect(() => subscribe(() => setL(readAll())), []); return l }
export function useHashRoute() {
  const get = () => window.location.hash.slice(1) || '/'
  const [p, setP] = useState(get)
  useEffect(() => { const f = () => { setP(get()); window.scrollTo(0, 0) }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  return p
}
export const go = (p: string) => { window.location.hash = p }
