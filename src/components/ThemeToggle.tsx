'use client';

import { useEffect, useState } from 'react';
import { getTranslations, type Language } from '@/lib/i18n';

interface ThemeToggleProps {
  language?: Language;
}

export default function ThemeToggle({ language = 'en' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const t = getTranslations(language);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    
    // Get theme from localStorage or default to dark
    const stored = localStorage.getItem('theme');
    const shouldBeDark = stored ? stored === 'dark' : true;
    
    // Apply theme immediately
    if (shouldBeDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
    
    setIsDark(shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;
    
    // Toggle dark class
    if (newIsDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
    
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <button
        className="relative inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 rounded-full active:scale-95"
        aria-label="Toggle theme"
      >
        <span className="relative z-10">{t.black}</span>
        <span className="absolute inset-0 border border-black dark:border-2 dark:border-white rounded-full pointer-events-none"></span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-full active:scale-95"
      aria-label="Toggle theme"
    >
      <span className="relative z-10 transition-opacity duration-300">{isDark ? t.black : t.white}</span>
      <span className="absolute inset-0 border border-black dark:border-2 dark:border-white rounded-full pointer-events-none transition-opacity duration-300"></span>
    </button>
  );
}
