import { fetchApi } from './client'

export interface NseScript {
  name: string
  description: string
  category: string
}

export function listScripts(): Promise<NseScript[]> {
  return fetchApi<NseScript[]>('/scripts')
}
