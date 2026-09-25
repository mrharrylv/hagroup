import { StrictMode, type ErrorInfo } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { createI18n } from './i18n';
import { localeFromPath } from './i18n/locales';
import { shouldHydrate } from './lib/boot';
import { preloadPage } from './pageRoutes';

const container = document.getElementById('root');
if (!container) throw new Error('index.html has no #root element to render into');

/** A hydration mismatch means the prerender and the browser disagree; say where. */
function reportRecoverableError(error: unknown, info: ErrorInfo): void {
  console.error('[hydrate] Recoverable error, React re-rendered part of the page:', error);
  if (import.meta.env.DEV && info.componentStack) console.error(info.componentStack);
}

/** Starts the app for the URL the browser shows now. */
function start(root: HTMLElement): void {
  const lang = localeFromPath(window.location.pathname);
  const app = (
    <StrictMode>
      <ThemeProvider>
        <App i18n={createI18n(lang)} initialLang={lang} />
      </ThemeProvider>
    </StrictMode>
  );

  if (shouldHydrate(root.dataset.prerendered, window.location.pathname)) {
    hydrateRoot(root, app, { onRecoverableError: reportRecoverableError });
  } else {
    // Markup for another URL (or none): start clean rather than hydrate a mismatch.
    root.replaceChildren();
    createRoot(root).render(app);
  }
}

if (shouldHydrate(container.dataset.prerendered, window.location.pathname)) {
  // The page's code first (the prerender modulepreloads it): React then
  // hydrates its Suspense boundary in one pass. Hydrated while the chunk is on
  // its way, the boundary would wait dehydrated, and a router update in that
  // gap (a #hash link, Back) makes React drop the markup for the fallback.
  // Failing to load it only costs that: hydrate anyway. start() looks at the
  // URL again, since Back may have changed it meanwhile.
  preloadPage(window.location.pathname)
    .catch((error: unknown) => {
      console.error('[hydrate] Could not load the page ahead of hydration; hydrating anyway:', error);
    })
    .then(() => start(container));
} else {
  start(container);
}
