'use client';

import { useState, useEffect } from 'react';
import { getTranslations, type Language } from '@/lib/i18n';
import { getOrCreateDeviceId } from '@/lib/utils';

interface PostStatsProps {
  postId: string;
  language: Language;
  enableComments: boolean;
  enableLikes: boolean;
  enableViews: boolean;
}

export default function PostStats({
  postId,
  language,
  enableComments,
  enableLikes,
  enableViews,
}: PostStatsProps) {
  const [stats, setStats] = useState({ likes: 0, comments: 0, views: 0 });
  const t = getTranslations(language);

  useEffect(() => {
    // Generate or retrieve device ID
    const id = getOrCreateDeviceId();

    // Load stats
    const loadStats = async () => {
      const promises: Promise<any>[] = [];

      if (enableLikes) {
        promises.push(
          fetch(`/api/posts/${postId}/likes`, {
            headers: { 'x-device-id': id },
          })
            .then((res) => res.json())
            .then((data) => ({ likes: data.count || 0 }))
        );
      }

      if (enableComments) {
        promises.push(
          fetch(`/api/posts/${postId}/comments`)
            .then((res) => res.json())
            .then((data) => ({ comments: data.count || 0 }))
        );
      }

      if (enableViews) {
        promises.push(
          fetch(`/api/posts/${postId}`)
            .then((res) => res.json())
            .then((data) => ({ views: data.post?.views || 0 }))
        );
      }

      const results = await Promise.all(promises);
      const combined = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setStats((prev) => ({ ...prev, ...combined }));
    };

    loadStats();
  }, [postId, enableLikes, enableComments, enableViews]);

  const hasStats = (enableViews && stats.views > 0) || (enableLikes && stats.likes > 0) || (enableComments && stats.comments > 0);
  if (!hasStats && !enableViews && !enableLikes && !enableComments) return null;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {enableViews && (
        <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          <span className="font-light">{stats.views}</span>
        </div>
      )}
      {enableLikes && (
        <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="font-light">{stats.likes}</span>
        </div>
      )}
      {enableComments && (
        <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.488.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.492 3.578-1.53.12-.103.263-.148.398-.148h.163c.41 0 .811.034 1.2.099C12.884 19.978 12.442 20 12 20.25Z"
            />
          </svg>
          <span className="font-light">{stats.comments}</span>
        </div>
      )}
    </div>
  );
}

