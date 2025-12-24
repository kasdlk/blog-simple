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
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8">
        {enableViews && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 text-gray-700 dark:text-gray-300"
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
            <span className="text-sm font-light text-gray-800 dark:text-gray-200">
              {views}
            </span>
          </div>
        )}
        {enableLikes && (
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300 active:scale-95 ${
              likes.liked 
                ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm' 
                : 'text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transition-transform duration-300 ${likes.liked ? 'scale-110 fill-current' : ''}`}
              fill={likes.liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <span className="text-sm font-light">{likes.count}</span>
          </button>
        )}
        {enableComments && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 text-gray-700 dark:text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.488.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.492 3.578-1.53.12-.103.263-.148.398-.148h.163c.41 0 .811.034 1.2.099C12.884 19.978 12.442 20 12 20.25Z"
              />
            </svg>
            <span className="text-sm font-light text-gray-800 dark:text-gray-200">
              {comments.length}
            </span>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {enableComments && (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.488.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.492 3.578-1.53.12-.103.263-.148.398-.148h.163c.41 0 .811.034 1.2.099C12.884 19.978 12.442 20 12 20.25Z"
              />
            </svg>
            <h3 className="text-lg font-light text-black dark:text-white">
              {t.comments} {comments.length > 0 && <span className="text-sm text-gray-700 dark:text-gray-300 font-normal">({comments.length})</span>}
            </h3>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={t.addComment}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent mb-3 min-h-[100px] resize-y rounded-md transition-all duration-300 font-light"
              required
            />
            {commentError && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-2">{commentError}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !commentContent.trim()}
              className="px-5 py-2.5 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 dark:disabled:hover:border-gray-700 rounded-md active:scale-95"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-gray-400 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                  {t.submit}
                </span>
              ) : t.submit}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-5">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.488.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.492 3.578-1.53.12-.103.263-.148.398-.148h.163c.41 0 .811.034 1.2.099C12.884 19.978 12.442 20 12 20.25Z"
                  />
                </svg>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-light">{t.noComments}</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="pb-5 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          #{comment.floor}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {t.comments}
                        </span>
                        <time className="text-xs text-gray-700 dark:text-gray-300 font-light">
                          {new Date(comment.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pl-10">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

