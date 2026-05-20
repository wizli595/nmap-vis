import { useState } from 'react'
import type { Host } from '../../types/scan'
import { RadarSweep } from './RadarSweep'
import { NetworkMap } from './NetworkMap'

interface Props {
  hosts: Host[]
  isScanning: boolean
}

type ViewMode = 'radar' | 'map'

export function RadarPage({ hosts, isScanning }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('radar')
  const showMap = viewMode === 'map' || (!isScanning && hosts.length > 0)

  return (
    <div className="space-y-3">
      <ViewToggle
        mode={showMap ? 'map' : 'radar'}
        onChange={setViewMode}
        isScanning={isScanning}
      />
      {showMap
        ? <NetworkMap hosts={hosts} />
        : <RadarSweep hosts={hosts} isScanning={isScanning} />
      }
    </div>
  )
}

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  isScanning: boolean
}

function ViewToggle({ mode, onChange, isScanning }: ViewToggleProps) {
  return (
    <div className="flex gap-2">
      <ToggleButton
        label="Radar"
        active={mode === 'radar'}
        onClick={() => onChange('radar')}
      />
      <ToggleButton
        label="Network Map"
        active={mode === 'map'}
        onClick={() => onChange('map')}
      />
      {isScanning && (
        <span className="ml-auto text-xs font-mono text-[var(--text-dim)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--radar-green)] animate-pulse" />
          Live
        </span>
      )}
    </div>
  )
}

interface ToggleButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

function ToggleButton({ label, active, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
        active
          ? 'bg-[var(--radar-green-dim)] text-[var(--radar-green)] border border-[var(--radar-green)]'
          : 'text-[var(--text-dim)] border border-[var(--hud-border)] hover:border-[var(--text-dim)]'
      }`}
    >
      {label}
    </button>
  )
}
