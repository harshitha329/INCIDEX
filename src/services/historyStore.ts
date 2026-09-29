// Swap this module for a Supabase-backed implementation later; the hook and UI stay unchanged.
import type { StoredIncident } from '../types'
const KEY = 'ila.incidents.v1', EVT = 'ila:history'
export const readAll = (): StoredIncident[] => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
const write = (l: StoredIncident[]) => { try { localStorage.setItem(KEY, JSON.stringify(l)) } catch { /* storage unavailable */ } window.dispatchEvent(new Event(EVT)) }
export const upsertIncident = (i: StoredIncident) => write([i, ...readAll().filter((x) => x.incident_id !== i.incident_id)])
export const patchIncident = (id: string, p: Partial<StoredIncident>) => write(readAll().map((x) => (x.incident_id === id ? { ...x, ...p, updatedAt: new Date().toISOString() } : x)))
export const clearHistory = () => write([])
export const subscribe = (cb: () => void) => { window.addEventListener(EVT, cb); window.addEventListener('storage', cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener('storage', cb) } }
