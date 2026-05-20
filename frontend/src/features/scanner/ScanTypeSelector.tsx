import { SCAN_TYPES } from '../../data/flags'
import { useScanStore } from '../../stores/scanStore'

export function ScanTypeSelector() {
  const scanType = useScanStore((s) => s.scanType)
  const setScanType = useScanStore((s) => s.setScanType)

  const options = SCAN_TYPES[0].options ?? []

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Scan Type
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setScanType(option.value)}
            className={`text-left px-4 py-3 rounded border font-mono text-sm transition-colors ${
              scanType === option.value
                ? 'border-[var(--radar-green)] bg-[var(--radar-green-dim)] text-[var(--radar-green)]'
                : 'border-[var(--hud-border)] bg-[var(--bg-panel)] text-[var(--text-dim)] hover:border-[var(--text-dim)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
