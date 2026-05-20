import { create } from 'zustand'

interface FlagValues {
  [key: string]: string | boolean | number
}

interface ScanState {
  target: string
  scanType: string
  timing: number
  flagValues: FlagValues
  scripts: string[]

  setTarget: (target: string) => void
  setScanType: (scanType: string) => void
  setTiming: (timing: number) => void
  setFlagValue: (id: string, value: string | boolean | number) => void
  addScript: (script: string) => void
  removeScript: (script: string) => void
  reset: () => void
}

const INITIAL_STATE = {
  target: '',
  scanType: '-sS',
  timing: 3,
  flagValues: {} as FlagValues,
  scripts: [] as string[],
}

export const useScanStore = create<ScanState>((set) => ({
  ...INITIAL_STATE,

  setTarget: (target) => set({ target }),

  setScanType: (scanType) => set({ scanType }),

  setTiming: (timing) => set({ timing }),

  setFlagValue: (id, value) =>
    set((state) => ({
      flagValues: { ...state.flagValues, [id]: value },
    })),

  addScript: (script) =>
    set((state) => ({
      scripts: [...state.scripts, script],
    })),

  removeScript: (script) =>
    set((state) => ({
      scripts: state.scripts.filter((s) => s !== script),
    })),

  reset: () => set(INITIAL_STATE),
}))
