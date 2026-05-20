import type { ScanSummary } from '../../api/history'

interface Props {
  scan: ScanSummary
  onClick: () => void
}

export function ScanCard({ scan, onClick }: Props) {
  const time = formatTime(scan.started_at)
  const duration = formatDuration(scan.started_at, scan.finished_at)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[var(--bg-panel)] border border-[var(--hud-border)] rounded-lg p-4 hover:border-[var(--radar-green)] transition-colors space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[var(--radar-green)]">{scan.target}</span>
        <StatusDot status={scan.status} />
      </div>

      <div className="font-mono text-xs text-[var(--text-dim)] truncate">
        $ {scan.command.replace(/ -oX \S+/g, '').replace(/ -v(?=\s|$)/, '')}
      </div>

      <div className="flex gap-4 text-xs font-mono text-[var(--text-dim)]">
        <span>{scan.host_count} host{scan.host_count !== 1 ? 's' : ''}</span>
        <span>{scan.port_count} port{scan.port_count !== 1 ? 's' : ''}</span>
        <span>{time}</span>
        {duration && <span>{duration}</span>}
      </div>
    </button>
  )
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'completed'
    ? 'bg-green-400'
    : status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'

  return <div className={`w-2 h-2 rounded-full ${color}`} />
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return ''
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}
