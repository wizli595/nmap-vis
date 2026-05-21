import { useEffect, useRef, useState } from 'react'

type MessageHandler = (data: unknown) => void
type Status = 'connecting' | 'connected' | 'disconnected'

interface UseWebSocketOptions {
  onMessage: MessageHandler
  onClose?: () => void
}

export function useWebSocket(url: string | null, options: UseWebSocketOptions) {
  const [status, setStatus] = useState<Status>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    if (!url) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setStatus('connected')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      optionsRef.current.onMessage(data)
    }

    ws.onclose = () => {
      setStatus('disconnected')
      wsRef.current = null
      optionsRef.current.onClose?.()
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [url])

  return { status }
}
