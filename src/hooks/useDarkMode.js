import { useState, useEffect } from 'react';

export default function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('resurgo-theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      try { localStorage.setItem('resurgo-theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('resurgo-theme', 'light'); } catch {}
    }
  }, [dark]);

  return [dark, () => setDark(d => !d)];
}
