import { useScanStore } from '../../stores/scanStore'

export function TargetInput() {
  const target = useScanStore((s) => s.target)
  const setTarget = useScanStore((s) => s.setTarget)

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Target
      </label>
      <input
        type="text"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="192.168.1.0/24 or scanme.nmap.org"
        className="w-full bg-[var(--bg-panel)] border border-[var(--hud-border)] rounded px-4 py-3 text-[var(--radar-green)] placeholder-[var(--text-dim)] focus:border-[var(--radar-green)] focus:outline-none font-mono"
      />
    </div>
  )
}
