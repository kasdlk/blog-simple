'use client';

import { useEffect } from 'react';

export default function ThemeInit() {
  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const storedTheme = localStorage.getItem('theme');
    const theme = storedTheme || 'dark';
    const html = document.documentElement;
    
    // Remove both classes first
    html.classList.remove('dark', 'light');
    
    // Add the correct class
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  }, []);

  return null;
}
