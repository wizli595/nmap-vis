import { useState } from 'react'
import './index.css'
import { ScanPage } from './features/scanner/ScanPage'
import { HistoryPage } from './features/history/HistoryPage'
import { HistoryDetailView } from './features/history/HistoryDetailView'

type Page =
  | { kind: 'scanner' }
  | { kind: 'history' }
  | { kind: 'history-detail'; scanId: string }

function App() {
  const [page, setPage] = useState<Page>({ kind: 'scanner' })

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
        <span className="text-[var(--text-dim)] text-sm ml-auto">v0.1.0</span>
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
