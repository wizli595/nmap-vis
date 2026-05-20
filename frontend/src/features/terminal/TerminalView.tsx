import { useEffect, useRef } from 'react'

interface Props {
  lines: string[]
  autoScroll?: boolean
}

export function TerminalView({ lines, autoScroll = true }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines.length, autoScroll])

  return (
    <div className="bg-black/80 border border-[var(--hud-border)] rounded h-96 overflow-y-auto font-mono text-xs p-4 space-y-0.5">
      {lines.length === 0 && (
        <span className="text-[var(--text-dim)] animate-pulse">
          Waiting for output...
        </span>
      )}
      {lines.map((line, i) => (
        <TerminalLine key={i} index={i} text={line} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function TerminalLine({ index, text }: { index: number; text: string }) {
  const color = lineColor(text)

  return (
    <div className="flex gap-3 leading-5">
      <span className="text-[var(--text-dim)] select-none w-8 text-right shrink-0">
        {index + 1}
      </span>
      <span className={color}>{text}</span>
    </div>
  )
}

function lineColor(text: string): string {
  if (text.startsWith('Nmap scan report') || text.includes('Host is up')) {
    return 'text-[var(--radar-green)]'
  }
  if (text.includes('open')) return 'text-[var(--radar-green)]'
  if (text.includes('filtered')) return 'text-[var(--radar-amber)]'
  if (text.includes('closed')) return 'text-[var(--text-dim)]'
  if (text.startsWith('Error') || text.startsWith('WARNING')) return 'text-red-400'
  return 'text-[var(--text-primary)]'
}
