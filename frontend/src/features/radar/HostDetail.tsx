import type { Host } from '../../types/scan'
import { PortBadge } from './PortBadge'

interface Props {
  host: Host | null
  onClose: () => void
}

export function HostDetail({ host, onClose }: Props) {
  if (!host) return null

  const openPorts = host.ports?.filter((p) => p.state === 'open') ?? []
  const filteredPorts = host.ports?.filter((p) => p.state === 'filtered') ?? []

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--hud-border)] rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-mono">
          <span className="text-[var(--radar-green)] text-lg">{host.ip}</span>
          {host.hostname && (
            <span className="text-[var(--text-dim)] text-sm ml-2">{host.hostname}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-dim)] hover:text-[var(--radar-green)] font-mono"
        >
          x
        </button>
      </div>

      <div className="flex gap-4 text-xs font-mono text-[var(--text-dim)]">
        <span>Status: <span className="text-[var(--radar-green)]">{host.status}</span></span>
        {host.os && <span>OS: <span className="text-[var(--text-primary)]">{host.os}</span></span>}
      </div>

      {openPorts.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-[var(--text-dim)] uppercase">Open Ports</span>
          <PortBadge ports={openPorts} />
        </div>
      )}

      {filteredPorts.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-[var(--text-dim)] uppercase">Filtered</span>
          <PortBadge ports={filteredPorts} />
        </div>
      )}
    </div>
  )
}
