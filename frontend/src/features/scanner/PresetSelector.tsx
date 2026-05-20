import { PRESETS, type Preset } from '../../data/presets'
import { useScanStore } from '../../stores/scanStore'

export function PresetSelector() {
  const store = useScanStore()

  const applyPreset = (preset: Preset) => {
    store.reset()
    store.setScanType(preset.scanType)
    store.setTiming(preset.timing)

    for (const [key, value] of Object.entries(preset.flags)) {
      store.setFlagValue(key, value)
    }

    for (const script of preset.scripts) {
      store.addScript(script)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Presets
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="text-left px-4 py-3 rounded border border-[var(--hud-border)] bg-[var(--bg-panel)] hover:border-[var(--radar-green)] hover:bg-[var(--radar-green-dim)] transition-colors"
          >
            <div className="font-mono text-sm text-[var(--radar-green)]">{preset.name}</div>
            <div className="text-xs text-[var(--text-dim)] mt-1">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
