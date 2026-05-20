import { useState, useEffect } from 'react'
import { listScripts, type NseScript } from '../../api/scripts'
import { useScanStore } from '../../stores/scanStore'

export function ScriptSelector() {
  const [scripts, setScripts] = useState<NseScript[]>([])
  const [search, setSearch] = useState('')
  const selected = useScanStore((s) => s.scripts)
  const addScript = useScanStore((s) => s.addScript)
  const removeScript = useScanStore((s) => s.removeScript)

  useEffect(() => {
    listScripts().then(setScripts).catch(() => {})
  }, [])

  const filtered = scripts.filter((s) =>
    s.name.includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <label className="block text-sm text-[var(--text-dim)] uppercase tracking-widest">
        NSE Scripts
      </label>

      {selected.length > 0 && <SelectedScripts scripts={selected} onRemove={removeScript} />}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search scripts..."
        className="w-full bg-[var(--bg-panel)] border border-[var(--hud-border)] rounded px-3 py-2 text-sm text-[var(--radar-green)] placeholder-[var(--text-dim)] focus:border-[var(--radar-green)] focus:outline-none font-mono"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {filtered.map((script) => (
          <ScriptOption
            key={script.name}
            script={script}
            isSelected={selected.includes(script.name)}
            onToggle={() =>
              selected.includes(script.name)
                ? removeScript(script.name)
                : addScript(script.name)
            }
          />
        ))}
      </div>
    </div>
  )
}

function SelectedScripts({ scripts, onRemove }: { scripts: string[]; onRemove: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {scripts.map((name) => (
        <span
          key={name}
          className="px-3 py-1 rounded bg-[var(--radar-green-dim)] border border-[var(--radar-green)] text-[var(--radar-green)] text-xs font-mono flex items-center gap-2"
        >
          {name}
          <button onClick={() => onRemove(name)} className="hover:text-white">x</button>
        </span>
      ))}
    </div>
  )
}

interface ScriptOptionProps {
  script: NseScript
  isSelected: boolean
  onToggle: () => void
}

function ScriptOption({ script, isSelected, onToggle }: ScriptOptionProps) {
  return (
    <button
      onClick={onToggle}
      className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
        isSelected
          ? 'border-[var(--radar-green)] bg-[var(--radar-green-dim)] text-[var(--radar-green)]'
          : 'border-[var(--hud-border)] bg-[var(--bg-panel)] text-[var(--text-dim)] hover:border-[var(--text-dim)]'
      }`}
    >
      <div className="font-mono">{script.name}</div>
      <div className="text-xs opacity-70 mt-0.5">{script.description}</div>
    </button>
  )
}
