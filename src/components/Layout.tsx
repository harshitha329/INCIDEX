import { useState } from 'react'
import { Brain, ChevronsLeft, ChevronsRight, History, LayoutDashboard, Menu, Radar, Settings, ShieldCheck, X } from 'lucide-react'
import { StatusDot, cx } from './ui'
import { endpointsConfigured } from '../services/incidentApi'
import { go } from '../hooks/useIncidents'

const NAV = [['/', 'Overview', LayoutDashboard], ['/investigate', 'Investigate', Radar], ['/history', 'Incident History', History], ['/memory', 'Organizational Memory', Brain], ['/settings', 'Settings', Settings]] as const
const TITLES: Record<string, string> = { '/': 'Overview', '/investigate': 'Investigate', '/history': 'Incident History', '/memory': 'Organizational Memory', '/settings': 'Settings' }

function SideContent({ path, collapsed, close }: { path: string; collapsed: boolean; close?: () => void }) {
  const c = endpointsConfigured()
  const rows = [['AI Engine', c.w1], ['Memory', c.w2], ['Investigation', c.w1], ['Learning', c.w2]] as const
  return <div className="flex h-full flex-col">
    <div className="flex items-center gap-3 px-4 py-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-500"><ShieldCheck className="h-5 w-5 text-white" /></div>
      {!collapsed && <div className="text-sm font-semibold leading-tight text-white">Incident Learning<br /><span className="text-slate-400">& Response Agent</span></div>}</div>
    <nav aria-label="Primary" className="flex-1 space-y-1 px-2.5">
      {NAV.map(([p, l, Icon]) => { const on = p === '/' ? path === '/' : path.startsWith(p) || (p === '/history' && path.startsWith('/incident/'))
        return <a key={p} href={`#${p}`} onClick={close} aria-current={on ? 'page' : undefined} title={collapsed ? l : undefined}
          className={cx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition', on ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')}><Icon className="h-4 w-4 shrink-0" />{!collapsed && l}</a> })}</nav>
    <div className="m-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      {!collapsed && <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">System status</div>}
      <ul className="space-y-1.5">{rows.map(([n, ok]) => <li key={n} className="flex items-center gap-2 text-xs text-slate-400" title={`${n}: ${ok ? 'Endpoint configured' : 'Not configured'}`}><StatusDot ok={ok} />{!collapsed && <><span className="flex-1">{n}</span><span className={ok ? 'text-emerald-400' : 'text-amber-400'}>{ok ? 'Configured' : 'Setup'}</span></>}</li>)}</ul></div></div>
}
export default function Layout({ path, children }: { path: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false), [open, setOpen] = useState(false), c = endpointsConfigured(), ready = c.w1 && c.w2
  const title = TITLES[path] ?? (path.startsWith('/incident/') ? 'Incident Detail' : 'Overview')
  return <div className="min-h-screen">
    <aside className={cx('fixed inset-y-0 left-0 z-30 hidden border-r border-white/[0.07] bg-ink-900/90 backdrop-blur transition-[width] lg:block', collapsed ? 'w-[72px]' : 'w-64')}><SideContent path={path} collapsed={collapsed} /></aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} /><aside className="relative h-full w-72 border-r border-white/10 bg-ink-900 animate-up" aria-label="Navigation drawer"><button aria-label="Close menu" className="absolute right-3 top-4 rounded p-1 text-slate-400" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button><SideContent path={path} collapsed={false} close={() => setOpen(false)} /></aside></div>}
    <div className={cx('transition-[padding]', collapsed ? 'lg:pl-[72px]' : 'lg:pl-64')}>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-ink-950/80 px-4 backdrop-blur sm:px-6">
        <button aria-label="Open menu" className="rounded-md p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
        <button aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden rounded-md p-2 text-slate-400 hover:bg-white/10 lg:block" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}</button>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300 sm:flex"><StatusDot ok={ready} />{ready ? 'Endpoints configured' : 'Setup required'}</div>
          <button onClick={() => go('/settings')} aria-label="Profile and settings" className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-semibold text-white ring-1 ring-white/15">ENG</button></div></header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main></div></div>
}
