import type { Host } from '../../types/scan'

interface Props {
  host: Host
  x: number
  y: number
  selected: boolean
  onSelect: (host: Host) => void
}

const STATUS_COLORS: Record<string, string> = {
  up: '#00ff41',
  down: '#ff4141',
}

export function HostNode({ host, x, y, selected, onSelect }: Props) {
  const openPorts = host.ports?.filter((p) => p.state === 'open').length ?? 0
  const radius = 8 + Math.min(openPorts, 20) * 1.5
  const color = STATUS_COLORS[host.status] ?? '#4a7a4a'

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onSelect(host)}
      className="cursor-pointer"
    >
      <circle
        r={radius + 4}
        fill={color}
        opacity={selected ? 0.2 : 0.08}
      />
      <circle
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 2 : 1}
        opacity={0.8}
      />
      <circle
        r={3}
        fill={color}
      />
      <text
        y={radius + 14}
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontFamily="monospace"
        opacity={0.8}
      >
        {host.ip}
      </text>
      {host.hostname && (
        <text
          y={radius + 26}
          textAnchor="middle"
          fill={color}
          fontSize={8}
          fontFamily="monospace"
          opacity={0.5}
        >
          {host.hostname}
        </text>
      )}
      {openPorts > 0 && (
        <text
          y={-radius - 6}
          textAnchor="middle"
          fill="#ffb000"
          fontSize={9}
          fontFamily="monospace"
        >
          {openPorts} port{openPorts !== 1 ? 's' : ''}
        </text>
      )}
    </g>
  )
}
