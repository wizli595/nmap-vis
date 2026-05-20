import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { Host } from '../../types/scan'
import { HostNode } from './HostNode'
import { HostDetail } from './HostDetail'

interface Props {
  hosts: Host[]
}

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string
  host: Host
}

export function NetworkMap({ hosts }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null)
  const [nodes, setNodes] = useState<NodeDatum[]>([])
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)
  const [transform, setTransform] = useState(d3.zoomIdentity)

  useEffect(() => {
    const newNodes = hosts.map((host) => createNode(host, simulationRef.current))
    const simulation = createSimulation(newNodes, svgRef.current)
    simulationRef.current = simulation

    simulation.on('tick', () => {
      setNodes([...simulation.nodes()])
    })

    return () => { simulation.stop() }
  }, [hosts])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => setTransform(event.transform))

    d3.select(svg).call(zoom)
  }, [])

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        className="w-full h-[500px] bg-[var(--bg-dark)] border border-[var(--hud-border)] rounded-lg"
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {nodes.map((node) => (
            <HostNode
              key={node.id}
              host={node.host}
              x={node.x ?? 0}
              y={node.y ?? 0}
              selected={selectedHost?.ip === node.host.ip}
              onSelect={setSelectedHost}
            />
          ))}
        </g>
      </svg>
      <HostDetail host={selectedHost} onClose={() => setSelectedHost(null)} />
    </div>
  )
}

function createNode(host: Host, sim: d3.Simulation<NodeDatum, undefined> | null): NodeDatum {
  const existing = sim?.nodes().find((n) => n.id === host.ip)
  if (existing) {
    existing.host = host
    return existing
  }
  return { id: host.ip, host }
}

function createSimulation(
  nodes: NodeDatum[],
  svg: SVGSVGElement | null
): d3.Simulation<NodeDatum, undefined> {
  const width = svg?.clientWidth ?? 800
  const height = svg?.clientHeight ?? 500

  return d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40))
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .alphaDecay(0.02)
}
