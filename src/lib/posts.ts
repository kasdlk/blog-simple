import db from './db';

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPosts(category?: string, page: number = 1, pageSize: number = 10): Promise<{ posts: Post[]; total: number }> {
  // Validate and limit page size
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const safePage = Math.max(1, page);
  
  let query = 'SELECT * FROM posts';
  const params: (string | number)[] = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM posts${category ? ' WHERE category = ?' : ''}`);
  const total = (countStmt.get(...(category ? [category] : [])) as { count: number }).count;
  
  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(safePageSize, (safePage - 1) * safePageSize);
  
  const stmt = db.prepare(query);
  const posts = stmt.all(...params) as Post[];
  
  return { posts, total };
}

export async function getAllPosts(): Promise<Post[]> {
  const stmt = db.prepare('SELECT * FROM posts ORDER BY createdAt DESC');
  return stmt.all() as Post[];
}

export async function getCategories(): Promise<string[]> {
  const stmt = db.prepare("SELECT DISTINCT category FROM posts WHERE category != '' AND category IS NOT NULL ORDER BY category");
  const rows = stmt.all() as Array<{ category: string }>;
  return rows.map(row => row.category);
}

export async function searchPosts(query: string, limit: number = 20): Promise<Post[]> {
  const searchQuery = `%${query}%`;
  const stmt = db.prepare(
    'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY createdAt DESC LIMIT ?'
  );
  return stmt.all(searchQuery, searchQuery, limit) as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
  const post = stmt.get(id) as Post | undefined;
  return post || null;
}

export async function incrementViews(id: string): Promise<void> {
  const stmt = db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?');
  stmt.run(id);
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Post> {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO posts (id, title, content, category, views, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, post.title, post.content, post.category || '', 0, now, now);
  return { id, ...post, category: post.category || '', views: 0, createdAt: now, updatedAt: now };
}

export async function updatePost(id: string, post: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<Post | null> {
  const existing = await getPost(id);
  if (!existing) return null;
  
  const updatedAt = new Date().toISOString();
  const stmt = db.prepare('UPDATE posts SET title = ?, content = ?, category = ?, updatedAt = ? WHERE id = ?');
  stmt.run(
    post.title ?? existing.title,
    post.content ?? existing.content,
    post.category ?? existing.category,
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
