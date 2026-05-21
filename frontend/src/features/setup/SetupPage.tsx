import { useState, useEffect, useRef } from 'react'
import { getSetupStatus, checkNmap, buildDockerImage, type SetupStatus, type NmapCheck } from '../../api/setup'

interface Props {
  onReady: (mode: 'docker' | 'local') => void
}

type Selected = 'none' | 'docker' | 'local'

export function SetupPage({ onReady }: Props) {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [checking, setChecking] = useState(true)
  const [selected, setSelected] = useState<Selected>('none')

  useEffect(() => {
    getSetupStatus().then((s) => {
      setStatus(s)
      setChecking(false)
      if (s.docker_ready) onReady('docker')
      else if (s.nmap_local) onReady('local')
    }).catch(() => setChecking(false))
  }, [onReady])

  if (checking) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <Header />
        <div className={`grid gap-4 transition-all duration-500 ${
          selected === 'none' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}>
          {(selected === 'none' || selected === 'docker') && (
            <DockerOption
              dockerInstalled={status?.docker_installed ?? false}
              imageReady={status?.docker_ready ?? false}
              expanded={selected === 'docker'}
              onSelect={() => setSelected(selected === 'docker' ? 'none' : 'docker')}
              onReady={() => onReady('docker')}
            />
          )}
          {(selected === 'none' || selected === 'local') && (
            <LocalOption
              os={status?.os ?? { system: 'unknown', release: '', machine: '' }}
              expanded={selected === 'local'}
              onSelect={() => setSelected(selected === 'local' ? 'none' : 'local')}
              onReady={() => onReady('local')}
            />
          )}
        </div>
        {selected !== 'none' && (
          <button
            onClick={() => setSelected('none')}
            className="block mx-auto text-[var(--text-dim)] hover:text-[var(--radar-green)] font-mono text-xs transition-colors"
          >
            &lt; Back to options
          </button>
        )}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="text-center space-y-3">
      <div className="flex items-center justify-center gap-3">
        <div className="w-3 h-3 rounded-full bg-[var(--radar-green)] animate-pulse" />
        <h1 className="text-3xl font-bold tracking-wider uppercase text-[var(--radar-green)]">
          nmap-vis
        </h1>
      </div>
      <p className="text-[var(--text-dim)] font-mono text-sm">
        Choose how to run nmap
      </p>
    </div>
  )
}

function DockerOption({ dockerInstalled, imageReady, expanded, onSelect, onReady }: {
  dockerInstalled: boolean
  imageReady: boolean
  expanded: boolean
  onSelect: () => void
  onReady: () => void
}) {
  const [building, setBuilding] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [buildDone, setBuildDone] = useState(imageReady)
  const [error, setError] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  const handleBuild = async () => {
    setBuilding(true)
    setLogs([])
    setError(false)

    await buildDockerImage(
      (line) => setLogs((prev) => [...prev, line]),
      (success) => {
        setBuilding(false)
        if (success) {
          setBuildDone(true)
          setLogs((prev) => [...prev, '--- Image built successfully ---'])
        } else {
          setError(true)
          setLogs((prev) => [...prev, '--- Build failed ---'])
        }
      }
    )
  }

  return (
    <div
      onClick={!expanded ? onSelect : undefined}
      className={`border rounded-lg p-5 bg-[var(--bg-panel)] space-y-4 transition-all duration-300 ${
        expanded
          ? 'border-[var(--radar-green)] max-w-2xl mx-auto w-full'
          : 'border-[var(--hud-border)] cursor-pointer hover:border-[var(--radar-green)] hover:scale-[1.02]'
      }`}
    >
      <div className="flex items-center gap-3">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" alt="Docker" className="w-8 h-8" />
        <div>
          <h2 className="font-mono text-[var(--radar-green)] text-lg">Docker Mode</h2>
          <p className="text-xs text-[var(--text-dim)]">No local install needed</p>
        </div>
      </div>

      <p className="text-sm text-[var(--text-dim)] font-mono">
        Runs nmap inside a Kali Linux container. Works out of the box.
      </p>

      <div className="text-xs font-mono px-3 py-2 rounded bg-[var(--radar-amber)]/10 border border-[var(--radar-amber)]/30 text-[var(--radar-amber)]">
        Limited: can't do full LAN discovery (no ARP/ICMP through Docker NAT)
      </div>

      {expanded && (
        <>
          {!dockerInstalled && (
            <div className="text-xs font-mono text-red-400">
              Docker not found. Install Docker Desktop first.
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-black/60 rounded p-3 h-56 overflow-y-auto font-mono text-xs text-[var(--text-primary)] space-y-0.5">
              {logs.map((line, i) => (
                <div key={i} className="text-[var(--text-dim)]">{line}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}

          {building && logs.length === 0 && <Spinner text="Starting build..." />}

          {buildDone ? (
            <button
              onClick={(e) => { e.stopPropagation(); onReady() }}
              className="w-full py-3 rounded border border-[var(--radar-green)] bg-[var(--radar-green-dim)] text-[var(--radar-green)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--radar-green)] hover:text-black transition-colors"
            >
              Start with Docker
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleBuild() }}
              disabled={!dockerInstalled || building}
              className="w-full py-3 rounded border border-[var(--radar-green)] bg-[var(--bg-panel)] text-[var(--radar-green)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--radar-green-dim)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {building ? 'Building...' : 'Build Nmap Image'}
            </button>
          )}

          {error && (
            <p className="text-xs font-mono text-red-400">Build failed. Check Docker Desktop is running.</p>
          )}
        </>
      )}
    </div>
  )
}

function LocalOption({ os, expanded, onSelect, onReady }: {
  os: { system: string; release: string; machine: string }
  expanded: boolean
  onSelect: () => void
  onReady: () => void
}) {
  const [nmapInfo, setNmapInfo] = useState<NmapCheck | null>(null)
  const [checking, setChecking] = useState(false)

  const handleCheck = async () => {
    setChecking(true)
    const info = await checkNmap()
    setNmapInfo(info)
    setChecking(false)
  }

  useEffect(() => {
    if (expanded && !nmapInfo) {
      checkNmap().then((info) => {
        setNmapInfo(info)
        setChecking(false)
      })
    }
  }, [expanded, nmapInfo])

  return (
    <div
      onClick={!expanded ? onSelect : undefined}
      className={`border rounded-lg p-5 bg-[var(--bg-panel)] space-y-4 transition-all duration-300 ${
        expanded
          ? 'border-[var(--radar-green)] max-w-2xl mx-auto w-full'
          : 'border-[var(--hud-border)] cursor-pointer hover:border-[var(--radar-green)] hover:scale-[1.02]'
      }`}
    >
      <div className="flex items-center gap-3">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" alt="Local" className="w-8 h-8" />
        <div>
          <h2 className="font-mono text-[var(--radar-green)] text-lg">Local Mode</h2>
          <p className="text-xs text-[var(--text-dim)]">
            {os.system} {os.release} ({os.machine})
          </p>
        </div>
      </div>

      <p className="text-sm text-[var(--text-dim)] font-mono">
        Uses nmap installed on your machine. Full network access — ARP, ICMP, everything.
      </p>

      <div className="text-xs font-mono px-3 py-2 rounded bg-green-500/10 border border-green-500/30 text-green-400">
        Full power: complete LAN discovery, all scan types, no limitations
      </div>

      {expanded && (
        <>
          {checking && <Spinner text="Checking for nmap..." />}

          {nmapInfo?.installed && (
            <div className="space-y-3">
              <div className="font-mono text-xs text-[var(--radar-green)] bg-black/40 rounded p-3">
                <div>Found: {nmapInfo.path}</div>
                <div>{nmapInfo.version}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onReady() }}
                className="w-full py-3 rounded border border-[var(--radar-green)] bg-[var(--radar-green-dim)] text-[var(--radar-green)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--radar-green)] hover:text-black transition-colors"
              >
                Start with Local Nmap
              </button>
            </div>
          )}

          {nmapInfo && !nmapInfo.installed && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-[var(--radar-amber)]">
                Nmap not found. Install it:
              </div>
              <div className="bg-black/60 rounded p-3 font-mono text-xs text-[var(--radar-green)]">
                <div className="text-[var(--text-dim)] mb-1">$ {nmapInfo.install_instructions?.command}</div>
                {nmapInfo.install_instructions?.alt_method && (
                  <div className="text-[var(--text-dim)] mt-2">
                    Or: {nmapInfo.install_instructions.alt_method}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleCheck() }}
                className="w-full py-2 rounded border border-[var(--hud-border)] text-[var(--text-dim)] font-mono text-xs uppercase hover:border-[var(--radar-green)] hover:text-[var(--radar-green)] transition-colors"
              >
                Check Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-4 h-4 border-2 border-[var(--radar-green)] border-t-transparent rounded-full animate-spin" />
      <span className="text-[var(--text-dim)] font-mono text-sm">{text}</span>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[var(--radar-green)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[var(--text-dim)] font-mono text-sm">
          Checking system...
        </p>
      </div>
    </div>
  )
}
