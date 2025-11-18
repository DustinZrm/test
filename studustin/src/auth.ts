import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AuthState = {
  token: string | null
  user: { id: number; email: string } | null
  setAuth: (token: string, user: { id: number; email: string }) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    AsyncStorage.setItem('studustin_auth', JSON.stringify({ token, user }))
    set({ token, user })
  },
  logout: () => {
    AsyncStorage.removeItem('studustin_auth')
    set({ token: null, user: null })
  }
}))

export async function loadAuth() {
  const raw = await AsyncStorage.getItem('studustin_auth')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.token && parsed?.user) {
      useAuth.getState().setAuth(parsed.token, parsed.user)
      return parsed
    }
  } catch {}
  return null
}