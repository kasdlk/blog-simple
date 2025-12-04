import crypto from 'crypto';
import db from './db';

// SHA256 hash function (simple, no external dependencies)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const stmt = db.prepare('SELECT * FROM admin WHERE username = ?');
  const admin = stmt.get(username) as AdminUser | undefined;
  
  if (!admin) {
    return false;
  }
  
  const passwordHash = hashPassword(password);
  return admin.passwordHash === passwordHash;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const stmt = db.prepare('SELECT * FROM admin LIMIT 1');
  const admin = stmt.get() as AdminUser | undefined;
  return admin || null;
}

export async function updateAdminCredentials(username: string, password?: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    // Check if admin exists
    const existing = db.prepare('SELECT * FROM admin LIMIT 1').get();
    
    if (existing) {
      // Update existing admin
      if (password !== undefined && password !== null) {
        // Update both username and password
        const passwordHash = hashPassword(password);
        const stmt = db.prepare('UPDATE admin SET username = ?, passwordHash = ?, updatedAt = ?');
        stmt.run(username, passwordHash, now);
      } else {
        // Update only username
        const stmt = db.prepare('UPDATE admin SET username = ?, updatedAt = ?');
        stmt.run(username, now);
      }
    } else {
      // Create new admin (password is required for new admin)
      if (!password) {
        return false;
      }
      const passwordHash = hashPassword(password);
      const stmt = db.prepare('INSERT INTO admin (username, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?)');
      stmt.run(username, passwordHash, now, now);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update admin credentials:', error);
    return false;
  }
}

// Get the hash for password "123456" for README
export function getDefaultPasswordHash(): string {
  return hashPassword('123456');
}

