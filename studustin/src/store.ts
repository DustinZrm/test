import { create } from 'zustand'

export type Subject = '数' | '英' | '政' | '专'

type SessionState = {
  subject: Subject | null
  running: boolean
  startAt: number | null
  sessionId?: number
  setSubject: (s: Subject) => void
  start: (startAt: number, sessionId: number) => void
  stop: () => void
}

export const useSession = create<SessionState>((set) => ({
  subject: null,
  running: false,
  startAt: null,
  setSubject: (s) => set({ subject: s }),
  start: (startAt, sessionId) => set({ running: true, startAt, sessionId }),
  stop: () => set({ running: false, startAt: null, sessionId: undefined })
}))