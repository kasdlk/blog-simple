import db from './db';

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string;
  published: number; // 1 = 上架(前台展示), 0 = 下架(仅后台可见)
  views: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPosts(
  category?: string,
  page: number = 1,
  pageSize: number = 10,
  keyword?: string,
  includeUnpublished: boolean = false
): Promise<{ posts: Post[]; total: number }> {
  // Validate and limit page size
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safePageSize;
  
  const where: string[] = [];
  const params: unknown[] = [];
  if (!includeUnpublished) {
    where.push('published = 1');
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (keyword) {
    where.push('keywords LIKE ?');
    params.push(`%${keyword}%`);
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  // Use prepared statements for better performance and security
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM posts ${whereClause}`);
  const total = (countStmt.get(...params) as { count: number }).count;

  const postsStmt = db.prepare(`SELECT * FROM posts ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`);
  const posts = postsStmt.all(...params, safePageSize, offset) as Post[];
  
  return { posts, total };
}

export async function getAllPosts(includeUnpublished: boolean = true): Promise<Post[]> {
  const whereClause = includeUnpublished ? '' : 'WHERE published = 1';
  const stmt = db.prepare(`SELECT * FROM posts ${whereClause} ORDER BY createdAt DESC`);
  return stmt.all() as Post[];
}

export async function getCategories(): Promise<string[]> {
  const stmt = db.prepare("SELECT DISTINCT category FROM posts WHERE published = 1 AND category != '' AND category IS NOT NULL ORDER BY category");
  const rows = stmt.all() as Array<{ category: string }>;
  return rows.map(row => row.category);
}

export async function searchPosts(query: string, limit: number = 20, includeUnpublished: boolean = false): Promise<Post[]> {
  const searchQuery = `%${query}%`;
  const where: string[] = [];
  const params: unknown[] = [];
  if (!includeUnpublished) {
    where.push('published = 1');
  }
  where.push('(title LIKE ? OR content LIKE ? OR keywords LIKE ?)');
  params.push(searchQuery, searchQuery, searchQuery);
  const whereClause = `WHERE ${where.join(' AND ')}`;
  const stmt = db.prepare(`SELECT * FROM posts ${whereClause} ORDER BY createdAt DESC LIMIT ?`);
  return stmt.all(...params, limit) as Post[];
}

export async function getPost(id: string, includeUnpublished: boolean = false): Promise<Post | null> {
  const whereClause = includeUnpublished ? 'id = ?' : 'id = ? AND published = 1';
  const stmt = db.prepare(`SELECT * FROM posts WHERE ${whereClause}`);
  const post = stmt.get(id) as Post | undefined;
  return post || null;
}

export type AdjacentPost = Pick<Post, 'id' | 'title' | 'category' | 'createdAt'>;

/**
 * Get previous/next post based on createdAt order (DESC).
 * - prev: newer post (上一篇)
 * - next: older post (下一篇)
 * If category provided, navigation is scoped to that category.
 */
export async function getAdjacentPosts(postId: string, category?: string): Promise<{
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}> {
  const current = await getPost(postId);
  if (!current) return { prev: null, next: null };

  const baseWhere = category ? 'AND category = ?' : '';
  const paramsFor = (extra: unknown[]) => (category ? [...extra, category] : extra);

  // Prev (newer): closest post with createdAt > current (tie-break by id)
  const prevStmt = db.prepare(
    `SELECT id, title, category, createdAt
     FROM posts
     WHERE published = 1 AND (createdAt > ? OR (createdAt = ? AND id > ?)) ${baseWhere}
     ORDER BY createdAt ASC, id ASC
     LIMIT 1`
  );
  const prev = prevStmt.get(...paramsFor([current.createdAt, current.createdAt, current.id])) as AdjacentPost | undefined;

  // Next (older): closest post with createdAt < current (tie-break by id)
  const nextStmt = db.prepare(
    `SELECT id, title, category, createdAt
     FROM posts
     WHERE published = 1 AND (createdAt < ? OR (createdAt = ? AND id < ?)) ${baseWhere}
     ORDER BY createdAt DESC, id DESC
     LIMIT 1`
  );
  const next = nextStmt.get(...paramsFor([current.createdAt, current.createdAt, current.id])) as AdjacentPost | undefined;

  return { prev: prev || null, next: next || null };
}

export async function incrementViews(id: string): Promise<void> {
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?');
  stmt.run(id);

  // Log view for daily stats (admin dashboard)
  try {
    db.prepare('INSERT INTO views_log (postId, createdAt) VALUES (?, ?)').run(id, now);
  } catch {
    // ignore if table not present for some reason
  }
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Post> {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO posts (id, title, content, category, keywords, published, views, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const published = typeof post.published === 'number' ? post.published : 1;
  stmt.run(id, post.title, post.content, post.category || '', post.keywords || '', published, 0, now, now);
  return { id, ...post, category: post.category || '', keywords: post.keywords || '', published, views: 0, createdAt: now, updatedAt: now };
}

export async function updatePost(id: string, post: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<Post | null> {
  const existing = await getPost(id, true);
  if (!existing) return null;
  
  const updatedAt = new Date().toISOString();
  const stmt = db.prepare('UPDATE posts SET title = ?, content = ?, category = ?, keywords = ?, published = ?, updatedAt = ? WHERE id = ?');
  stmt.run(
    post.title ?? existing.title,
    post.content ?? existing.content,
    post.category ?? existing.category,
    post.keywords ?? existing.keywords ?? '',
    typeof post.published === 'number' ? post.published : existing.published ?? 1,
    updatedAt,
    id
  );
  return { ...existing, ...post, updatedAt };
}

export async function deletePost(id: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
