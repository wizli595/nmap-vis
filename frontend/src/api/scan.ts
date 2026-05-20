import { fetchApi } from './client'
import type { ScanResult } from '../types/scan'

interface StartScanPayload {
  target: string
  scan_type: string
  flags: string[]
  ports: string
  scripts: string[]
  timing: number
}

export function startScan(payload: StartScanPayload): Promise<ScanResult> {
  return fetchApi<ScanResult>('/scan', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getScan(scanId: string): Promise<ScanResult> {
  return fetchApi<ScanResult>(`/scan/${scanId}`)
}

export function listScans(): Promise<ScanResult[]> {
  return fetchApi<ScanResult[]>('/scan')
}
