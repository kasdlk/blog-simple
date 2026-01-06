import { getPosts, getCategories } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { type Language } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import CategoryMenu, { CategorySidebar } from '@/components/CategoryMenu';
import SearchBox from '@/components/SearchBox';
import AuthorInfo from '@/components/AuthorInfo';
import InfiniteScroll from '@/components/InfiniteScroll';

interface HomeProps {
  searchParams: Promise<{ category?: string; keyword?: string; page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = params.category || '';
  const keyword = params.keyword || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 10;

  const [data, settings, categories] = await Promise.all([
    getPosts(category || undefined, page, pageSize, keyword || undefined),
    getSettings(),
    getCategories(),
  ]);

  const lang = (settings.language || 'en') as Language;

  // Format dates on server side to avoid hydration mismatch
  const postsWithFormattedDates = data.posts.map(post => ({
    ...post,
    formattedDate: formatDate(post.createdAt, lang),
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Left Sidebar - Author Info + Categories (Desktop) */}
          <aside className="w-48 flex-shrink-0 hidden lg:block">
            <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-hidden pr-2 flex flex-col">
              <AuthorInfo settings={settings} />
              <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar">
                <CategorySidebar categories={categories} currentCategory={category} language={lang} />
              </div>
            </div>
          </aside>

          {/* Main Content - Blog */}
          <div className="flex-1 max-w-2xl w-full mx-auto lg:mx-0">
            <header className="mb-6 sm:mb-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white mb-3 tracking-tight">
                  {settings.blogTitle || 'Blog'}
                </h1>
                {settings.blogSubtitle && (
                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mt-2 font-light">
                    {settings.blogSubtitle}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center mb-8 gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="lg:hidden flex-shrink-0">
                    <CategoryMenu categories={categories} currentCategory={category} language={lang} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SearchBox language={lang} />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ThemeToggle language={lang} />
                </div>
              </div>
            </header>

            {/* Mobile Author Info */}
            <div className="lg:hidden mb-6">
              <AuthorInfo settings={settings} />
            </div>

            <main>
              {(category || keyword) && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {category && (
                    <Link
                      href={keyword ? `/?keyword=${encodeURIComponent(keyword)}` : '/'}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="清除分类筛选"
                    >
                      分类：{category} ×
                    </Link>
                  )}
                  {keyword && (
                    <Link
                      href={category ? `/?category=${encodeURIComponent(category)}` : '/'}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="清除关键词筛选"
                    >
                      关键词：{keyword} ×
                    </Link>
                  )}
                </div>
              )}
              <InfiniteScroll
                initialPosts={postsWithFormattedDates}
                initialPage={page}
                total={data.total}
                category={category || undefined}
                keyword={keyword || undefined}
                language={lang}
                pageSize={pageSize}
                enableComments={settings.enableComments === 'true'}
                enableLikes={settings.enableLikes === 'true'}
                enableViews={settings.enableViews === 'true'}
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
