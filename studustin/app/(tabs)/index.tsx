import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Text, Pressable, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import SubjectChip from '@/components/SubjectChip'
import { useSession, Subject } from '@/src/store'
import { useAuth } from '@/src/auth'
import { login, register, startSession, todaySessions, connectSocket } from '@/src/api'
import { setDnd } from '@/src/dnd'

export default function HomeScreen() {
  const router = useRouter()
  const { subject, setSubject, start } = useSession()
  const { token, setAuth } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const subjects: Subject[] = ['数', '英', '政', '专']

  useEffect(() => {}, [token])

  useEffect(() => {
    if (!token) return
    todaySessions(token).then(setRecords)
    const socket = connectSocket(token)
    socket.on('study:start', () => { setDnd(true) })
    socket.on('study:stop', () => { setDnd(false) })
    return () => socket.disconnect()
  }, [token])

  const totalMs = useMemo(() => records.reduce((sum, r) => sum + (r.durationMs || 0), 0), [records])

  async function onStart() {
    if (!token || !subject) return
    const resp = await startSession(token, subject, 'web')
    await setDnd(true)
    start(Date.now(), resp.id)
    router.push('/(tabs)/running')
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 }}>
        <Text style={{ color: '#888' }}>学习页面</Text>
        <Text> </Text>
      </View>
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Pressable onPress={onStart} style={{ width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: '#6b84ff', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, color: '#6b84ff' }}>开始学习</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
        {subjects.map((s) => (
          <SubjectChip key={s} label={s} active={subject === s} onPress={() => setSubject(s)} />
        ))}
      </View>
      <View style={{ paddingHorizontal: 12, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>今日学习记录</Text>
          <Text style={{ color: '#666' }}>共{formatElapsed(totalMs)}</Text>
        </View>
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{fmt(item.startAt)}-{item.endAt ? fmt(item.endAt) : '--:--'}</Text>
              <Text>{formatElapsed(item.durationMs)}</Text>
              <Text>{item.subject}</Text>
            </View>
          )}
        />
      </View>
    </View>
  )
}

function fmt(ts: number) { return dayjs(ts).format('HH:mm') }
function formatElapsed(ms: number) {
  const m = Math.floor(ms / 60000)
  const mm = String(m % 60).padStart(2, '0')
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  return `${hh}:${mm}`
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
})
