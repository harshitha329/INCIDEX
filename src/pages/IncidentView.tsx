import { ArrowLeft, Search } from 'lucide-react'
import { Button, Card, Empty, PageHeader, SeverityBadge, cx } from '../components/ui'
import { AnalysisPanels } from '../components/Analysis'
import { learnBadge, statusBadge } from '../components/IncidentCard'
import { go, useIncidents } from '../hooks/useIncidents'
import { fmtDate } from '../utils/format'
const Step = ({ title, done, children }: { title: string; done: boolean; children: React.ReactNode }) => (
  <li className="relative pb-6 pl-8 last:pb-0"><span className="absolute left-[7px] top-5 h-full w-px bg-white/10 last:hidden" /><span className={cx('absolute left-0 top-1.5 h-4 w-4 rounded-full border-2', done ? 'border-sky-400 bg-sky-400/30' : 'border-slate-600 bg-ink-900')} />
    <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>{children}</li>)
export default function IncidentView({ id }: { id: string }) {
  const i = useIncidents().find((x) => x.incident_id === id)
  if (!i) return <Empty icon={<Search className="h-6 w-6" />} title="Incident not found" text="It may have been cleared from this browser's history." action={<Button variant="primary" onClick={() => go('/history')}>Back to history</Button>} />
  const decided = i.status !== 'investigated'
  return <div><Button variant="ghost" className="-ml-3 mb-2" onClick={() => go('/history')}><ArrowLeft className="h-4 w-4" />Incident History</Button>
    <PageHeader title={i.incident_id} sub={`${i.service} · ${fmtDate(i.createdAt)}`} action={<div className="flex flex-wrap gap-2"><SeverityBadge s={i.severity} />{statusBadge(i.status)}{learnBadge(i.learning)}</div>} />
    <Card className="p-5 sm:p-6"><ol>
      <Step title="Incident reported" done><p className="whitespace-pre-wrap text-sm text-slate-300">{i.description}</p></Step>
      <Step title="AI investigation" done={!!i.result}>{i.result ? <AnalysisPanels r={i.result} /> : <p className="text-sm text-slate-500">No investigation stored.</p>}</Step>
      <Step title="Engineer decision" done={decided}>{decided ? <p className="text-sm text-slate-300">Recommendation {i.status}{i.updatedAt && ` on ${fmtDate(i.updatedAt)}`}.</p> : <p className="text-sm text-slate-500">Awaiting engineer review.</p>}</Step>
      <Step title="Outcome & learning" done={i.learning === 'captured'}>{i.learning === 'captured' ? <div className="space-y-3 text-sm"><div><div className="text-xs uppercase tracking-wider text-slate-500">Actual outcome</div><p className="mt-1 whitespace-pre-wrap text-slate-300">{i.outcome}</p></div><div><div className="text-xs uppercase tracking-wider text-slate-500">Engineer feedback</div><p className="mt-1 whitespace-pre-wrap text-slate-300">{i.feedback}</p></div></div> : <p className="text-sm text-slate-500">No learning recorded for this incident.</p>}</Step></ol></Card></div>
}
