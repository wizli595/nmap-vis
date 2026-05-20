import type { FlagDefinition } from '../../data/flags'
import { useScanStore } from '../../stores/scanStore'

interface Props {
  flag: FlagDefinition
}

export function FlagToggle({ flag }: Props) {
  const value = useScanStore((s) => s.flagValues[flag.id])
  const setFlagValue = useScanStore((s) => s.setFlagValue)

  if (flag.type === 'toggle') {
    return <ToggleControl flag={flag} checked={!!value} onChange={setFlagValue} />
  }

  return <TextControl flag={flag} value={String(value || '')} onChange={setFlagValue} />
}

interface ToggleProps {
  flag: FlagDefinition
  checked: boolean
  onChange: (id: string, value: boolean) => void
}

function ToggleControl({ flag, checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(flag.id, !checked)}
      className={`flex items-center gap-3 px-4 py-3 rounded border text-left text-sm transition-colors ${
        checked
          ? 'border-[var(--radar-green)] bg-[var(--radar-green-dim)] text-[var(--radar-green)]'
          : 'border-[var(--hud-border)] bg-[var(--bg-panel)] text-[var(--text-dim)] hover:border-[var(--text-dim)]'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${checked ? 'bg-[var(--radar-green)]' : 'bg-[var(--text-dim)]'}`} />
      <div>
        <div className="font-mono">{flag.name}</div>
        <div className="text-xs opacity-70">{flag.description}</div>
      </div>
    </button>
  )
}

interface TextProps {
  flag: FlagDefinition
  value: string
  onChange: (id: string, value: string) => void
}

function TextControl({ flag, value, onChange }: TextProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-[var(--text-dim)] font-mono">{flag.name}</label>
      <p className="text-xs text-[var(--text-dim)] opacity-70">{flag.description}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(flag.id, e.target.value)}
        placeholder={flag.valueHint}
        className="w-full bg-[var(--bg-panel)] border border-[var(--hud-border)] rounded px-3 py-2 text-sm text-[var(--radar-green)] placeholder-[var(--text-dim)] focus:border-[var(--radar-green)] focus:outline-none font-mono"
      />
    </div>
  )
}
