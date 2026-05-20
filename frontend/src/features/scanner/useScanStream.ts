import { useState, useEffect, useCallback, useRef } from 'react'
import { getScan } from '../../api/scan'
import type { ScanResult, Host } from '../../types/scan'

const WS_BASE = `ws://localhost:8001`

interface ScanStreamState {
  scan: ScanResult | null
  outputLines: string[]
  hosts: Host[]
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

export function useScanStream(scanId: string | null) {
  const [state, setState] = useState<ScanStreamState>({
    scan: null,
    outputLines: [],
    hosts: [],
    connectionStatus: 'disconnected',
  })

  const wsRef = useRef<WebSocket | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = JSON.parse(event.data)

    switch (message.type) {
      case 'snapshot':
        applySnapshot(message, setState)
        break
      case 'output':
        setState((prev) => ({
          ...prev,
          outputLines: [...prev.outputLines, message.line],
        }))
        break
      case 'host_discovered': {
        const host = message.host as Host
        setState((prev) => {
          const exists = prev.hosts.findIndex((h) => h.ip === host.ip)
          const hosts = exists >= 0
            ? prev.hosts.map((h) => h.ip === host.ip ? host : h)
            : [...prev.hosts, host]
          return { ...prev, hosts }
        })
        break
      }
      case 'completed':
        setState((prev) => ({
          ...prev,
          scan: prev.scan ? { ...prev.scan, status: 'completed' } : prev.scan,
        }))
        break
      case 'failed':
        setState((prev) => ({
          ...prev,
          scan: prev.scan ? { ...prev.scan, status: 'failed' } : prev.scan,
          outputLines: [...prev.outputLines, `Error: ${message.error}`],
        }))
        break
    }
  }, [])

  useEffect(() => {
    if (!scanId) return

    let cancelled = false

    const connect = () => {
      if (cancelled) return

      setState((prev) => ({ ...prev, connectionStatus: 'connecting' }))

      const ws = new WebSocket(`${WS_BASE}/scan/${scanId}/stream`)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) { ws.close(); return }
        setState((prev) => ({ ...prev, connectionStatus: 'connected' }))
        stopPolling()
      }

      ws.onmessage = handleMessage

      ws.onclose = () => {
        if (cancelled) return
        setState((prev) => ({ ...prev, connectionStatus: 'disconnected' }))
        wsRef.current = null
        startPolling(scanId, setState)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    const startPolling = (id: string, set: typeof setState) => {
      if (pollRef.current) return

      pollRef.current = setInterval(async () => {
        try {
          const scan = await getScan(id)
          if (!scan) return

          const lines = scan.raw_output ? scan.raw_output.split('\n').filter(Boolean) : []
          set({
            scan,
            outputLines: lines,
            hosts: scan.hosts ?? [],
            connectionStatus: 'disconnected',
          })

          if (scan.status === 'completed' || scan.status === 'failed') {
            stopPolling()
          }
        } catch { /* ignore poll errors */ }
      }, 2000)
    }

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    connect()

    return () => {
      cancelled = true
      wsRef.current?.close()
      wsRef.current = null
      stopPolling()
    }
  }, [scanId, handleMessage])

  return state
}

function applySnapshot(
  message: Record<string, unknown>,
  setState: React.Dispatch<React.SetStateAction<ScanStreamState>>
) {
  const scan = message.scan as ScanResult
  const lines = scan.raw_output ? scan.raw_output.split('\n').filter(Boolean) : []
  setState((prev) => ({
    ...prev,
    scan,
    outputLines: lines,
    hosts: scan.hosts ?? [],
  }))
}
