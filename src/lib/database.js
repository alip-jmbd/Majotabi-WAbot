import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbDir = 'session';
const dbPath = path.join(dbDir, 'database.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    key_id TEXT PRIMARY KEY,
    chat_id TEXT,
    sender_id TEXT,
    message TEXT,
    timestamp INTEGER
  )
`);

export const saveMessage = (m) => {
    if (!m || !m.key.id) return;
    try {
        const stmt = db.prepare('INSERT OR REPLACE INTO messages (key_id, chat_id, sender_id, message, timestamp) VALUES (?, ?, ?, ?, ?)');
        stmt.run(m.key.id, m.key.remoteJid, m.key.participant || m.key.remoteJid, JSON.stringify(m), Math.floor(Date.now() / 1000));
    } catch (e) {
        console.error('Database Error:', e);
    }
};

export const loadMessage = (id) => {
    try {
        const stmt = db.prepare('SELECT message FROM messages WHERE key_id = ?');
        const row = stmt.get(id);
        return row ? JSON.parse(row.message) : null;
    } catch (e) {
        return null;
    }
};

export const getDbSize = () => {
    try {
        const stats = fs.statSync(dbPath);
        return (stats.size / 1024 / 1024).toFixed(2) + ' MB';
    } catch (e) {
        return '0 MB';
    }
};

export const getTotalMessages = () => {
    try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM messages');
        return stmt.get().count;
    } catch (e) {
        return 0;
    }
};

export default db;
