import { useScanStore } from '../../stores/scanStore'

const TIMING_LABELS = ['Paranoid', 'Sneaky', 'Polite', 'Normal', 'Aggressive', 'Insane']

export function TimingSlider() {
  const timing = useScanStore((s) => s.timing)
  const setTiming = useScanStore((s) => s.setTiming)

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Timing — T{timing} {TIMING_LABELS[timing]}
      </label>
      <input
        type="range"
        min={0}
        max={5}
        value={timing}
        onChange={(e) => setTiming(Number(e.target.value))}
        className="w-full accent-[var(--radar-green)]"
      />
      <div className="flex justify-between text-xs text-[var(--text-dim)]">
        <span>T0 Stealth</span>
        <span>T5 Speed</span>
      </div>
    </div>
  )
}
