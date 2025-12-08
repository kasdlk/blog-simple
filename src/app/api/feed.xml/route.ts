import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { extractPlainText } from '@/lib/markdown';

export async function GET() {
  try {
    const [posts, settings] = await Promise.all([
      getAllPosts(),
      getSettings(),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const blogTitle = settings.blogTitle || 'Blog';
    const blogDescription = settings.authorBio || 'A minimal blog';

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(blogDescription)}</description>
    <language>en</language>
    <atom:link href="${baseUrl}/api/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/posts/${post.id}</link>
      <guid>${baseUrl}/posts/${post.id}</guid>
      <description>${escapeXml(extractPlainText(post.content, 300))}</description>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
    </item>`
      )
      .join('\n')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate RSS feed' }, { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}




