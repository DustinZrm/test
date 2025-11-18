import io from 'socket.io-client'

const API = 'http://localhost:4001'

export async function register(email: string, password: string) {
  const r = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  return r.json()
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  return r.json()
}

export async function startSession(token: string, subject: string, deviceId: string) {
  const r = await fetch(`${API}/sessions/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ subject, deviceId }) })
  return r.json()
}

export async function stopSession(token: string, sessionId: number) {
  const r = await fetch(`${API}/sessions/stop`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ sessionId }) })
  return r.json()
}

export async function todaySessions(token: string) {
  const r = await fetch(`${API}/sessions/today`, { headers: { Authorization: `Bearer ${token}` } })
  return r.json()
}

export async function activeSession(token: string) {
  const r = await fetch(`${API}/sessions/active`, { headers: { Authorization: `Bearer ${token}` } })
  return r.json()
}

export async function stats(token: string, period: 'day'|'week'|'month') {
  const r = await fetch(`${API}/stats?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
  return r.json()
}

export function connectSocket(token: string) {
  return io(API, { auth: { token } })
}