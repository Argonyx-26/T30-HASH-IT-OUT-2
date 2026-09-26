import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }, []);

  return { theme: 'dark', toggleTheme: () => {}, setTheme: () => {} };
}
