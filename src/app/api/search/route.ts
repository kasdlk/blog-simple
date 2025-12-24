import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';
import { validateSearchQuery } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Validate search query
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || 'Invalid search query' }, { status: 400 });
    }

    const posts = await searchPosts(query.trim());
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search posts' }, { status: 500 });
  }
}







