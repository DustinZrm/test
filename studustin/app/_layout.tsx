import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, useSegments, Redirect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { useEffect } from 'react'
import { useAuth, loadAuth } from '@/src/auth'
import { useSession } from '@/src/store'
import { activeSession } from '@/src/api'

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const segments = useSegments()
  const { token } = useAuth()
  const { running, start } = useSession()

  useEffect(() => {
    ;(async () => { if (!token) await loadAuth() })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!token || running) return
      const s = await activeSession(token)
      if (s?.id && s?.startAt) start(s.startAt, s.id)
    })()
  }, [token, running])

  const inAuth = segments[0] === 'login'

  if (!token && !inAuth) return <Redirect href="/login" />
  if (token && running && !(segments[0] === '(tabs)' && segments[1] === 'running')) return <Redirect href="/(tabs)/running" />

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: '登录', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}
