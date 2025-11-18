import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from './db.js'
import { Server } from 'socket.io'

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
}

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

app.post('/auth/register', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email)
  if (exists) return res.status(400).json({ error: 'Email taken' })
  const hashed = bcrypt.hashSync(password, 10)
  const stmt = db.prepare('INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)')
  const info = stmt.run(email, hashed, Date.now())
  const user = { id: info.lastInsertRowid, email }
  res.json({ token: issueToken(user), user })
})

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email)
  if (!user) return res.status(400).json({ error: 'Invalid credentials' })
  const ok = bcrypt.compareSync(password, user.password)
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
  res.json({ token: issueToken(user), user: { id: user.id, email: user.email } })
})

app.post('/sessions/start', auth, (req, res) => {
  const { subject, deviceId } = req.body || {}
  if (!subject) return res.status(400).json({ error: 'Missing subject' })
  const stmt = db.prepare('INSERT INTO sessions (user_id, subject, start_at, device_id) VALUES (?, ?, ?, ?)')
  const info = stmt.run(req.user.id, subject, Date.now(), deviceId || null)
  broadcast(req.user.id, 'study:start', { subject, sessionId: info.lastInsertRowid, deviceId })
  res.json({ id: info.lastInsertRowid })
})

app.post('/sessions/stop', auth, (req, res) => {
  const { sessionId } = req.body || {}
  const session = db.prepare('SELECT * FROM sessions WHERE id=? AND user_id=?').get(sessionId, req.user.id)
  if (!session) return res.status(404).json({ error: 'Session not found' })
  db.prepare('UPDATE sessions SET end_at=? WHERE id=?').run(Date.now(), sessionId)
  broadcast(req.user.id, 'study:stop', { sessionId })
  res.json({ ok: true })
})

app.get('/sessions/today', auth, (req, res) => {
  const startDay = new Date()
  startDay.setHours(0, 0, 0, 0)
  const rows = db.prepare('SELECT * FROM sessions WHERE user_id=? AND start_at>=? ORDER BY start_at ASC').all(req.user.id, startDay.getTime())
  res.json(rows.map(r => ({
    id: r.id,
    subject: r.subject,
    startAt: r.start_at,
    endAt: r.end_at,
    durationMs: r.end_at ? (r.end_at - r.start_at) : 0
  })))
})

app.get('/sessions/active', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM sessions WHERE user_id=? AND end_at IS NULL ORDER BY start_at DESC LIMIT 1').get(req.user.id)
  if (!row) return res.json(null)
  res.json({ id: row.id, subject: row.subject, startAt: row.start_at })
})

app.get('/stats', auth, (req, res) => {
  const { period = 'day' } = req.query
  const now = new Date()
  let from = 0
  if (period === 'day') {
    now.setHours(0, 0, 0, 0)
    from = now.getTime()
  } else if (period === 'week') {
    const day = now.getDay() || 7
    now.setHours(0, 0, 0, 0)
    from = now.getTime() - (day - 1) * 24 * 60 * 60 * 1000
  } else if (period === 'month') {
    now.setDate(1)
    now.setHours(0, 0, 0, 0)
    from = now.getTime()
  }
  const rows = db.prepare('SELECT subject, start_at, end_at FROM sessions WHERE user_id=? AND start_at>=?').all(req.user.id, from)
  const byDay = {}
  for (const r of rows) {
    const dayKey = new Date(r.start_at).toISOString().slice(0, 10)
    const dur = r.end_at ? (r.end_at - r.start_at) : 0
    byDay[dayKey] = (byDay[dayKey] || 0) + dur
  }
  res.json({ period, data: byDay })
})

const server = app.listen(4001, () => {
  console.log('api on http://localhost:4001')
})

const io = new Server(server, { cors: { origin: '*' } })
const userSockets = new Map()

io.use((socket, next) => {
  const { token } = socket.handshake.auth || {}
  try {
    const user = jwt.verify(token, JWT_SECRET)
    socket.user = user
    next()
  } catch (e) {
    next(new Error('Unauthorized'))
  }
})

io.on('connection', (socket) => {
  const set = userSockets.get(socket.user.id) || new Set()
  set.add(socket)
  userSockets.set(socket.user.id, set)
  socket.on('disconnect', () => {
    const s = userSockets.get(socket.user.id)
    if (s) {
      s.delete(socket)
      if (s.size === 0) userSockets.delete(socket.user.id)
    }
  })
})

function broadcast(userId, event, payload) {
  const set = userSockets.get(userId)
  if (!set) return
  for (const s of set) {
    s.emit(event, payload)
  }
}