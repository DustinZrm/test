import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/src/store'
import { useAuth } from '@/src/auth'
import { stopSession } from '@/src/api'
import { setDnd } from '@/src/dnd'

export default function Running() {
  const router = useRouter()
  const { running, startAt, stop, sessionId } = useSession()
  const { token } = useAuth()
  const [now, setNow] = useState(Date.now())
  const timer = useRef<any>()

  useEffect(() => {
    timer.current = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer.current)
  }, [])

  const elapsed = useMemo(() => startAt ? now - startAt : 0, [now, startAt])

  async function exit() {
    if (token && sessionId) await stopSession(token, sessionId)
    await setDnd(false)
    stop()
    router.replace('/')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 96, color: '#ddd' }}>{formatTime(now)}</Text>
      <Text style={{ color: '#ccc', marginTop: 12 }}>已学</Text>
      <Text style={{ color: '#ccc', fontSize: 24, marginTop: 4 }}>{formatElapsed(elapsed)}</Text>
      <View style={{ position: 'absolute', right: 24, bottom: 24 }}>
        <Pressable onLongPress={exit} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: 'red', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 28, height: 28, backgroundColor: 'red' }} />
        </Pressable>
      </View>
    </View>
  )
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000)
  const ss = String(s % 60).padStart(2, '0')
  const m = Math.floor(s / 60)
  const mm = String(m % 60).padStart(2, '0')
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}