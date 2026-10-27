import mysql from 'mysql2/promise';
import { Database } from 'bun:sqlite';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar: string;
  level: number;
  xp: number;
  gold: number;
  created_at: string;
}

export interface QuestRecord {
  id: number;
  user_id: number;
  title: string;
  category: 'game' | 'code' | 'workout' | 'study' | 'habit';
  difficulty: 'easy' | 'medium' | 'boss';
  xp_reward: number;
  gold_reward: number;
  status: 'todo' | 'completed';
  due_date?: string;
  created_at: string;
}

let isMySQL = true;
let pool: mysql.Pool | null = null;
let sqliteDb: Database | null = null;

export async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'questboy_db',
      waitForConnections: true,
      connectionLimit: 10,
    });

    await pool.query('SELECT 1');
    console.log('[DB] Connected to MySQL (FlyEnv)');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(50) DEFAULT 'boy_cap',
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        gold INT DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'game',
        difficulty VARCHAR(50) DEFAULT 'easy',
        xp_reward INT DEFAULT 25,
        gold_reward INT DEFAULT 10,
        status VARCHAR(20) DEFAULT 'todo',
        due_date VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_status (user_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    isMySQL = true;
  } catch (err: any) {
    console.warn('[DB] MySQL connect failed, fallback to Bun SQLite:', err.message);
    isMySQL = false;
    sqliteDb = new Database('questboy.sqlite');
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT 'boy_cap',
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        gold INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'game',
        difficulty TEXT DEFAULT 'easy',
        xp_reward INTEGER DEFAULT 25,
        gold_reward INTEGER DEFAULT 10,
        status TEXT DEFAULT 'todo',
        due_date TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (isMySQL && pool) {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } else if (sqliteDb) {
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(...params) as T[];
  }
  return [];
}

export async function execute(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  if (isMySQL && pool) {
    const [res] = await pool.execute(sql, params);
    const result = res as any;
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  } else if (sqliteDb) {
    const stmt = sqliteDb.prepare(sql);
    const res = stmt.run(...params);
    return { insertId: Number(res.lastInsertRowid), affectedRows: res.changes };
  }
  return { insertId: 0, affectedRows: 0 };
}
