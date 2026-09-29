import { ToastProvider } from './components/ui'
import Layout from './components/Layout'
import { useHashRoute } from './hooks/useIncidents'
import Overview from './pages/Overview'
import Investigate from './pages/Investigate'
import HistoryPage from './pages/History'
import IncidentView from './pages/IncidentView'
import Memory from './pages/Memory'
import SettingsPage from './pages/Settings'
export default function App() {
  const path = useHashRoute()
  let page = <Overview />
  if (path === '/investigate') page = <Investigate />
  else if (path === '/history') page = <HistoryPage />
  else if (path.startsWith('/incident/')) page = <IncidentView id={decodeURIComponent(path.slice(10))} />
  else if (path === '/memory') page = <Memory />
  else if (path === '/settings') page = <SettingsPage />
  return <ToastProvider><Layout path={path}><div key={path} className="animate-up">{page}</div></Layout></ToastProvider>
}
