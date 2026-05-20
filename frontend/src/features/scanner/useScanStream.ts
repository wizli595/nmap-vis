import { useState, useCallback } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { ScanResult, Host } from '../../types/scan'

interface ScanStreamState {
  scan: ScanResult | null
  outputLines: string[]
  hosts: Host[]
}

export function useScanStream(scanId: string | null) {
  const [state, setState] = useState<ScanStreamState>({
    scan: null,
    outputLines: [],
    hosts: [],
  })

  const wsUrl = scanId
    ? `ws://${location.host}/ws/scan/${scanId}/stream`
    : null

  const handleMessage = useCallback((data: unknown) => {
    const message = data as Record<string, unknown>

    switch (message.type) {
      case 'snapshot':
        handleSnapshot(message, setState)
        break
      case 'output':
        handleOutput(message, setState)
        break
      case 'host_discovered':
        handleHostDiscovered(message, setState)
        break
      case 'completed':
        handleCompleted(setState)
        break
      case 'failed':
        handleFailed(message, setState)
        break
    }
  }, [])

  const { status } = useWebSocket(wsUrl, { onMessage: handleMessage })

  return { ...state, connectionStatus: status }
}

type SetState = React.Dispatch<React.SetStateAction<ScanStreamState>>

function handleSnapshot(message: Record<string, unknown>, setState: SetState) {
  const scan = message.scan as ScanResult
  const lines = scan.raw_output ? scan.raw_output.split('\n').filter(Boolean) : []
  setState({
    scan,
    outputLines: lines,
    hosts: scan.hosts ?? [],
  })
}

function handleOutput(message: Record<string, unknown>, setState: SetState) {
  const line = message.line as string
  setState((prev) => ({
    ...prev,
    outputLines: [...prev.outputLines, line],
  }))
}

function handleHostDiscovered(message: Record<string, unknown>, setState: SetState) {
  const host = message.host as Host
  setState((prev) => ({
    ...prev,
    hosts: [...prev.hosts, host],
  }))
}

function handleCompleted(setState: SetState) {
  setState((prev) => ({
    ...prev,
    scan: prev.scan ? { ...prev.scan, status: 'completed' } : prev.scan,
  }))
}

function handleFailed(message: Record<string, unknown>, setState: SetState) {
  const error = message.error as string
  setState((prev) => ({
    ...prev,
    scan: prev.scan ? { ...prev.scan, status: 'failed' } : prev.scan,
    outputLines: [...prev.outputLines, `Error: ${error}`],
  }))
}
