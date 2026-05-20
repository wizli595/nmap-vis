import type { Port } from '../../types/scan'

interface Props {
  ports: Port[]
}

const STATE_COLORS: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400 border-green-500/30',
  filtered: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  closed: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function PortBadge({ ports }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ports.map((port) => (
        <span
          key={`${port.protocol}/${port.number}`}
          className={`px-2 py-0.5 rounded border text-xs font-mono ${STATE_COLORS[port.state] ?? STATE_COLORS.closed}`}
        >
          {port.number}/{port.protocol}
          {port.service && ` ${port.service}`}
        </span>
      ))}
    </div>
  )
}
