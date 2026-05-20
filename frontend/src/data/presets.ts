export interface Preset {
  id: string
  name: string
  description: string
  scanType: string
  timing: number
  flags: Record<string, string | boolean | number>
  scripts: string[]
}

export const PRESETS: Preset[] = [
  {
    id: 'quick',
    name: 'Quick Scan',
    description: 'Fast discovery — top 100 ports, aggressive timing',
    scanType: '-sS',
    timing: 4,
    flags: { fastScan: true },
    scripts: [],
  },
  {
    id: 'intense',
    name: 'Intense Scan',
    description: 'OS + version + scripts + traceroute, full picture',
    scanType: '-sS',
    timing: 4,
    flags: { aggressiveScan: true, verbose: true },
    scripts: [],
  },
  {
    id: 'full-port',
    name: 'Full Port Scan',
    description: 'All 65535 ports — thorough but slow',
    scanType: '-sS',
    timing: 4,
    flags: { allPorts: true },
    scripts: [],
  },
  {
    id: 'vuln',
    name: 'Vulnerability Scan',
    description: 'Version detection + vuln scripts — find weaknesses',
    scanType: '-sV',
    timing: 4,
    flags: {},
    scripts: ['vuln'],
  },
  {
    id: 'stealth',
    name: 'Stealth Scan',
    description: 'Slow and quiet — evade IDS/IPS detection',
    scanType: '-sS',
    timing: 1,
    flags: { fragmentPackets: true },
    scripts: [],
  },
  {
    id: 'ping-sweep',
    name: 'Ping Sweep',
    description: 'Host discovery only — who is on the network?',
    scanType: '-sn',
    timing: 4,
    flags: {},
    scripts: [],
  },
]
