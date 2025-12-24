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
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16 lg:py-20">
        <header className="mb-12 sm:mb-16">
          <div className="flex justify-between items-start mb-8">
            <Link 
              href="/" 
              className="text-sm font-light text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 inline-flex items-center gap-1.5 hover:translate-x-[-2px] group"
            >
              <span className="transition-transform duration-300 group-hover:translate-x-[-2px]">←</span>
              <span>{t.back}</span>
            </Link>
            <ThemeToggle language={lang} />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
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

