import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdjacentPosts, getPost } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { getTranslations, type Language } from '@/lib/i18n';
import { extractPlainText } from '@/lib/markdown';
import Markdown from '@/components/Markdown';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import PostInteractions from '@/components/PostInteractions';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const [post, settings] = await Promise.all([getPost(id), getSettings()]);
  if (!post) return {};

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3388';
  const title = post.title || settings.blogTitle || 'Blog';
  const description = extractPlainText(post.content || '', 160);
  const keywords = (post.keywords || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const url = `${baseUrl}/posts/${post.id}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: settings.blogTitle || 'Blog',
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  let backHref = '/';
  if (typeof sp?.from === 'string' && sp.from.length > 0) {
    try {
      const decoded = decodeURIComponent(sp.from);
      // Only allow in-site relative paths
      if (decoded.startsWith('/')) {
        backHref = decoded;
      }
    } catch {
      // ignore invalid encoding
    }
  }
  const [post, settings] = await Promise.all([
    getPost(id),
    getSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const lang = (settings.language || 'en') as Language;
  const t = getTranslations(lang);

  // If user came from a category list, keep prev/next within that category
  let navCategory: string | undefined;
  try {
    const u = new URL(backHref, 'http://local');
    const c = u.searchParams.get('category');
    if (c) navCategory = c;
  } catch {
    // ignore
  }
  const { prev, next } = await getAdjacentPosts(post.id, navCategory);
  const keywords = (post.keywords || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16 lg:py-20">
        <header className="mb-8 sm:mb-10">
          <div className="flex justify-between items-start mb-8">
            <Link 
              href={backHref}
              className="text-sm font-light text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 inline-flex items-center gap-1.5 hover:translate-x-[-2px] group"
            >
              <span className="transition-transform duration-300 group-hover:translate-x-[-2px]">←</span>
              <span>{t.back}</span>
            </Link>
            <ThemeToggle language={lang} />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-black dark:text-white mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            {settings.authorAvatar && (
              <Image
                src={settings.authorAvatar}
                alt={settings.authorName || 'Author'}
                width={40}
                height={40}
                className="rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-800"
              />
            )}
            <div className="flex flex-col">
              {settings.authorName && (
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                  {settings.authorName}
                </span>
              )}
              <time className="text-xs font-light text-gray-700 dark:text-gray-300">
                {new Date(post.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {keywords.map((k) => {
                const href = post.category
                  ? `/?category=${encodeURIComponent(post.category)}&keyword=${encodeURIComponent(k)}`
                  : `/?keyword=${encodeURIComponent(k)}`;
                return (
                  <Link
                    key={k}
                    href={href}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="点击按关键词筛选"
                  >
                    {k}
                  </Link>
                );
              })}
            </div>
          )}
        </header>

        <article className="max-w-none">
          <div className="max-w-none">
            <Markdown content={post.content} />
          </div>
        </article>

        <PostInteractions
          postId={post.id}
          language={lang}
          enableComments={settings.enableComments === 'true'}
          enableLikes={settings.enableLikes === 'true'}
          enableViews={settings.enableViews === 'true'}
        />

        {(prev || next) && (
          <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prev ? (
                <Link
                  href={`/posts/${prev.id}?from=${encodeURIComponent(backHref)}`}
                  className="group p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-light mb-2">{t.previous}</div>
                  <div className="text-sm text-black dark:text-white font-light line-clamp-2 group-hover:opacity-80 transition-opacity">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/posts/${next.id}?from=${encodeURIComponent(backHref)}`}
                  className="group p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-light mb-2">{t.next}</div>
                  <div className="text-sm text-black dark:text-white font-light line-clamp-2 group-hover:opacity-80 transition-opacity">
                    {next.title}
                  </div>
                </Link>
              ) : null}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

