import React, { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useAuth } from '@/src/auth'
import { stats } from '@/src/api'

export default function ExploreScreen() {
  const { token } = useAuth()
  const [period, setPeriod] = useState<'day'|'week'|'month'>('day')
  const [data, setData] = useState<any>({})
  useEffect(() => { if (token) stats(token, period).then(setData) }, [token, period])
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
        {(['day','week','month'] as const).map(p => (
          <Pressable key={p} onPress={() => setPeriod(p)} style={{ paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', backgroundColor: period===p?'#e9f0ff':'#fff' }}>
            <Text>{p==='day'?'日度':p==='week'?'周度':'月度'}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
        {Object.keys(data.data || {}).length === 0 ? (
          <Text style={{ color: '#666' }}>暂无数据</Text>
        ) : (
          Object.entries(data.data).map(([day, ms]) => (
            <View key={day} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text>{day}</Text>
              <Text>{formatElapsed(Number(ms))}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

function formatElapsed(ms: number) {
  const m = Math.floor(ms / 60000)
  const mm = String(m % 60).padStart(2, '0')
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  return `${hh}:${mm}`
}