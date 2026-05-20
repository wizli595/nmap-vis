export interface ScanRequest {
  target: string
  scan_type: string
  flags: string[]
  ports?: string
  scripts?: string[]
}

export interface Host {
  ip: string
  hostname?: string
  status: 'up' | 'down'
  ports: Port[]
  os?: string
}

export interface Port {
  number: number
  protocol: 'tcp' | 'udp'
  state: 'open' | 'closed' | 'filtered'
  service?: string
  version?: string
}

export interface ScanResult {
  scan_id: string
  status: 'running' | 'completed' | 'failed'
  command: string
  target: string
  hosts: Host[]
  raw_output: string
  started_at: string
  finished_at?: string
}
