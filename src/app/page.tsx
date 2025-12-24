import { getPosts, getCategories } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { getTranslations, type Language } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import CategoryMenu, { CategorySidebar } from '@/components/CategoryMenu';
import SearchBox from '@/components/SearchBox';
import AuthorInfo from '@/components/AuthorInfo';
import InfiniteScroll from '@/components/InfiniteScroll';

interface HomeProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = params.category || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 10;

  const [data, settings, categories] = await Promise.all([
    getPosts(category || undefined, page, pageSize),
    getSettings(),
    getCategories(),
  ]);

  const totalPages = Math.ceil(data.total / pageSize);
  const lang = (settings.language || 'en') as Language;
  const t = getTranslations(lang);

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
            <div className="sticky top-16">
              <AuthorInfo settings={settings} />
              <CategorySidebar categories={categories} currentCategory={category} language={lang} />
            </div>
          </aside>

          {/* Main Content - Blog */}
          <div className="flex-1 max-w-2xl w-full mx-auto lg:mx-0">
            <header className="mb-10 sm:mb-14 lg:mb-20">
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
              <InfiniteScroll
                initialPosts={postsWithFormattedDates}
                initialPage={page}
                total={data.total}
                category={category || undefined}
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
