'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { extractPlainText } from '@/lib/markdown';
import { getTranslations, type Language } from '@/lib/i18n';
import PostStats from '@/components/PostStats';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
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
  const t = getTranslations(language);

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
          setPosts((prev) => {
            const newPosts = [...prev, ...data.posts];
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
  }, [page, pageSize, category, hasMore, loading]);

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
      <div className="text-center py-20 text-gray-400 dark:text-gray-600">
        <p>{t.noPosts}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {posts.map((post, index) => (
          <article
            key={post.id}
            className={`border-t border-gray-200 dark:border-gray-800 pt-8 sm:pt-12 pb-8 sm:pb-12 ${
              index === posts.length - 1 && !hasMore ? 'border-b' : ''
            }`}
          >
            <Link href={`/posts/${post.id}`} className="block">
              <h2 className="text-xl sm:text-2xl font-light text-black dark:text-white mb-3 sm:mb-4 hover:opacity-70 transition-opacity">
                {post.title}
              </h2>
            </Link>
            <Link href={`/posts/${post.id}`} className="block">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-3 hover:opacity-70 transition-opacity cursor-pointer">
                {extractPlainText(post.content, 200)}
              </p>
            </Link>
            {post.category && (
              <div className="mb-2">
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {t.category}: {post.category}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <time className="text-xs text-gray-400 dark:text-gray-600">
                {new Date(post.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
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
        <div ref={observerTarget} className="py-8 text-center">
          {loading && (
            <p className="text-sm text-gray-400 dark:text-gray-600">{t.searching}</p>
          )}
        </div>
      )}
    </>
  );
}

