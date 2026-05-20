import { useScanStore } from '../../stores/scanStore'
import { ALL_FLAG_GROUPS, TIMING } from '../../data/flags'

export function CommandPreview() {
  const command = useCommandString()

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Command Preview
      </label>
      <div className="bg-black/50 border border-[var(--hud-border)] rounded px-4 py-3 font-mono text-sm text-[var(--radar-green)] overflow-x-auto">
        <span className="text-[var(--radar-amber)]">$ </span>
        {command || 'nmap ...'}
      </div>
    </div>
  )
}

function useCommandString(): string {
  const { target, scanType, timing, flagValues, scripts } = useScanStore()

  const parts = ['nmap', scanType]

  parts.push(TIMING.toFlag(timing) as string)

  for (const group of ALL_FLAG_GROUPS) {
    for (const flag of group.flags) {
      const value = flagValues[flag.id]
      if (!value) continue

      const result = flag.toFlag(value)
      if (result) parts.push(result)
    }
  }

  for (const script of scripts) {
    parts.push(`--script=${script}`)
  }

  if (target) parts.push(target)

  return parts.filter(Boolean).join(' ')
}
