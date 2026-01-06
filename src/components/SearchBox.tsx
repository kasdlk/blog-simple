'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { extractPlainText } from '@/lib/markdown';
import { getTranslations, type Language } from '@/lib/i18n';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

interface SearchBoxProps {
  language?: Language;
}

export default function SearchBox({ language = 'en' }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = getTranslations(language);

  const from = (() => {
    const qs = searchParams.toString();
    return `${pathname}${qs ? `?${qs}` : ''}` || '/';
  })();

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.posts || []);
            setIsOpen(true);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (query.trim().length === 0) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleIconClick = () => {
    setIsExpanded(true);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {!isExpanded ? (
        <button
          onClick={handleIconClick}
          className="inline-flex items-center justify-center p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-95"
          aria-label={t.search}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length > 0 && setIsOpen(true)}
            placeholder={t.search}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all duration-300 rounded-md"
          />
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 shadow-xl rounded-lg overflow-hidden max-h-96 overflow-y-auto z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
              {isSearching ? (
                <div className="px-4 py-12 text-center">
                  <div className="flex justify-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-light">{t.searching}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-light">{t.noResults}</p>
                </div>
              ) : (
                <div className="py-1">
                  {results.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}?from=${encodeURIComponent(from)}`}
                      onClick={() => {
                        setQuery('');
                        setIsOpen(false);
                        setIsExpanded(false);
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 border-b border-gray-200 dark:border-gray-800 last:border-0 active:bg-gray-100 dark:active:bg-gray-800"
                    >
                      <h4 className="text-sm font-medium text-black dark:text-white mb-1.5 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {extractPlainText(post.content, 100)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

