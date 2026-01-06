'use client';

import { useState } from 'react';
import { getTranslations, type Language } from '@/lib/i18n';

interface ThemeToggleProps {
  language?: Language;
}

export default function ThemeToggle({ language = 'en' }: ThemeToggleProps) {
  // 主题 class 在 layout.tsx 的 inline script 中会在 hydration 前写到 html 上
  // 但服务端无法得知用户本地主题，因此 SSR/CSR 首屏文案可能不同。
  // 我们用 suppressHydrationWarning 只忽略该文本节点差异，避免整棵树 hydration 失败。
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });
  const t = getTranslations(language);

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

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-light border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 rounded-full active:scale-95"
      aria-label="Toggle theme"
    >
      <span className="relative z-10 transition-opacity duration-300" suppressHydrationWarning>
        {isDark ? t.black : t.white}
      </span>
      <span className="absolute inset-0 border border-black dark:border-2 dark:border-white rounded-full pointer-events-none transition-opacity duration-300"></span>
    </button>
  );
}
