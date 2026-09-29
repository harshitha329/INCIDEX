import { ChevronRight } from 'lucide-react'
import type { StoredIncident } from '../types'
import { Badge, Card, SeverityBadge } from './ui'
import { fmtDate } from '../utils/format'
import { go } from '../hooks/useIncidents'
export const statusBadge = (s: StoredIncident['status']) => s === 'approved' ? <Badge tone="green">Approved</Badge> : s === 'rejected' ? <Badge tone="red">Rejected</Badge> : <Badge tone="amber">Awaiting review</Badge>
export const learnBadge = (l: StoredIncident['learning']) => l === 'captured' ? <Badge tone="violet">Learning captured</Badge> : l === 'not_captured' ? <Badge>No learning</Badge> : <Badge tone="amber">Learning pending</Badge>
export default function IncidentCard({ i }: { i: StoredIncident }) {
  return <button onClick={() => go(`/incident/${encodeURIComponent(i.incident_id)}`)} className="group w-full text-left"><Card className="p-4 transition hover:border-sky-500/30 hover:bg-ink-700/80">
    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-semibold text-white">{i.incident_id}</span><SeverityBadge s={i.severity} />{statusBadge(i.status)}{learnBadge(i.learning)}<ChevronRight className="ml-auto h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-sky-400" /></div>
    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{i.description}</p>
    <div className="mt-3 flex justify-between text-xs text-slate-500"><span>{i.service}</span><span>{fmtDate(i.createdAt)}</span></div></Card></button>
}
