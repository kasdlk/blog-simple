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
    const offset = (page - 1) * pageSize;

    const total = (db.prepare('SELECT COUNT(DISTINCT postId) as count FROM likes').get() as { count: number }).count;

    const items = db
      .prepare(
        `SELECT p.id as postId, p.title as title, COUNT(l.postId) as likes, MAX(l.createdAt) as latestLikeAt
         FROM posts p
         JOIN likes l ON p.id = l.postId
         GROUP BY p.id
         ORDER BY likes DESC, latestLikeAt DESC
         LIMIT ? OFFSET ?`
      )
      .all(pageSize, offset) as Array<{ postId: string; title: string; likes: number; latestLikeAt: string }>;

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('Failed to fetch admin likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}



