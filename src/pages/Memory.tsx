import { useState } from 'react'
import { Brain, Search } from 'lucide-react'
import { Badge, Button, Card, Empty, PageHeader, inputCls } from '../components/ui'
import { go, useIncidents } from '../hooks/useIncidents'
import { fmtDate } from '../utils/format'
export default function Memory() {
  const [q, setQ] = useState(''); const learnings = useIncidents().filter((i) => i.learning === 'captured')
  const list = learnings.filter((i) => !q || `${i.incident_id} ${i.service} ${i.outcome} ${i.feedback} ${i.result?.analysis.recommended_action}`.toLowerCase().includes(q.toLowerCase()))
  return <div><PageHeader title="Organizational Memory" sub="A growing knowledge base of production incidents and engineering learnings." />
    <Card className="mb-5 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-4 text-sm text-slate-400 animate-up"><Brain className="mr-2 inline h-4 w-4 text-violet-400" />Showing learnings recorded from this browser. Long-term memory is stored and retrieved by the backend during each investigation and is not queried directly from the frontend.</Card>
    {!learnings.length ? <Empty icon={<Brain className="h-6 w-6" />} title="No learnings captured yet" text="Approve a recommendation and record its outcome to add a learning." action={<Button variant="primary" onClick={() => go('/investigate')}>Investigate New Incident</Button>} /> : <>
      <div className="relative mb-5"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input aria-label="Search learnings" className={`${inputCls} pl-9`} placeholder="Search learnings" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {list.length ? <div className="grid gap-4 md:grid-cols-2">{list.map((i) => <button key={i.incident_id} onClick={() => go(`/incident/${encodeURIComponent(i.incident_id)}`)} className="text-left"><Card className="h-full border-l-2 border-l-violet-500/60 p-5 transition hover:border-violet-500/40">
        <div className="mb-3 flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-semibold text-white">{i.incident_id}</span><Badge>{i.service}</Badge><span className="ml-auto text-xs text-slate-500">{fmtDate(i.updatedAt)}</span></div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">Outcome</div><p className="mb-3 mt-1 line-clamp-3 text-sm text-slate-300">{i.outcome}</p>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Engineer feedback</div><p className="mt-1 line-clamp-3 text-sm text-slate-400">{i.feedback}</p></Card></button>)}</div>
        : <Empty icon={<Search className="h-6 w-6" />} title="No matches" text="No learnings match your search." />}</>}</div>
}
