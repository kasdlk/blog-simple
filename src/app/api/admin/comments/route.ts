import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(sp.get('pageSize') || '20', 10)));
    const q = (sp.get('q') || '').trim();
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const params: unknown[] = [];
    if (q) {
      where.push('(p.title LIKE ? OR c.content LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = (
      db.prepare(
        `SELECT COUNT(*) as count
         FROM comments c
         JOIN posts p ON p.id = c.postId
         ${whereClause}`
      ).get(...params) as { count: number }
    ).count;

    const comments = db
      .prepare(
        `SELECT c.id, c.postId, p.title as postTitle, c.content, c.floor, c.deviceId, c.createdAt
         FROM comments c
         JOIN posts p ON p.id = c.postId
         ${whereClause}
         ORDER BY c.createdAt DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, pageSize, offset) as Array<{
      id: string;
      postId: string;
      postTitle: string;
      content: string;
      floor: number;
      deviceId: string;
      createdAt: string;
    }>;

    return NextResponse.json({ comments, total, page, pageSize });
  } catch (error) {
    console.error('Failed to fetch admin comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}



