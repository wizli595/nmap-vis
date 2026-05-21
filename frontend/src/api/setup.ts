const API_BASE = 'http://localhost:8001'

export interface SetupStatus {
  nmap_local: boolean
  docker_ready: boolean
  docker_installed: boolean
  os: { system: string; release: string; machine: string }
}

export interface NmapCheck {
  installed: boolean
  path?: string
  version?: string
  os: { system: string; release: string; machine: string }
  install_instructions?: {
    method: string
    command: string
    alt_method?: string
  }
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const res = await fetch(`${API_BASE}/setup/status`)
  return res.json()
}

export async function checkNmap(): Promise<NmapCheck> {
  const res = await fetch(`${API_BASE}/setup/nmap-check`)
  return res.json()
}

export async function buildDockerImage(
  onLine: (line: string) => void,
  onDone: (success: boolean) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/setup/docker-build`, { method: 'POST' })
  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) return

  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line === '__BUILD_SUCCESS__') {
        onDone(true)
        return
      }
      if (line === '__BUILD_FAILED__') {
        onDone(false)
        return
      }
      if (line.trim()) onLine(line)
    }
  }

  onDone(false)
}
