import { StrictMode, type ErrorInfo } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { createI18n } from './i18n';
import { localeFromPath } from './i18n/locales';
import { shouldHydrate } from './lib/boot';

const container = document.getElementById('root');
if (!container) throw new Error('index.html has no #root element to render into');

const lang = localeFromPath(window.location.pathname);
const i18n = createI18n(lang);

const app = (
  <StrictMode>
    <ThemeProvider>
      <App i18n={i18n} initialLang={lang} />
    </ThemeProvider>
  </StrictMode>
);

/** A hydration mismatch means the prerender and the browser disagree; say where. */
function reportRecoverableError(error: unknown, info: ErrorInfo): void {
  console.error('[hydrate] Recoverable error, React re-rendered part of the page:', error);
  if (import.meta.env.DEV && info.componentStack) console.error(info.componentStack);
}

if (shouldHydrate(container.dataset.prerendered, window.location.pathname)) {
  hydrateRoot(container, app, { onRecoverableError: reportRecoverableError });
} else {
  // Markup for another URL (or none): start clean rather than hydrate a mismatch.
  container.replaceChildren();
  createRoot(container).render(app);
}
