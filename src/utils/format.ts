export const fmtDate = (s?: string) => (s ? new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')
export function confidencePct(c?: string | number): number | null {
  if (c === undefined) return null
  const n = typeof c === 'number' ? c : parseFloat(c); if (Number.isNaN(n)) return null
  return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n))
}
export const DEMO = { incident_id: 'INC-034', service: 'Payment API', severity: 'HIGH' as const, description: 'Payment API is returning intermittent HTTP 500 errors during heavy traffic.' }
