import db from './db';

export async function getLikesCount(postId: string): Promise<number> {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM likes WHERE postId = ?');
  const result = stmt.get(postId) as { count: number };
  return result.count;
}

export async function hasLiked(postId: string, deviceId: string): Promise<boolean> {
  const stmt = db.prepare('SELECT 1 FROM likes WHERE postId = ? AND deviceId = ?');
  const result = stmt.get(postId, deviceId);
  return !!result;
}

export async function toggleLike(postId: string, deviceId: string): Promise<{ liked: boolean; count: number }> {
  const hasLikedStmt = db.prepare('SELECT 1 FROM likes WHERE postId = ? AND deviceId = ?');
  const existing = hasLikedStmt.get(postId, deviceId);

  if (existing) {
    // Unlike
    const deleteStmt = db.prepare('DELETE FROM likes WHERE postId = ? AND deviceId = ?');
    deleteStmt.run(postId, deviceId);
  } else {
    // Like
    const now = new Date().toISOString();
    const insertStmt = db.prepare('INSERT INTO likes (postId, deviceId, createdAt) VALUES (?, ?, ?)');
    insertStmt.run(postId, deviceId, now);
  }

  const count = await getLikesCount(postId);
  return { liked: !existing, count };
}




