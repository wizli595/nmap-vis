import { useState, useEffect } from 'react'
import { getHistoryScan } from '../../api/history'
import { RadarPage } from '../radar/RadarPage'
import { TerminalView } from '../terminal/TerminalView'
import { HostDetail } from '../radar/HostDetail'
import { PortBadge } from '../radar/PortBadge'
import type { ScanResult, Host } from '../../types/scan'

interface Props {
  scanId: string
  onBack: () => void
}

type Tab = 'radar' | 'terminal' | 'results'

export function HistoryDetailView({ scanId, onBack }: Props) {
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('results')
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)

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
          <h2 className="text-lg font-mono text-[var(--radar-green)]">{scan.target}</h2>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton scanId={scanId} target={scan.target} />
          <span className="px-3 py-1 rounded text-xs font-mono uppercase bg-green-500/20 text-green-400">
            {scan.status}
          </span>
        </div>
      </div>

      <div className="bg-black/50 border border-[var(--hud-border)] rounded px-4 py-3 font-mono text-sm overflow-x-auto">
        <span className="text-[var(--radar-amber)]">$ </span>
        <span className="text-[var(--radar-green)]">{display}</span>
      </div>

      <div className="flex gap-4 text-sm font-mono text-[var(--text-dim)]">
        <span>{scan.hosts.length} host{scan.hosts.length !== 1 ? 's' : ''}</span>
        <span>{countPorts(scan.hosts)} open port{countPorts(scan.hosts) !== 1 ? 's' : ''}</span>
        <span>{new Date(scan.started_at).toLocaleString()}</span>
      </div>

      <div className="flex gap-2 border-b border-[var(--hud-border)] pb-2">
        <TabButton label="Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
        <TabButton label="Radar" active={activeTab === 'radar'} onClick={() => setActiveTab('radar')} />
        <TabButton label="Terminal" active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} />
      </div>

      {activeTab === 'results' && (
        <div className="space-y-3">
          {scan.hosts.length === 0 && (
            <span className="text-[var(--text-dim)] font-mono text-sm">No hosts found in this scan.</span>
          )}
          {scan.hosts.map((host) => (
            <HostCard
              key={host.ip}
              host={host}
              isSelected={selectedHost?.ip === host.ip}
              onClick={() => setSelectedHost(selectedHost?.ip === host.ip ? null : host)}
            />
          ))}
          {selectedHost && <HostDetail host={selectedHost} onClose={() => setSelectedHost(null)} />}
        </div>
      )}
      {activeTab === 'radar' && <RadarPage hosts={scan.hosts} isScanning={false} />}
      {activeTab === 'terminal' && <TerminalView lines={outputLines} />}
    </div>
  )
}

function HostCard({ host, isSelected, onClick }: { host: Host; isSelected: boolean; onClick: () => void }) {
  const openPorts = host.ports?.filter((p) => p.state === 'open') ?? []

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[var(--bg-panel)] border rounded-lg p-4 space-y-2 transition-colors ${
        isSelected ? 'border-[var(--radar-green)]' : 'border-[var(--hud-border)] hover:border-[var(--radar-green)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-mono">
          <span className="text-[var(--radar-green)]">{host.ip}</span>
          {host.hostname && (
            <span className="text-[var(--text-dim)] text-sm ml-2">{host.hostname}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
          {host.os && <span>{host.os}</span>}
          <span className="text-[var(--radar-green)]">{host.status}</span>
        </div>
      </div>
      {openPorts.length > 0 && <PortBadge ports={openPorts} />}
    </button>
  )
}

function ExportButton({ scanId, target }: { scanId: string; target: string }) {
  const handleExport = () => {
    const url = `http://localhost:8001/history/${scanId}/export`
    const link = document.createElement('a')
    link.href = url
    link.download = `nmap-vis-${target}-${scanId.slice(0, 8)}.json`
    link.click()
  }

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1 rounded border border-[var(--hud-border)] text-xs font-mono text-[var(--text-dim)] hover:border-[var(--radar-green)] hover:text-[var(--radar-green)] transition-colors uppercase"
    >
      Export JSON
    </button>
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

function countPorts(hosts: Host[]): number {
  return hosts.reduce((sum, h) => sum + (h.ports?.filter((p) => p.state === 'open').length ?? 0), 0)
}
