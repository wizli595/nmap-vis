import { fetchApi } from './client'
import type { ScanResult } from '../types/scan'

export interface ScanSummary {
  scan_id: string
  target: string
  command: string
  status: string
  host_count: number
  port_count: number
  started_at: string
  finished_at: string | null
}

export function listHistory(): Promise<ScanSummary[]> {
  return fetchApi<ScanSummary[]>('/history')
}

export function getHistoryScan(scanId: string): Promise<ScanResult> {
  return fetchApi<ScanResult>(`/history/${scanId}`)
}
