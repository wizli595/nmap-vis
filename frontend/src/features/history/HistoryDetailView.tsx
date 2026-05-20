import { useState, useEffect } from 'react'
import { getHistoryScan } from '../../api/history'
import { RadarPage } from '../radar/RadarPage'
import { TerminalView } from '../terminal/TerminalView'
import type { ScanResult } from '../../types/scan'

interface Props {
  scanId: string
  onBack: () => void
}

type Tab = 'radar' | 'terminal'

export function HistoryDetailView({ scanId, onBack }: Props) {
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('radar')

  useEffect(() => {
    getHistoryScan(scanId).then(setScan).catch(() => {})
  }, [scanId])

  if (!scan) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-[var(--text-dim)] font-mono animate-pulse">Loading scan...</span>
      </div>
    )
  }

  const outputLines = scan.raw_output ? scan.raw_output.split('\n').filter(Boolean) : []
  const display = scan.command.replace(/ -oX \S+/g, '').replace(/ -v(?=\s|$)/, '')

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-[var(--text-dim)] hover:text-[var(--radar-green)] transition-colors font-mono text-sm"
          >
            &lt; History
          </button>
          <h2 className="text-lg font-mono text-[var(--radar-green)]">
            {scan.target}
          </h2>
        </div>
        <span className="px-3 py-1 rounded text-xs font-mono uppercase bg-green-500/20 text-green-400">
          {scan.status}
        </span>
      </div>

      <div className="bg-black/50 border border-[var(--hud-border)] rounded px-4 py-3 font-mono text-sm overflow-x-auto">
        <span className="text-[var(--radar-amber)]">$ </span>
        <span className="text-[var(--radar-green)]">{display}</span>
      </div>

      <div className="flex gap-4 text-sm font-mono text-[var(--text-dim)]">
        <span>{scan.hosts.length} host{scan.hosts.length !== 1 ? 's' : ''}</span>
        <span>{new Date(scan.started_at).toLocaleString()}</span>
      </div>

      <div className="flex gap-2 border-b border-[var(--hud-border)] pb-2">
        <TabButton label="Radar" active={activeTab === 'radar'} onClick={() => setActiveTab('radar')} />
        <TabButton label="Terminal" active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} />
      </div>

      {activeTab === 'radar'
        ? <RadarPage hosts={scan.hosts} isScanning={false} />
        : <TerminalView lines={outputLines} />
      }
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors ${
        active
          ? 'text-[var(--radar-green)] border-b-2 border-[var(--radar-green)]'
          : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </button>
  )
}
