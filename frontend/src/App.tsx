import './index.css'
import { ScanPage } from './features/scanner/ScanPage'

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--hud-border)] px-6 py-4 flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-[var(--radar-green)] animate-pulse" />
        <h1 className="text-xl font-bold tracking-wider uppercase">nmap-vis</h1>
        <span className="text-[var(--text-dim)] text-sm ml-auto">v0.1.0</span>
      </header>

      <main className="py-8">
        <ScanPage />
      </main>
    </div>
  )
}

export default App
