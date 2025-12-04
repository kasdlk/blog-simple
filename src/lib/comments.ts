import db from './db';

export interface Comment {
  id: string;
  postId: string;
  content: string;
  floor: number;
  deviceId: string;
  createdAt: string;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const stmt = db.prepare('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC');
  return stmt.all(postId) as Comment[];
}

export async function getCommentsCount(postId: string): Promise<number> {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM comments WHERE postId = ?');
  const result = stmt.get(postId) as { count: number };
  return result.count;
}

export async function getTodayCommentCount(deviceId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const stmt = db.prepare("SELECT COUNT(*) as count FROM comments WHERE deviceId = ? AND date(createdAt) = date(?)");
  const result = stmt.get(deviceId, today) as { count: number };
  return result.count;
}

export async function createComment(postId: string, content: string, deviceId: string): Promise<Comment> {
  // Get the next floor number for this post
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM comments WHERE postId = ?');
  const count = (countStmt.get(postId) as { count: number }).count;
  const floor = count + 1;

  const id = Date.now().toString();
  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO comments (id, postId, content, floor, deviceId, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(id, postId, content, floor, deviceId, now);
  return { id, postId, content, floor, deviceId, createdAt: now };
}

export async function deleteComment(id: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

