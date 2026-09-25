// @vitest-environment happy-dom
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { ThemeProvider } from '../../context/ThemeContext';
import { createI18n } from '../../i18n';
import { localeFromPath, type Lang } from '../../i18n/locales';
import { LANG_STORAGE_KEY } from '../../i18n/useLocaleRouting';

// The prerender renders with the Firebase stand-in (vite.config.ts); so does this.
vi.mock('../../lib/firebase', () => import('../../lib/firebase.ssr'));

/**
 * The language switcher in the running app: App with its router, rendered at
 * a URL the way main.tsx renders a page it has no prerendered markup for.
 */

type Menu = 'desktop' | 'mobile';

let root: Root | null = null;

function currentUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function languageLinks(): HTMLAnchorElement[] {
  return [...document.querySelectorAll<HTMLAnchorElement>('header a[hreflang]')];
}

async function openApp(url: string): Promise<void> {
  window.history.replaceState(null, '', url);
  const lang = localeFromPath(window.location.pathname);
  const container = document.createElement('div');
  document.body.replaceChildren(container);
  root = createRoot(container);
  root.render(
    <ThemeProvider>
      <App i18n={createI18n(lang)} initialLang={lang} />
    </ThemeProvider>,
  );
  // The desktop dropdown is always in the markup; the page may be a lazy chunk.
  await vi.waitFor(() => expect(languageLinks()).toHaveLength(3), { timeout: 5000, interval: 20 });
}

/** The switcher's links, in LANGUAGES order: the desktop dropdown's, or the mobile menu's, opened here. */
async function switcherLinks(menu: Menu): Promise<HTMLAnchorElement[]> {
  if (menu === 'desktop') return languageLinks().slice(0, 3);
  if (languageLinks().length === 3) {
    // Found by its icon: the label is in the page's language.
    document.querySelector('iconify-icon[icon="solar:hamburger-menu-linear"]')?.closest('button')?.click();
  }
  await vi.waitFor(() => expect(languageLinks()).toHaveLength(6), { timeout: 2000, interval: 20 });
  return languageLinks().slice(3);
}

async function languageLink(code: Lang, menu: Menu): Promise<HTMLAnchorElement> {
  const link = (await switcherLinks(menu)).find((candidate) => candidate.hreflang === code);
  if (!link) throw new Error(`no ${menu} link for ${code}`);
  return link;
}

describe('Header language switcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    root?.unmount();
    root = null;
    document.body.replaceChildren();
    localStorage.clear();
  });

  describe.each(['desktop', 'mobile'] as const)('%s', (menu) => {
    it('links to this page in each language, with ?query and #hash', async () => {
      await openApp('/lv/services/devops?x=1#faq');
      const hrefs = (await switcherLinks(menu)).map((link) => link.getAttribute('href'));
      expect(hrefs).toEqual(['/services/devops?x=1#faq', '/lv/services/devops?x=1#faq', '/ru/services/devops?x=1#faq']);
    });

    it('saves the language already shown when the visitor picks it, and stays on the page', async () => {
      // Latvian was saved earlier; the visitor now reads an English page and picks EN.
      localStorage.setItem(LANG_STORAGE_KEY, 'lv');
      await openApp('/services/devops?x=1#faq');
      const historyLength = window.history.length;

      (await languageLink('en', menu)).click();

      await vi.waitFor(() => expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en'));
      expect(currentUrl()).toBe('/services/devops?x=1#faq');
      expect(window.history.length).toBe(historyLength);
      expect(document.documentElement.lang).toBe('en');
    });

    it('does the same on a Latvian page', async () => {
      localStorage.setItem(LANG_STORAGE_KEY, 'ru');
      await openApp('/lv/services');
      const historyLength = window.history.length;

      (await languageLink('lv', menu)).click();

      await vi.waitFor(() => expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('lv'));
      expect(currentUrl()).toBe('/lv/services');
      expect(window.history.length).toBe(historyLength);
    });
  });
});
