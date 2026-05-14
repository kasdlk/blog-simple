import crypto from 'crypto';
import db from './db';

// HMAC key for token signing — set ADMIN_TOKEN_SECRET in production
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'default-secret-change-in-production';

/** Cookie `maxAge` (seconds) and signed-token validity must stay in sync */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days
const ADMIN_SESSION_MAX_MS = ADMIN_SESSION_MAX_AGE_SEC * 1000;

const DEFAULT_TOKEN_SECRET = 'default-secret-change-in-production';
const isLikelyNextBuild =
  process.env.npm_lifecycle_event === 'build' ||
  (process.argv[2] === 'build' && typeof process.argv[1] === 'string' && process.argv[1].includes('next'));
if (
  process.env.NODE_ENV === 'production' &&
  TOKEN_SECRET === DEFAULT_TOKEN_SECRET &&
  !isLikelyNextBuild &&
  process.env.npm_lifecycle_event !== 'test'
) {
  console.warn(
    '[auth] ADMIN_TOKEN_SECRET is not set; using a default secret is insecure. Set ADMIN_TOKEN_SECRET in the environment.'
  );
}

// SHA256 hash function (simple, no external dependencies)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Generate a signed token for admin session
 * Token format: base64(username:timestamp:signature)
 */
export function generateToken(username: string): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  return token;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length || ba.length === 0) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/**
 * Verify a token and return the username if valid
 * Returns null if token is invalid or expired (see ADMIN_SESSION_MAX_AGE_SEC)
 */
export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [username, timestamp, signature] = parts;
    
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime) || Date.now() - tokenTime > ADMIN_SESSION_MAX_MS) {
      return null;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(`${username}:${timestamp}`)
      .digest('hex');
    
    if (!/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqualHex(signature, expectedSignature)) {
      return null;
    }
    
    return username;
  } catch {
    return null;
  }
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

