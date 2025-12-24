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

  // Touch and drag handling for swipe to close
  useEffect(() => {
    if (!isOpen) return;
      
    let touchStartX = 0;
    let touchStartY = 0;
    const sidebar = document.querySelector('.category-sidebar') as HTMLElement | null;
      
    if (!sidebar) return;
      
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
      
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;
        
      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
        
      const diffX = touchCurrentX - touchStartX;
      const diffY = touchCurrentY - touchStartY;
        
      // Only handle horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
          
        if (diffX > 0) { // Swiping right to close
          const progress = Math.min(diffX / window.innerWidth, 1);
          sidebar.style.transform = `translateX(${progress * 100}%) scale(${1 - (0.05 * progress)})`;
          sidebar.style.opacity = `${1 - progress * 0.3}`;
            
          // Update backdrop opacity
          const backdrop = document.querySelector('.fixed.inset-0.bg-black\/50') as HTMLElement | null;
          if (backdrop) {
            backdrop.style.opacity = `${1 - progress}`;
          }
        }
      }
    };
      
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;
        
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;
        
      // If swipe is more than 50% of screen width, close the sidebar
      if (diffX > window.innerWidth * 0.3) {
        setIsOpen(false);
      } else {
        // Reset to original position
        sidebar.style.transform = '';
        sidebar.style.opacity = '';
        const backdrop = document.querySelector('.fixed.inset-0.bg-black\/50') as HTMLElement | null;
        if (backdrop) {
          backdrop.style.opacity = '';
        }
      }
        
      touchStartX = 0;
      touchStartY = 0;
    };
      
    sidebar.addEventListener('touchstart', handleTouchStart);
    sidebar.addEventListener('touchmove', handleTouchMove);
    sidebar.addEventListener('touchend', handleTouchEnd);
      
    return () => {
      if (sidebar) {
        sidebar.removeEventListener('touchstart', handleTouchStart);
        sidebar.removeEventListener('touchmove', handleTouchMove);
        sidebar.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen]);
    
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
        className="category-button lg:hidden px-3 py-2 text-sm font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 flex items-center gap-1.5 rounded-md active:scale-95 whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <span>{t.categories}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsOpen(false)}
          />
          <aside className={`category-sidebar fixed left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50 lg:hidden overflow-y-auto transform-gpu transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'translate-x-0 opacity-100 scale-100 shadow-2xl' : '-translate-x-0 opacity-0 scale-95 -translate-x-4'} ${!isOpen ? 'invisible' : 'visible'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  {t.categories}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm py-2.5 px-3 rounded-md transition-all duration-300 ${
                    !currentCategory
                      ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 border-l-2 border-black dark:border-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:translate-x-1'
                  }`}
                >
                  {t.all}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/?category=${encodeURIComponent(cat)}`}
                    onClick={() => setIsOpen(false)}
                    className={`block text-sm py-2.5 px-3 rounded-md transition-all duration-300 ${
                      currentCategory === cat
                        ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 border-l-2 border-black dark:border-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:translate-x-1'
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
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">
            {t.categories}
          </h3>
          <div className="space-y-2">
            <Link
              href="/"
              className={`block text-sm py-2 px-3 rounded-md transition-all duration-300 ${
                !currentCategory
                  ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 border-l-2 border-black dark:border-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:translate-x-1'
              }`}
            >
              {t.all}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${encodeURIComponent(cat)}`}
                className={`block text-sm py-2 px-3 rounded-md transition-all duration-300 ${
                  currentCategory === cat
                    ? 'text-black dark:text-white font-medium bg-gray-100 dark:bg-gray-800 border-l-2 border-black dark:border-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:translate-x-1'
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
