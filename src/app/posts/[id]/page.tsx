import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { getTranslations, type Language } from '@/lib/i18n';
import Markdown from '@/components/Markdown';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import PostInteractions from '@/components/PostInteractions';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, settings] = await Promise.all([
    getPost(id),
    getSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const lang = (settings.language || 'en') as Language;
  const t = getTranslations(lang);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <Link 
              href="/" 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors inline-block"
            >
              &lt; {t.back}
            </Link>
            <ThemeToggle language={lang} />
          </div>
          <h1 className="text-4xl font-light text-black dark:text-white mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-6">
            {settings.authorAvatar && (
              <Image
                src={settings.authorAvatar}
                alt={settings.authorName || 'Author'}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            )}
            <div className="flex flex-col">
              {settings.authorName && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.authorName}
                </span>
              )}
              <time className="text-xs text-gray-400 dark:text-gray-600">
                {new Date(post.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>
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
      </div>
    </div>
  );
}

