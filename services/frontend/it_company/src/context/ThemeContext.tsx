import { createContext, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  toggleTheme: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/*
 * The source of truth is the class on <html>. The inline script in
 * index.html puts it there before first paint, from storage or the device
 * preference; this provider only writes it, on toggle. It must not re-apply
 * it on mount: an effect runs after paint, and re-applying a guess would
 * flash light-mode visitors dark.
 *
 * The theme is deliberately not part of the context value. The server cannot
 * know it, so a value read from <html> would change right after hydration for
 * every light-mode visitor. This provider sits above the Suspense boundary in
 * AppRoutes, which is still waiting for the page's lazy chunk at that moment,
 * and React answers a change above a waiting boundary by throwing away the
 * prerendered page and showing the fallback. Anything that looks different
 * per theme uses Tailwind's dark: variant, which follows the class with no
 * render at all.
 */
function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
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

function toggleTheme(): void {
  applyTheme(readTheme() === 'dark' ? 'light' : 'dark');
}

/** The same object for the life of the app, so no provider render ever reaches a consumer. */
const THEME_CONTEXT: ThemeContextType = { toggleTheme };

export function ThemeProvider({ children }: { children: ReactNode }) {
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

  return (
    <ThemeContext.Provider value={THEME_CONTEXT}>
      {children}
    </ThemeContext.Provider>
  );
}
