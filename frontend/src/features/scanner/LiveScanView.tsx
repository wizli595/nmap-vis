import { useState } from 'react'
import { useScanStream } from './useScanStream'
import { TerminalView } from '../terminal/TerminalView'
import { RadarPage } from '../radar/RadarPage'

interface Props {
  scanId: string
  onBack: () => void
}

type Tab = 'radar' | 'terminal'

export function LiveScanView({ scanId, onBack }: Props) {
  const { scan, outputLines, hosts, connectionStatus } = useScanStream(scanId)
  const [activeTab, setActiveTab] = useState<Tab>('radar')
  const isScanning = scan?.status === 'running'

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Header
        scanId={scanId}
        status={scan?.status ?? 'running'}
        connectionStatus={connectionStatus}
        onBack={onBack}
      />

      {scan && <CommandBar command={scan.command} />}

      <HostSummary count={hosts.length} status={scan?.status ?? 'running'} />

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === 'radar'
        ? <RadarPage hosts={hosts} isScanning={isScanning} />
        : <TerminalView lines={outputLines} />
      }
    </div>
  )
}

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-2 border-b border-[var(--hud-border)] pb-2">
      <TabButton label="Radar" active={active === 'radar'} onClick={() => onChange('radar')} />
      <TabButton label="Terminal" active={active === 'terminal'} onClick={() => onChange('terminal')} />
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

interface HeaderProps {
  scanId: string
  status: string
  connectionStatus: string
  onBack: () => void
}

function Header({ scanId, status, connectionStatus, onBack }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-[var(--text-dim)] hover:text-[var(--radar-green)] transition-colors font-mono text-sm"
        >
          &lt; Back
        </button>
        <h2 className="text-lg font-mono text-[var(--radar-green)]">
          Scan {scanId.slice(0, 8)}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge label={connectionStatus} type="connection" />
        <StatusBadge label={status} type="scan" />
      </div>
    </div>
  )
}

function StatusBadge({ label, type }: { label: string; type: 'connection' | 'scan' }) {
  const color = badgeColor(label, type)
  return (
    <span className={`px-3 py-1 rounded text-xs font-mono uppercase ${color}`}>
      {label}
    </span>
  )
}

function badgeColor(label: string, type: string): string {
  if (type === 'connection') {
    if (label === 'connected') return 'bg-green-500/20 text-green-400'
    if (label === 'connecting') return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }
  if (label === 'completed') return 'bg-green-500/20 text-green-400'
  if (label === 'running') return 'bg-blue-500/20 text-blue-400'
  if (label === 'failed') return 'bg-red-500/20 text-red-400'
  return 'bg-gray-500/20 text-gray-400'
}

function CommandBar({ command }: { command: string }) {
  const display = command.replace(' -oX -', '')

  return (
    <div className="bg-black/50 border border-[var(--hud-border)] rounded px-4 py-3 font-mono text-sm overflow-x-auto">
      <span className="text-[var(--radar-amber)]">$ </span>
      <span className="text-[var(--radar-green)]">{display}</span>
    </div>
  )
}

function HostSummary({ count, status }: { count: number; status: string }) {
  const isRunning = status === 'running'

  return (
    <div className="flex items-center gap-3 text-sm font-mono">
      <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[var(--radar-green)] animate-pulse' : 'bg-[var(--text-dim)]'}`} />
      <span className="text-[var(--text-primary)]">
        {count} host{count !== 1 ? 's' : ''} discovered
      </span>
      {isRunning && (
        <span className="text-[var(--text-dim)]">scanning...</span>
      )}
    </div>
  )
}
