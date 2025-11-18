import React, { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/src/auth'
import { login, register } from '@/src/api'

export default function Login() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    try {
      const r = mode === 'login' ? await login(email, password) : await register(email, password)
      if (r?.token && r?.user) {
        setAuth(r.token, r.user)
        router.replace('/(tabs)')
      } else {
        setError('失败')
      }
    } catch (e) {
      setError('失败')
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, marginBottom: 24 }}>登录</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="邮箱" autoCapitalize="none" keyboardType="email-address" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="密码" secureTextEntry style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <Pressable onPress={submit} style={{ backgroundColor: '#6b84ff', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: '#fff' }}>{mode==='login'?'登录':'注册'}</Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode==='login'?'register':'login')} style={{ alignItems: 'center' }}>
        <Text style={{ color: '#6b84ff' }}>{mode==='login'?'没有账号？注册':'已有账号？登录'}</Text>
      </Pressable>
    </View>
  )
}