import { useState, useCallback } from 'react'
import './index.css'
import { SetupPage } from './features/setup/SetupPage'
import { ScanPage } from './features/scanner/ScanPage'
import { HistoryPage } from './features/history/HistoryPage'
import { HistoryDetailView } from './features/history/HistoryDetailView'

type AppState =
  | { kind: 'setup' }
  | { kind: 'app'; mode: 'docker' | 'local' }

type Page =
  | { kind: 'scanner' }
  | { kind: 'history' }
  | { kind: 'history-detail'; scanId: string }

function App() {
  const [appState, setAppState] = useState<AppState>({ kind: 'setup' })
  const [page, setPage] = useState<Page>({ kind: 'scanner' })

  const handleReady = useCallback((mode: 'docker' | 'local') => {
    setAppState({ kind: 'app', mode })
  }, [])

  if (appState.kind === 'setup') {
    return <SetupPage onReady={handleReady} />
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--hud-border)] px-6 py-4 flex items-center gap-6">
        <div className="w-3 h-3 rounded-full bg-[var(--radar-green)] animate-pulse" />
        <h1
          className="text-xl font-bold tracking-wider uppercase cursor-pointer hover:text-[var(--radar-green)] transition-colors"
          onClick={() => setPage({ kind: 'scanner' })}
        >
          nmap-vis
        </h1>
        <nav className="flex gap-4 ml-4">
          <NavButton
            label="Scanner"
            active={page.kind === 'scanner'}
            onClick={() => setPage({ kind: 'scanner' })}
          />
          <NavButton
            label="History"
            active={page.kind === 'history' || page.kind === 'history-detail'}
            onClick={() => setPage({ kind: 'history' })}
          />
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ModeBadge mode={appState.mode} />
          <span className="text-[var(--text-dim)] text-sm">v0.1.0</span>
        </div>
      </header>

      <main className="py-8">
        {page.kind === 'scanner' && <ScanPage />}
        {page.kind === 'history' && (
          <HistoryPage onViewScan={(id) => setPage({ kind: 'history-detail', scanId: id })} />
        )}
        {page.kind === 'history-detail' && (
          <HistoryDetailView
            scanId={page.scanId}
            onBack={() => setPage({ kind: 'history' })}
          />
        )}
      </main>
    </div>
  )
}

function ModeBadge({ mode }: { mode: 'docker' | 'local' }) {
  const label = mode === 'docker' ? 'DOCKER' : 'LOCAL'
  const color = mode === 'docker'
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    : 'bg-green-500/20 text-green-400 border-green-500/30'

  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-mono ${color}`}>
      {label}
    </span>
  )
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-sm uppercase tracking-wider transition-colors ${
        active ? 'text-[var(--radar-green)]' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </button>
  )
}

export default App
