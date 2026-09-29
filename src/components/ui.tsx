import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import type { Severity } from '../types'
export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(' ')

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cx('rounded-xl border border-white/[0.07] bg-ink-800/80 shadow-[inset_0_1px_0_rgba(255,255,255,.03)] backdrop-blur', className)}>{children}</div>)

const V = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_0_1px_rgba(96,165,250,.35),0_6px_18px_-6px_rgba(37,99,235,.6)]',
  secondary: 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]',
  danger: 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  ghost: 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100',
}
export function Button({ variant = 'secondary', loading, className, children, ...p }: { variant?: keyof typeof V; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} disabled={p.disabled || loading} className={cx('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50', V[variant], className)}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{children}</button>
}
const SEV: Record<Severity, string> = {
  LOW: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', MEDIUM: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  HIGH: 'border-orange-500/30 bg-orange-500/10 text-orange-300', CRITICAL: 'border-red-500/40 bg-red-500/10 text-red-300' }
export const SeverityBadge = ({ s }: { s: Severity }) => <span className={cx('inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide', SEV[s])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>
export const Badge = ({ tone = 'slate', children }: { tone?: 'slate' | 'green' | 'red' | 'amber' | 'blue' | 'violet'; children: ReactNode }) => {
  const t = { slate: 'border-white/10 bg-white/5 text-slate-300', green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', red: 'border-red-500/30 bg-red-500/10 text-red-300', amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300', blue: 'border-sky-500/30 bg-sky-500/10 text-sky-300', violet: 'border-violet-500/30 bg-violet-500/10 text-violet-300' }[tone]
  return <span className={cx('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium', t)}>{children}</span>
}
export const StatusDot = ({ ok }: { ok: boolean }) => <span className={cx('h-2 w-2 rounded-full', ok ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]' : 'bg-amber-400')} />
export const Field = ({ label, error, children, htmlFor }: { label: string; error?: string; children: ReactNode; htmlFor: string }) => (
  <div><label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">{label}</label>{children}
    {error && <p role="alert" className="mt-1.5 text-xs text-red-400">{error}</p>}</div>)
export const inputCls = 'w-full rounded-lg border border-white/10 bg-ink-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/20'
export const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-up"><div><h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>{sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}</div>{action}</div>)
export const Empty = ({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) => (
  <Card className="flex flex-col items-center px-6 py-14 text-center animate-up"><div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-slate-400">{icon}</div>
    <h3 className="font-medium text-white">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-400">{text}</p>{action && <div className="mt-5">{action}</div>}</Card>)
export const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 animate-up">
    <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden /><span className="min-w-0 flex-1">{message}</span>{onRetry && <Button variant="danger" onClick={onRetry}>Retry</Button>}</div>)

export function Modal({ open, title, onClose, children, footer, locked }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; locked?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose); closeRef.current = onClose
  const lockedRef = useRef(locked); lockedRef.current = locked
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('textarea,input,button')?.focus()
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lockedRef.current) closeRef.current()
      if (e.key === 'Tab' && ref.current) { const f = [...ref.current.querySelectorAll<HTMLElement>('button,textarea,input,[href]')].filter((x) => !x.hasAttribute('disabled')); if (!f.length) return
        const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } }
    }
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus() }
  }, [open])
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 p-3 backdrop-blur-sm sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !locked && onClose()}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="mx-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl animate-pop sm:max-h-[calc(100dvh-2rem)]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-4"><h2 id="modal-title" className="font-semibold text-white">{title}</h2>
        <button aria-label="Close dialog" onClick={onClose} disabled={locked} className="rounded-md p-1 text-slate-400 hover:bg-white/10"><X className="h-4 w-4" /></button></div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">{children}</div>{footer && <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}</div></div>
}
type Toast = { id: number; kind: 'success' | 'error' | 'info'; text: string }
const Ctx = createContext<(kind: Toast['kind'], text: string) => void>(() => {})
export const useToast = () => useContext(Ctx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([])
  const push = useCallback((kind: Toast['kind'], text: string) => { const id = Date.now() + Math.random(); setList((l) => [...l, { id, kind, text }]); setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4500) }, [])
  const I = { success: CheckCircle2, error: AlertTriangle, info: Info }, C = { success: 'text-emerald-400', error: 'text-red-400', info: 'text-sky-400' }
  return <Ctx.Provider value={push}>{children}
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {list.map((t) => { const Ic = I[t.kind]; return <div key={t.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-ink-700 p-3.5 text-sm shadow-xl animate-pop"><Ic className={cx('mt-0.5 h-4 w-4 shrink-0', C[t.kind])} /><span>{t.text}</span></div> })}</div></Ctx.Provider>
}
