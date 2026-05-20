import { useScanStream } from './useScanStream'
import { TerminalView } from '../terminal/TerminalView'

interface Props {
  scanId: string
  onBack: () => void
}

export function LiveScanView({ scanId, onBack }: Props) {
  const { scan, outputLines, hosts, connectionStatus } = useScanStream(scanId)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Header
        scanId={scanId}
        status={scan?.status ?? 'running'}
        connectionStatus={connectionStatus}
        onBack={onBack}
      />

      {scan && <CommandBar command={scan.command} />}

      <HostSummary count={hosts.length} status={scan?.status ?? 'running'} />

      <TerminalView lines={outputLines} />
    </div>
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
  return (
    <div className="bg-black/50 border border-[var(--hud-border)] rounded px-4 py-3 font-mono text-sm overflow-x-auto">
      <span className="text-[var(--radar-amber)]">$ </span>
      <span className="text-[var(--radar-green)]">{command}</span>
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
