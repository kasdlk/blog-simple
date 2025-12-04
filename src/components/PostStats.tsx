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

  const statsList: string[] = [];
  if (enableViews) statsList.push(`${t.views}: ${stats.views}`);
  if (enableLikes) statsList.push(`${t.likes}: ${stats.likes}`);
  if (enableComments) statsList.push(`${t.comments}: ${stats.comments}`);

  if (statsList.length === 0) return null;

  return (
    <span className="text-xs text-gray-400 dark:text-gray-600">
      {statsList.join(' · ')}
    </span>
  );
}

