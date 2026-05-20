import { useEffect, useRef } from 'react'
import type { Host } from '../../types/scan'

interface Props {
  hosts: Host[]
  isScanning: boolean
}

const RADAR_GREEN = '#00ff41'
const RADAR_GREEN_DIM = 'rgba(0, 255, 65, 0.15)'
const RADAR_AMBER = '#ffb000'
const BG_DARK = '#0a0f0a'
const GRID_COLOR = 'rgba(0, 255, 65, 0.08)'
const RING_COLOR = 'rgba(0, 255, 65, 0.12)'

export function RadarSweep({ hosts, isScanning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const blipsRef = useRef<BlipState[]>([])

  useEffect(() => {
    syncBlips(blipsRef, hosts)
  }, [hosts])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const render = () => {
      const size = resizeCanvas(canvas)
      const center = size / 2
      const radius = center - 20

      ctx.clearRect(0, 0, size, size)
      drawBackground(ctx, size)
      drawGrid(ctx, size)
      drawRangeRings(ctx, center, radius)
      drawCrosshair(ctx, center, radius)

      if (isScanning) {
        drawSweepBeam(ctx, center, radius, angleRef.current)
        drawSweepTrail(ctx, center, radius, angleRef.current)
        angleRef.current = (angleRef.current + 0.015) % (Math.PI * 2)
      }

      drawBlips(ctx, center, radius, blipsRef.current)
      drawHUD(ctx, size, hosts.length, isScanning)

      animationId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationId)
  }, [isScanning, hosts.length])

  return (
    <canvas
      ref={canvasRef}
      className="w-full aspect-square max-h-[600px] rounded-lg border border-[var(--hud-border)]"
    />
  )
}

interface BlipState {
  ip: string
  angle: number
  distance: number
  portCount: number
  opacity: number
  pulsePhase: number
}

function syncBlips(ref: React.MutableRefObject<BlipState[]>, hosts: Host[]) {
  const existing = new Set(ref.current.map((b) => b.ip))

  for (const host of hosts) {
    if (existing.has(host.ip)) continue
    ref.current.push({
      ip: host.ip,
      angle: hashToAngle(host.ip),
      distance: 0.3 + hashToDistance(host.ip) * 0.6,
      portCount: host.ports?.length ?? 0,
      opacity: 1,
      pulsePhase: Math.random() * Math.PI * 2,
    })
  }
}

function resizeCanvas(canvas: HTMLCanvasElement): number {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const size = Math.min(rect.width, rect.height)
  canvas.width = size * dpr
  canvas.height = size * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  return size
}

function drawBackground(ctx: CanvasRenderingContext2D, size: number) {
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  )
  gradient.addColorStop(0, '#0d1a0d')
  gradient.addColorStop(1, BG_DARK)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number) {
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 0.5
  const step = size / 12

  for (let i = step; i < size; i += step) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(size, i)
    ctx.stroke()
  }
}

function drawRangeRings(ctx: CanvasRenderingContext2D, center: number, radius: number) {
  ctx.strokeStyle = RING_COLOR
  ctx.lineWidth = 1

  for (let i = 1; i <= 4; i++) {
    const r = (radius / 4) * i
    ctx.beginPath()
    ctx.arc(center, center, r, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawCrosshair(ctx: CanvasRenderingContext2D, center: number, radius: number) {
  ctx.strokeStyle = RING_COLOR
  ctx.lineWidth = 0.5

  ctx.beginPath()
  ctx.moveTo(center - radius, center)
  ctx.lineTo(center + radius, center)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(center, center - radius)
  ctx.lineTo(center, center + radius)
  ctx.stroke()
}

function drawSweepBeam(
  ctx: CanvasRenderingContext2D,
  center: number, radius: number, angle: number
) {
  ctx.strokeStyle = RADAR_GREEN
  ctx.lineWidth = 2
  ctx.shadowColor = RADAR_GREEN
  ctx.shadowBlur = 10

  ctx.beginPath()
  ctx.moveTo(center, center)
  ctx.lineTo(
    center + Math.cos(angle) * radius,
    center + Math.sin(angle) * radius
  )
  ctx.stroke()
  ctx.shadowBlur = 0
}

function drawSweepTrail(
  ctx: CanvasRenderingContext2D,
  center: number, radius: number, angle: number
) {
  const gradient = ctx.createConicGradient(angle - 0.5, center, center)
  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(0.08, RADAR_GREEN_DIM)
  gradient.addColorStop(0.15, 'transparent')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawBlips(
  ctx: CanvasRenderingContext2D,
  center: number, radius: number,
  blips: BlipState[]
) {
  const now = Date.now() / 1000

  for (const blip of blips) {
    const x = center + Math.cos(blip.angle) * blip.distance * radius
    const y = center + Math.sin(blip.angle) * blip.distance * radius
    const pulse = 0.7 + 0.3 * Math.sin(now * 2 + blip.pulsePhase)
    const size = 3 + Math.min(blip.portCount, 10) * 0.5

    ctx.shadowColor = RADAR_GREEN
    ctx.shadowBlur = 8

    ctx.fillStyle = blip.portCount > 5 ? RADAR_AMBER : RADAR_GREEN
    ctx.globalAlpha = blip.opacity * pulse
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = blip.opacity * 0.3
    ctx.beginPath()
    ctx.arc(x, y, size + 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  size: number, hostCount: number, isScanning: boolean
) {
  ctx.font = '11px monospace'
  ctx.fillStyle = RADAR_GREEN
  ctx.globalAlpha = 0.6

  ctx.fillText(`HOSTS: ${hostCount}`, 12, 20)
  ctx.fillText(isScanning ? 'SCANNING' : 'COMPLETE', 12, 36)

  const time = new Date().toLocaleTimeString('en-US', { hour12: false })
  ctx.textAlign = 'right'
  ctx.fillText(time, size - 12, 20)
  ctx.textAlign = 'left'

  ctx.globalAlpha = 1
}

function hashToAngle(ip: string): number {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0
  }
  return ((hash & 0xffff) / 0xffff) * Math.PI * 2
}

function hashToDistance(ip: string): number {
  let hash = 0
  for (let i = ip.length - 1; i >= 0; i--) {
    hash = ((hash << 3) - hash + ip.charCodeAt(i)) | 0
  }
  return (hash & 0xffff) / 0xffff
}
