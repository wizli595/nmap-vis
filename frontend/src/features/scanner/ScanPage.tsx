import { useState } from 'react'
import { TargetInput } from './TargetInput'
import { ScanTypeSelector } from './ScanTypeSelector'
import { TimingSlider } from './TimingSlider'
import { FlagPicker } from './FlagPicker'
import { CommandPreview } from './CommandPreview'
import { useScanStore } from '../../stores/scanStore'
import { startScan } from '../../api/scan'

export function ScanPage() {
  const [status, setStatus] = useState<'idle' | 'launching' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const store = useScanStore()

  const handleLaunch = async () => {
    if (!store.target) return

    setStatus('launching')
    setErrorMessage('')

    try {
      const flags = buildFlagList(store.flagValues)
      await startScan({
        target: store.target,
        scan_type: store.scanType,
        flags,
        ports: extractPort(store.flagValues),
        scripts: store.scripts,
        timing: store.timing,
      })
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Scan failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <TargetInput />
      <ScanTypeSelector />
      <TimingSlider />
      <FlagPicker />
      <CommandPreview />
      <LaunchButton
        disabled={!store.target || status === 'launching'}
        loading={status === 'launching'}
        onClick={handleLaunch}
      />
      {status === 'error' && <ErrorBanner message={errorMessage} />}
    </div>
  )
}

interface LaunchButtonProps {
  disabled: boolean
  loading: boolean
  onClick: () => void
}

function LaunchButton({ disabled, loading, onClick }: LaunchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded border border-[var(--radar-green)] bg-[var(--radar-green-dim)] text-[var(--radar-green)] font-mono text-lg uppercase tracking-widest hover:bg-[var(--radar-green)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {loading ? 'Launching scan...' : 'Launch scan'}
    </button>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="border border-red-500/50 bg-red-500/10 text-red-400 rounded px-4 py-3 text-sm font-mono">
      {message}
    </div>
  )
}

function buildFlagList(flagValues: Record<string, string | boolean | number>): string[] {
  return Object.entries(flagValues)
    .filter(([key, val]) => {
      if (key === 'portRange' || key === 'topPorts') return false
      return typeof val === 'boolean' ? val : Boolean(val)
    })
    .map(([_, val]) => String(val))
}

function extractPort(flagValues: Record<string, string | boolean | number>): string {
  return String(flagValues['portRange'] || '')
}
