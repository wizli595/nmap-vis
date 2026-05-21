import { useState, useEffect } from 'react'
import { listHistory, type ScanSummary } from '../../api/history'
import { ScanCard } from './ScanCard'

interface Props {
  onViewScan: (scanId: string) => void
}

export function HistoryPage({ onViewScan }: Props) {
  const [scans, setScans] = useState<ScanSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listHistory()
      .then(setScans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingState />
  }

  if (scans.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-sm text-[var(--text-dim)] uppercase tracking-widest">
        Scan History
      </h2>
      {scans.map((scan) => (
        <ScanCard
          key={scan.scan_id}
          scan={scan}
          onClick={() => onViewScan(scan.scan_id)}
        />
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <span className="text-[var(--text-dim)] font-mono animate-pulse">Loading history...</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64">
      <span className="text-[var(--text-dim)] font-mono">No scans yet. Launch one to get started.</span>
    </div>
  )
}
