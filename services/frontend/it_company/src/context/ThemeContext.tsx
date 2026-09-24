import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * What the build renders. The server cannot know a visitor's theme, so the
 * prerendered header shows the dark variant and hydration starts from it.
 */
const SERVER_THEME: Theme = 'dark';

/*
 * The source of truth is the class on <html>. The inline script in
 * index.html puts it there before first paint, from storage or the device
 * preference; this provider only reads it, and writes it on toggle. It must
 * not re-apply it on mount: an effect runs after paint, and re-applying the
 * server's guess would flash light-mode visitors dark.
 */
function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function readServerTheme(): Theme {
  return SERVER_THEME;
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  try {
    localStorage.setItem('cloudie-theme', theme);
  } catch {
    // The theme still changes for the current page view.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, readServerTheme);

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

  const toggleTheme = useCallback(() => {
    applyTheme(readTheme() === 'dark' ? 'light' : 'dark');
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
