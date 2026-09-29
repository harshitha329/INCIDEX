import { useMemo, useState } from 'react'
import { History as H, Search } from 'lucide-react'
import { Button, Empty, PageHeader, inputCls } from '../components/ui'
import IncidentCard from '../components/IncidentCard'
import { go, useIncidents } from '../hooks/useIncidents'
import { SEVERITIES } from '../types'
export default function HistoryPage() {
  const all = useIncidents(); const [q, setQ] = useState(''), [svc, setSvc] = useState(''), [sev, setSev] = useState(''), [st, setSt] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState('')
  const services = useMemo(() => [...new Set(all.map((i) => i.service))].sort(), [all])
  const list = all.filter((i) => {
    const t = new Date(i.createdAt).getTime()
    return (!q || `${i.incident_id} ${i.service} ${i.description}`.toLowerCase().includes(q.toLowerCase())) && (!svc || i.service === svc) && (!sev || i.severity === sev) && (!st || i.status === st)
      && (!from || t >= new Date(from).getTime()) && (!to || t <= new Date(to).getTime() + 86400000)
  })
  const sel = `${inputCls} sm:w-auto`
  return <div><PageHeader title="Incident History" sub="Incidents investigated in this browser. Stored locally until a history service is connected." />
    {!all.length ? <Empty icon={<H className="h-6 w-6" />} title="No incidents yet" text="Investigated incidents will appear here." action={<Button variant="primary" onClick={() => go('/investigate')}>Investigate New Incident</Button>} /> : <>
      <div className="mb-5 grid gap-3 sm:flex sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-[220px]"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input aria-label="Search incidents" className={`${inputCls} pl-9`} placeholder="Search incidents" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Service filter" className={sel} value={svc} onChange={(e) => setSvc(e.target.value)}><option value="">All services</option>{services.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Severity filter" className={sel} value={sev} onChange={(e) => setSev(e.target.value)}><option value="">All severities</option>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Status filter" className={sel} value={st} onChange={(e) => setSt(e.target.value)}><option value="">All statuses</option><option value="investigated">Awaiting review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
        <input type="date" aria-label="From date" className={sel} value={from} onChange={(e) => setFrom(e.target.value)} /><input type="date" aria-label="To date" className={sel} value={to} onChange={(e) => setTo(e.target.value)} /></div>
      {list.length ? <div className="grid gap-3 md:grid-cols-2">{list.map((i) => <IncidentCard key={i.incident_id} i={i} />)}</div> : <Empty icon={<Search className="h-6 w-6" />} title="No matches" text="Try adjusting your search or filters." action={<Button onClick={() => { setQ(''); setSvc(''); setSev(''); setSt(''); setFrom(''); setTo('') }}>Clear filters</Button>} />}</>}</div>
}
