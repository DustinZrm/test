import Database from 'better-sqlite3'

const db = new Database('studustin.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    start_at INTEGER NOT NULL,
    end_at INTEGER,
    device_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`)

export default db