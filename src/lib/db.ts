import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync, renameSync } from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'blog.db');

// Ensure data directory exists
if (!existsSync(dbDir)) {
  try {
    mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create data directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to backup corrupted database
function backupCorruptedDatabase(sourcePath: string): string | null {
  if (!existsSync(sourcePath)) {
    return null;
  }
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const corruptedBackup = path.join(dbDir, `blog.db.corrupted.${timestamp}`);
    renameSync(sourcePath, corruptedBackup);
    console.warn(`Corrupted database backed up to: ${corruptedBackup}`);
    return corruptedBackup;
  } catch (backupError) {
    console.error('Failed to backup corrupted database:', backupError);
    return null;
  }
}

// Initialize database with error handling and integrity check
let db: Database.Database;
try {
  // Try to open the database
  db = new Database(dbPath);
  
  // Check database integrity if database exists and has data
  if (existsSync(dbPath)) {
    try {
      const integrityResult = db.pragma('integrity_check') as Array<{ integrity_check: string }>;
      const integrityCheck = integrityResult[0]?.integrity_check || '';
      if (integrityCheck !== 'ok') {
        console.warn('Database integrity check failed:', integrityCheck);
        // Close the corrupted database
        db.close();
        
        // Backup corrupted database
        backupCorruptedDatabase(dbPath);
        
        // Create a new database
        db = new Database(dbPath);
        console.info('Created new database due to corruption');
      }
    } catch (integrityError) {
      // If integrity check itself fails, the database is likely corrupted
      console.warn('Database integrity check failed:', integrityError);
      try {
        db.close();
      } catch (closeError) {
        // Ignore close errors
      }
      
      // Backup corrupted database
      backupCorruptedDatabase(dbPath);
      
      // Create a new database
      db = new Database(dbPath);
      console.info('Created new database due to corruption');
    }
  }
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // If database is malformed, try to backup and create new one
  if (errorMessage.includes('malformed') || errorMessage.includes('corrupt') || errorMessage.includes('disk image')) {
    console.warn('Database file appears to be corrupted, attempting to recover...');
    
    // Backup corrupted database
    const backupPath = backupCorruptedDatabase(dbPath);
    
    // Try to create a new database
    try {
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      console.info('Created new database after corruption detected');
    } catch (createError) {
      throw new Error(
        `数据库文件已损坏且无法自动恢复。\n` +
        `已备份损坏的数据库到: ${backupPath || '备份失败'}\n` +
        `请检查以下内容：\n` +
        `1. 确保数据库文件完整（未在传输过程中损坏）\n` +
        `2. 如果是从服务器复制的文件，请使用正确的传输方式（如 scp, rsync）\n` +
        `3. 可以尝试使用 SQLite 工具修复：sqlite3 data/blog.db ".recover" | sqlite3 data/blog.db.new\n` +
        `4. 或者手动删除 data/blog.db 文件，系统将创建新的数据库\n` +
        `原始错误: ${errorMessage}`
      );
    }
  } else {
    throw new Error(`Failed to initialize database: ${errorMessage}`);
  }
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT '',
    views INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    content TEXT NOT NULL,
    floor INTEGER NOT NULL,
    deviceId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    postId TEXT NOT NULL,
    deviceId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    PRIMARY KEY (postId, deviceId),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

// Add category column if it doesn't exist (migration)
try {
  db.prepare('SELECT category FROM posts LIMIT 1').get();
} catch {
  db.exec('ALTER TABLE posts ADD COLUMN category TEXT DEFAULT ""');
}

// Add views column if it doesn't exist (migration)
try {
  db.prepare('SELECT views FROM posts LIMIT 1').get();
} catch {
  db.exec('ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0');
}

// Add floor and deviceId columns to comments if they don't exist (migration)
try {
  db.prepare('SELECT floor FROM comments LIMIT 1').get();
} catch {
  db.exec('ALTER TABLE comments ADD COLUMN floor INTEGER DEFAULT 1');
  db.exec('ALTER TABLE comments ADD COLUMN deviceId TEXT DEFAULT ""');
  // Update existing comments with floor numbers
  const comments = db.prepare('SELECT id, postId FROM comments ORDER BY createdAt ASC').all() as Array<{ id: string; postId: string }>;
  const floorMap = new Map<string, number>();
  for (const comment of comments) {
    const currentFloor = (floorMap.get(comment.postId) || 0) + 1;
    floorMap.set(comment.postId, currentFloor);
    db.prepare('UPDATE comments SET floor = ? WHERE id = ?').run(currentFloor, comment.id);
  }
}

// Insert default settings if not exists
const defaultSettings = [
  { key: 'blogTitle', value: 'Blog' },
  { key: 'authorName', value: '' },
  { key: 'authorBio', value: '' },
  { key: 'authorEmail', value: '' },
  { key: 'authorAvatar', value: '' },
  { key: 'language', value: 'en' },
  { key: 'enableComments', value: 'true' },
  { key: 'enableLikes', value: 'true' },
  { key: 'enableViews', value: 'true' },
  { key: 'blogSubtitle', value: '' },
];

for (const setting of defaultSettings) {
  const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get(setting.key);
  if (!existing) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(setting.key, setting.value);
  }
}

// Initialize default admin account if not exists
// Default password: 123456 (SHA256 hash)
const defaultPasswordHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
const adminExists = db.prepare('SELECT * FROM admin LIMIT 1').get();
if (!adminExists) {
  const now = new Date().toISOString();
  db.prepare('INSERT INTO admin (username, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
    'admin',
    defaultPasswordHash,
    now,
    now
  );
}

export default db;

