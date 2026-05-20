export type ControlType = 'toggle' | 'select' | 'text' | 'slider'

export interface FlagOption {
  value: string
  label: string
}

export interface FlagDefinition {
  id: string
  flag: string
  name: string
  description: string
  category: string
  type: ControlType
  options?: FlagOption[]
  hasValue?: boolean
  valueHint?: string
  min?: number
  max?: number
  toFlag: (value: string | boolean | number) => string
}

export const SCAN_TYPES: FlagDefinition[] = [
  {
    id: 'scanType',
    flag: '-sS',
    name: 'Scan Type',
    description: 'Method used to probe target ports',
    category: 'scan_type',
    type: 'select',
    options: [
      { value: '-sS', label: 'SYN Scan — half-open, fast, stealthy' },
      { value: '-sT', label: 'TCP Connect — full handshake, no root needed' },
      { value: '-sU', label: 'UDP Scan — finds DNS, SNMP, DHCP' },
      { value: '-sF', label: 'FIN Scan — bypasses simple firewalls' },
      { value: '-sX', label: 'XMAS Scan — FIN+PSH+URG flags' },
      { value: '-sN', label: 'NULL Scan — no flags set' },
      { value: '-sA', label: 'ACK Scan — maps firewall rules' },
      { value: '-sn', label: 'Ping Scan — host discovery only' },
    ],
    toFlag: (value) => String(value),
  },
]

export const TIMING: FlagDefinition = {
  id: 'timing',
  flag: '-T',
  name: 'Timing',
  description: 'Speed vs stealth tradeoff (T0=paranoid, T5=insane)',
  category: 'timing',
  type: 'slider',
  min: 0,
  max: 5,
  toFlag: (value) => `-T${value}`,
}

export const DETECTION_FLAGS: FlagDefinition[] = [
  {
    id: 'versionDetection',
    flag: '-sV',
    name: 'Version Detection',
    description: 'Probe open ports for service name and version',
    category: 'detection',
    type: 'toggle',
    toFlag: (on) => (on ? '-sV' : ''),
  },
  {
    id: 'osDetection',
    flag: '-O',
    name: 'OS Detection',
    description: 'Identify target OS via TCP/IP fingerprinting',
    category: 'detection',
    type: 'toggle',
    toFlag: (on) => (on ? '-O' : ''),
  },
  {
    id: 'aggressiveScan',
    flag: '-A',
    name: 'Aggressive Scan',
    description: 'OS + version + scripts + traceroute all at once',
    category: 'detection',
    type: 'toggle',
    toFlag: (on) => (on ? '-A' : ''),
  },
]

export const PORT_FLAGS: FlagDefinition[] = [
  {
    id: 'portRange',
    flag: '-p',
    name: 'Port Range',
    description: 'Specific ports to scan',
    category: 'port',
    type: 'text',
    hasValue: true,
    valueHint: 'e.g. 1-1000 or 22,80,443',
    toFlag: (value) => (value ? `-p ${value}` : ''),
  },
  {
    id: 'topPorts',
    flag: '--top-ports',
    name: 'Top Ports',
    description: 'Scan N most common ports',
    category: 'port',
    type: 'text',
    hasValue: true,
    valueHint: 'e.g. 100',
    toFlag: (value) => (value ? `--top-ports ${value}` : ''),
  },
  {
    id: 'fastScan',
    flag: '-F',
    name: 'Fast Scan',
    description: 'Top 100 ports instead of 1000',
    category: 'port',
    type: 'toggle',
    toFlag: (on) => (on ? '-F' : ''),
  },
  {
    id: 'allPorts',
    flag: '-p-',
    name: 'All Ports',
    description: 'Scan all 65535 ports',
    category: 'port',
    type: 'toggle',
    toFlag: (on) => (on ? '-p-' : ''),
  },
]

export const HOST_DISCOVERY_FLAGS: FlagDefinition[] = [
  {
    id: 'skipDiscovery',
    flag: '-Pn',
    name: 'Skip Host Discovery',
    description: 'Treat all hosts as online, skip ping',
    category: 'host_discovery',
    type: 'toggle',
    toFlag: (on) => (on ? '-Pn' : ''),
  },
]

export const OUTPUT_FLAGS: FlagDefinition[] = [
  {
    id: 'verbose',
    flag: '-v',
    name: 'Verbose',
    description: 'Show open ports as found',
    category: 'output',
    type: 'toggle',
    toFlag: (on) => (on ? '-v' : ''),
  },
  {
    id: 'traceroute',
    flag: '--traceroute',
    name: 'Traceroute',
    description: 'Trace hop path to each host',
    category: 'output',
    type: 'toggle',
    toFlag: (on) => (on ? '--traceroute' : ''),
  },
  {
    id: 'showReason',
    flag: '--reason',
    name: 'Show Reason',
    description: 'Show why each port is in its state',
    category: 'output',
    type: 'toggle',
    toFlag: (on) => (on ? '--reason' : ''),
  },
  {
    id: 'openOnly',
    flag: '--open',
    name: 'Open Ports Only',
    description: 'Only show open ports, reduce noise',
    category: 'output',
    type: 'toggle',
    toFlag: (on) => (on ? '--open' : ''),
  },
]

export const EVASION_FLAGS: FlagDefinition[] = [
  {
    id: 'fragmentPackets',
    flag: '-f',
    name: 'Fragment Packets',
    description: 'Split packets to bypass inspection',
    category: 'evasion',
    type: 'toggle',
    toFlag: (on) => (on ? '-f' : ''),
  },
  {
    id: 'decoy',
    flag: '-D',
    name: 'Decoy Scan',
    description: 'Spoof source IPs alongside yours',
    category: 'evasion',
    type: 'text',
    hasValue: true,
    valueHint: 'e.g. RND:5',
    toFlag: (value) => (value ? `-D ${value}` : ''),
  },
]

export const ALL_FLAG_GROUPS = [
  { label: 'Detection', flags: DETECTION_FLAGS },
  { label: 'Ports', flags: PORT_FLAGS },
  { label: 'Host Discovery', flags: HOST_DISCOVERY_FLAGS },
  { label: 'Output', flags: OUTPUT_FLAGS },
  { label: 'Evasion', flags: EVASION_FLAGS },
]
