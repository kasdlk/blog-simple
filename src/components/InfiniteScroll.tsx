'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { extractPlainText } from '@/lib/markdown';
import { getTranslations, type Language } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import PostStats from '@/components/PostStats';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  formattedDate?: string; // Server-formatted date to avoid hydration mismatch
}

interface InfiniteScrollProps {
  initialPosts: Post[];
  initialPage: number;
  total: number;
  category?: string;
  language: Language;
  pageSize?: number;
  enableComments: boolean;
  enableLikes: boolean;
  enableViews: boolean;
}

export default function InfiniteScroll({
  initialPosts,
  initialPage,
  total,
  category,
  language,
  pageSize = 10,
  enableComments,
  enableLikes,
  enableViews,
}: InfiniteScrollProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < total);
  const observerTarget = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = getTranslations(language);

  // Get current category from URL to detect changes
  const currentCategoryFromUrl = searchParams.get('category') || undefined;

  // Keep the current list URL so the post page can "go back" to it (e.g. category page)
  const from = useMemo(() => {
    const qs = searchParams.toString();
    return `${pathname}${qs ? `?${qs}` : ''}` || '/';
  }, [pathname, searchParams]);

  // Reset posts when category changes (detected from URL) or when initialPosts update
  useEffect(() => {
    setPosts(initialPosts);
    setPage(initialPage);
    setHasMore(initialPosts.length < total);
    setLoading(false);
  }, [currentCategoryFromUrl, initialPosts, initialPage, total]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: nextPage.toString(),
        pageSize: pageSize.toString(),
      });
      if (category) {
        params.append('category', category);
      }

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          // Format dates for newly loaded posts to ensure consistency
          const formattedPosts = data.posts.map((post: Post) => ({
            ...post,
            formattedDate: formatDate(post.createdAt, language),
          }));
          setPosts((prev) => {
            const newPosts = [...prev, ...formattedPosts];
            setHasMore(newPosts.length < data.total);
            return newPosts;
          });
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, category, hasMore, loading, language]);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-24 sm:py-32">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <p className="text-base text-gray-800 dark:text-gray-200 font-light">{t.noPosts}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {posts.map((post, index) => (
          <article
            key={post.id}
            className={`group relative pb-4 sm:pb-6 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 ${
              index === 0 
                ? 'pt-4 sm:pt-4 lg:border-t border-gray-200 dark:border-gray-800' 
                : 'pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800'
            }`}
          >
            <Link href={`/posts/${post.id}?from=${encodeURIComponent(from)}`} className="block">
              <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white mb-3 sm:mb-4 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-80">
                {post.title}
              </h2>
            </Link>
            <Link href={`/posts/${post.id}?from=${encodeURIComponent(from)}`} className="block">
              <p className="text-gray-800 dark:text-gray-200 text-sm mb-4 sm:mb-6 line-clamp-3 transition-opacity duration-300 group-hover:opacity-80 cursor-pointer">
                {extractPlainText(post.content, 200)}
              </p>
            </Link>
            {post.category && (
              <div className="mb-3 sm:mb-4">
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors duration-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                  {post.category}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <time className="text-xs text-gray-700 dark:text-gray-300 font-light" suppressHydrationWarning>
                {post.formattedDate || new Date(post.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <PostStats
                postId={post.id}
                language={language}
                enableComments={enableComments}
                enableLikes={enableLikes}
                enableViews={enableViews}
              />
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="py-12 text-center">
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-light">{t.searching}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

