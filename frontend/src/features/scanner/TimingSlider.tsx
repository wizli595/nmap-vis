import { useScanStore } from '../../stores/scanStore'

const TIMING_LABELS = ['Paranoid', 'Sneaky', 'Polite', 'Normal', 'Aggressive', 'Insane']

export function TimingSlider() {
  const timing = useScanStore((s) => s.timing)
  const setTiming = useScanStore((s) => s.setTiming)
  const percentage = (timing / 5) * 100

  return (
    <div className="space-y-3">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Timing — T{timing} {TIMING_LABELS[timing]}
      </label>
      <div className="relative h-10 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--hud-border)]">
          <div
            className="h-full rounded-full bg-[var(--radar-green)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={timing}
          onChange={(e) => setTiming(Number(e.target.value))}
          className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--radar-green)] [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--radar-green)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--bg-dark)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--radar-green)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--bg-dark)] [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent"
        />
        <div className="absolute inset-x-0 flex justify-between px-[2px] pointer-events-none">
          {TIMING_LABELS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i <= timing ? 'bg-[var(--radar-green)]' : 'bg-[var(--hud-border)]'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs text-[var(--text-dim)]">
        <span>T0 Stealth</span>
        <span>T5 Speed</span>
      </div>
    </div>
  )
}
