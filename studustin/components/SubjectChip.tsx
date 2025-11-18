import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Subject } from '@/src/store'

export default function SubjectChip({ label, active, onPress }: { label: Subject; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginRight: 12 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#c9d3ff', backgroundColor: active ? '#e9f0ff' : '#fff', shadowColor: '#6b84ff', shadowOpacity: 0.15, shadowRadius: 6 }}>
        <Text style={{ fontSize: 18 }}>{label}</Text>
      </View>
    </Pressable>
  )
}