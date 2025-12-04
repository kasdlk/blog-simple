'use client';

import { useState, useEffect } from 'react';
import { getTranslations, type Language } from '@/lib/i18n';
import { getOrCreateDeviceId, hasViewedPost, markPostAsViewed } from '@/lib/utils';

interface PostInteractionsProps {
  postId: string;
  language: Language;
  enableComments: boolean;
  enableLikes: boolean;
  enableViews: boolean;
}

interface Comment {
  id: string;
  content: string;
  floor: number;
  createdAt: string;
}

export default function PostInteractions({
  postId,
  language,
  enableComments,
  enableLikes,
  enableViews,
}: PostInteractionsProps) {
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [views, setViews] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [commentError, setCommentError] = useState('');
  const t = getTranslations(language);

  useEffect(() => {
    // Generate or retrieve device ID
    const id = getOrCreateDeviceId();
    setDeviceId(id);

    // Load initial data
    if (enableViews) {
      // Only increment views if not already viewed in this session
      if (!hasViewedPost(postId)) {
        fetch(`/api/posts/${postId}/views`, { method: 'POST' })
          .then(() => {
            markPostAsViewed(postId);
          })
          .catch((error) => {
            console.error('Failed to update views:', error);
          })
          .finally(() => {
            // Fetch updated views count regardless of increment success
            fetch(`/api/posts/${postId}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.post) {
                  setViews(data.post.views || 0);
                }
              })
              .catch((error) => {
                console.error('Failed to fetch views:', error);
              });
          });
      } else {
        // Just fetch current views without incrementing
        fetch(`/api/posts/${postId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.post) {
              setViews(data.post.views || 0);
            }
          })
          .catch((error) => {
            console.error('Failed to fetch views:', error);
          });
      }
    }
    if (enableLikes) {
      fetch(`/api/posts/${postId}/likes`, {
        headers: { 'x-device-id': id },
      })
        .then((res) => res.json())
        .then((data) => setLikes({ count: data.count || 0, liked: data.liked || false }));
    }
    if (enableComments) {
      fetch(`/api/posts/${postId}/comments`)
        .then((res) => res.json())
        .then((data) => setComments(data.comments || []));
    }
  }, [postId, enableLikes, enableComments, enableViews]);

  const handleLike = async () => {
    if (!enableLikes || !deviceId) return;

    try {
      const res = await fetch(`/api/posts/${postId}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes({ count: data.count, liked: data.liked });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || submitting || !deviceId) return;

    setSubmitting(true);
    setCommentError('');
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent.trim(), deviceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setCommentContent('');
      } else {
        const error = await res.json();
        setCommentError(error.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setCommentError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* Stats */}
      <div className="flex gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
        {enableViews && (
          <span>
            {t.views}: {views}
          </span>
        )}
        {enableLikes && (
          <button
            onClick={handleLike}
            className={`hover:opacity-70 transition-opacity ${
              likes.liked ? 'text-black dark:text-white' : ''
            }`}
          >
            {t.likes}: {likes.count}
          </button>
        )}
        {enableComments && (
          <span>
            {t.comments}: {comments.length}
          </span>
        )}
      </div>

      {/* Comments Section */}
      {enableComments && (
        <div>
          <h3 className="text-lg font-light text-black dark:text-white mb-4">
            {t.comments}
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={t.addComment}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-500 mb-3 min-h-[100px] resize-y"
              required
            />
            {commentError && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-2">{commentError}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !commentContent.trim()}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : t.submit}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-600">{t.noComments}</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      #{comment.floor}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  <time className="text-xs text-gray-400 dark:text-gray-600">
                    {new Date(comment.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

