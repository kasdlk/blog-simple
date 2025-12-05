'use client';

import { useState, useEffect } from 'react';
import { getTranslations, type Language } from '@/lib/i18n';

interface AdminSearchBoxProps {
  language?: Language;
  onSearch: (query: string) => void;
}

export default function AdminSearchBox({ language = 'en', onSearch }: AdminSearchBoxProps) {
  const [query, setQuery] = useState('');
  const t = getTranslations(language);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={t.search}
      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-500"
    />
  );
}



