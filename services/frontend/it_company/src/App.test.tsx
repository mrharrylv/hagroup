// @vitest-environment happy-dom
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { createI18n } from './i18n';
import { localeFromPath } from './i18n/locales';
import { REROUTE_HIDE_CLASS } from './lib/boot';
import { browserDispatcher, type BrowserDispatcher } from './test-utils/browserEvents';

// The prerender renders with the Firebase stand-in (vite.config.ts); so does this.
vi.mock('./lib/firebase', () => import('./lib/firebase.ssr'));

/**
 * Back and Forward between two language versions of a page. The router is
 * keyed on the language, and its basename is the language prefix: the new
 * URL must reach a router of its own language, never the old one (which
 * renders nothing for it, or the not-found page). popstate is fired the way
 * Chromium fires it (test-utils/browserEvents): listeners in the order they
 * were added, with React's microtasks run between them.
 */

interface Mounted {
  container: HTMLElement;
  /** How many times an element of the not-found page was added. */
  notFoundRenders: () => number;
}

let root: Root | null = null;

function mount(url: string): Mounted {
  window.history.replaceState(null, '', url);
  const container = document.createElement('div');
  container.id = 'root';
  document.body.replaceChildren(container);
  let notFound = 0;
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element && (node.matches('[data-not-found]') || node.querySelector('[data-not-found]'))) notFound += 1;
      });
    }
  }).observe(container, { childList: true, subtree: true });

  // App's effects remove it once they have run, its popstate listener among them.
  document.documentElement.classList.add(REROUTE_HIDE_CLASS);
  const lang = localeFromPath(url);
  root = createRoot(container);
  root.render(
    <StrictMode>
      <ThemeProvider>
        <App i18n={createI18n(lang)} initialLang={lang} />
      </ThemeProvider>
    </StrictMode>,
  );
  return { container, notFoundRenders: () => notFound };
}

function unmount(): void {
  root?.unmount();
  root = null;
  document.body.replaceChildren();
}

/** The page's heading, once the page is shown and App's effects have run. */
async function h1Of(container: HTMLElement): Promise<string> {
  let text = '';
  await vi.waitFor(() => {
    text = container.querySelector('h1')?.textContent ?? '';
    expect(text).not.toBe('');
    expect(document.documentElement.classList.contains(REROUTE_HIDE_CLASS)).toBe(false);
  }, { timeout: 5000, interval: 10 });
  return text;
}

/** The heading a URL shows when it is opened directly. */
async function headingOf(url: string): Promise<string> {
  const { container } = mount(url);
  const text = await h1Of(container);
  unmount();
  return text;
}

let popstate: BrowserDispatcher | null = null;

/** Back or Forward to `url`: the URL changes, then the browser fires popstate. */
async function traverseTo(url: string): Promise<void> {
  window.history.replaceState(null, '', url);
  await popstate?.fire(new PopStateEvent('popstate'));
}

function basenameWarnings(): string[] {
  return vi.mocked(console.warn).mock.calls
    .map((args) => args.map(String).join(' '))
    .filter((line) => line.includes('is not able to match the URL'));
}

describe('App: Back and Forward across a language boundary', { timeout: 20000 }, () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn');
    localStorage.clear();
    popstate = browserDispatcher(window, 'popstate');
  });

  afterEach(() => {
    unmount();
    popstate?.restore();
    popstate = null;
    vi.restoreAllMocks();
  });

  it.each([
    ['/services/devops', '/lv/services/devops'],
    ['/lv/services/devops', '/services/devops'],
    ['/ru/about', '/about'],
    ['/', '/lv'],
    ['/ru', '/'],
  ])('from %s to %s: only the new language renders the new URL', async (from, to) => {
    const expected = await headingOf(to);
    const { container, notFoundRenders } = mount(from);
    await h1Of(container);
    vi.mocked(console.warn).mockClear();

    await traverseTo(to);

    await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe(expected), { timeout: 5000, interval: 10 });
    expect(notFoundRenders()).toBe(0);
    expect(basenameWarnings()).toEqual([]);
    expect(document.documentElement.lang).toBe(localeFromPath(to));
  });

  it('from /ru/nope to /nope: the English router shows the not-found page, without a warning', async () => {
    const { container } = mount('/ru/nope');
    await h1Of(container);
    vi.mocked(console.warn).mockClear();

    await traverseTo('/nope');

    await vi.waitFor(() => expect(document.documentElement.lang).toBe('en'), { timeout: 5000, interval: 10 });
    expect(container.querySelector('[data-not-found]')).not.toBeNull();
    expect(basenameWarnings()).toEqual([]);
  });
});
