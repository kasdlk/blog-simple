import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const posts = await searchPosts(query.trim());
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search posts' }, { status: 500 });
  }
}



