'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTranslations, type Language } from '@/lib/i18n';

interface CategoryMenuProps {
  categories: string[];
  currentCategory: string;
  language?: Language;
}

export default function CategoryMenu({ categories, currentCategory, language = 'en' }: CategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslations(language);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.category-sidebar') && !target.closest('.category-button')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Category Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="category-button lg:hidden mb-4 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        {t.categories} {isOpen ? '▲' : '▼'}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <aside className="category-sidebar fixed left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50 lg:hidden overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {t.categories}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm py-2 px-2 rounded transition-colors ${
                    !currentCategory
                      ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 dark:border-l-2 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  {t.all}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/?category=${encodeURIComponent(cat)}`}
                    onClick={() => setIsOpen(false)}
                    className={`block text-sm py-2 px-2 rounded transition-colors ${
                      currentCategory === cat
                        ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 dark:border-l-2 dark:border-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export function CategorySidebar({ categories, currentCategory, language = 'en' }: CategoryMenuProps) {
  const t = getTranslations(language);
  
  return (
    <aside className="w-48 flex-shrink-0 hidden lg:block">
      <div className="sticky top-16">
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wide">
            {t.categories}
          </h3>
          <div className="space-y-2">
            <Link
              href="/"
              className={`block text-sm py-1 px-2 rounded transition-colors ${
                !currentCategory
                  ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 dark:border-l-2 dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {t.all}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${encodeURIComponent(cat)}`}
                className={`block text-sm py-1 px-2 rounded transition-colors ${
                  currentCategory === cat
                    ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 dark:border-l-2 dark:border-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
