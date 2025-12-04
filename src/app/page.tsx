import { getPosts, getCategories } from '@/lib/posts';
import { getSettings } from '@/lib/settings';
import { getTranslations, type Language } from '@/lib/i18n';
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
          <div className="flex-1 max-w-2xl w-full">
            <header className="mb-8 sm:mb-12 lg:mb-16">
              <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-light text-black dark:text-white">
                  {settings.blogTitle || 'Blog'}
                </h1>
                {settings.blogSubtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {settings.blogSubtitle}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex-1 max-w-xs">
                  <SearchBox language={lang} />
                </div>
                <ThemeToggle language={lang} />
              </div>
            </header>

            {/* Mobile Author Info */}
            <div className="lg:hidden mb-6">
              <AuthorInfo settings={settings} />
            </div>

            {/* Mobile Category Menu */}
            <div className="lg:hidden mb-4">
              <CategoryMenu categories={categories} currentCategory={category} language={lang} />
            </div>

            <main>
              <InfiniteScroll
                initialPosts={data.posts}
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
