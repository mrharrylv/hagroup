import { createContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('cloudie-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Fall back to the device preference when browser storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Remove no-transition class after initial mount to enable smooth theme transitions
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('no-transition');
    // Remove after one frame so the initial theme applies instantly
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transition');
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('cloudie-theme', next);
      } catch {
        // The theme still changes for the current page view.
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
