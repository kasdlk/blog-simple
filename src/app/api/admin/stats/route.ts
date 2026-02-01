import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const sp = request.nextUrl.searchParams;
    const date = (sp.get('date') || new Date().toISOString().slice(0, 10)).trim(); // YYYY-MM-DD

    const postsCount = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number }).count;
    const viewsSum = (db.prepare('SELECT COALESCE(SUM(views), 0) as sum FROM posts').get() as { sum: number }).sum;
    const likesCount = (db.prepare('SELECT COUNT(*) as count FROM likes').get() as { count: number }).count;
    const commentsCount = (db.prepare('SELECT COUNT(*) as count FROM comments').get() as { count: number }).count;

    const dayPosts = (db.prepare('SELECT COUNT(*) as count FROM posts WHERE date(createdAt) = date(?)').get(date) as { count: number }).count;
    const dayLikes = (db.prepare('SELECT COUNT(*) as count FROM likes WHERE date(createdAt) = date(?)').get(date) as { count: number }).count;
    const dayComments = (db.prepare('SELECT COUNT(*) as count FROM comments WHERE date(createdAt) = date(?)').get(date) as { count: number }).count;
    const dayViews = (db.prepare('SELECT COUNT(*) as count FROM views_log WHERE date(createdAt) = date(?)').get(date) as { count: number }).count;

    const viewsTop = db
      .prepare(
        `SELECT p.id as postId, p.title as title, COUNT(v.postId) as views, MAX(v.createdAt) as latestViewAt
         FROM posts p
         JOIN views_log v ON p.id = v.postId
         WHERE date(v.createdAt) = date(?)
         GROUP BY p.id
         ORDER BY views DESC, latestViewAt DESC
         LIMIT 10`
      )
      .all(date) as Array<{ postId: string; title: string; views: number; latestViewAt: string }>;

    const recentComments = db
      .prepare(
        `SELECT c.id, c.postId, p.title as postTitle, c.content, c.floor, c.deviceId, c.createdAt
         FROM comments c
         JOIN posts p ON p.id = c.postId
         WHERE date(c.createdAt) = date(?)
         ORDER BY c.createdAt DESC
         LIMIT 20`
      )
      .all(date) as Array<{
      id: string;
      postId: string;
      postTitle: string;
      content: string;
      floor: number;
      deviceId: string;
      createdAt: string;
    }>;

    return NextResponse.json({
      overview: {
        posts: postsCount,
        views: viewsSum,
        likes: likesCount,
        comments: commentsCount,
      },
      day: {
        date,
        posts: dayPosts,
        views: dayViews,
        likes: dayLikes,
        comments: dayComments,
      },
      viewsTop,
      recentComments,
    });
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    return NextResponse.json({ error: 'Failed to get admin stats' }, { status: 500 });
  }
}


