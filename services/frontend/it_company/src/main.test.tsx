// @vitest-environment happy-dom
import { prerenderToNodeStream } from 'react-dom/static';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// The prerender renders with the Firebase stand-in (vite.config.ts); so does this.
vi.mock('./lib/firebase', () => import('./lib/firebase.ssr'));

/**
 * Boots main.tsx the way a browser opens a prerendered page: #root holds the
 * build's markup for the URL, <html> carries the class the inline script in
 * index.html chose, and the route's lazy chunk has not been downloaded yet.
 * React must hydrate that markup in place. If anything above the Suspense
 * boundary in AppRoutes changes while the boundary is still dehydrated, React
 * throws the markup away and shows the fallback instead.
 */

const LAZY_ROUTES = ['/services/devops', '/lv/contact', '/ru/about', '/legal/terms'];

interface BootResult {
  /** The first element the prerender put inside the Suspense boundary. */
  original: Element;
  /** Every node removed from or added to #root, in order. */
  mutations: string[];
}

function isHydrated(node: Element): boolean {
  return Object.keys(node).some((key) => key.startsWith('__reactFiber$'));
}

function describeNode(node: Node): string {
  return node instanceof Element ? `<${node.tagName.toLowerCase()} class="${node.getAttribute('class') ?? ''}">` : `#${node.nodeName}`;
}

/**
 * Every page's markup, as scripts/prerender.mjs gets it, rendered before any
 * browser rendering starts. React's static renderer leaves the last page's
 * context values (the router's among them) set when it finishes, since it
 * expects to be alone in the process; an empty render puts them back to their
 * defaults.
 */
async function prerenderAll(urls: readonly string[]): Promise<Map<string, string>> {
  const { render } = await import('./entry-server');
  const pages = new Map<string, string>();
  for (const url of urls) pages.set(url, await render(url));
  const { prelude } = await prerenderToNodeStream(null);
  for await (const chunk of prelude) void chunk;
  return pages;
}

let prerendered = new Map<string, string>();

async function bootPrerendered(url: string, theme: 'light' | 'dark'): Promise<BootResult> {
  const appHtml = prerendered.get(url);
  if (appHtml === undefined) throw new Error(`${url} was not prerendered`);

  // The browser has none of the prerender's modules, and none of its resolved lazy pages.
  vi.resetModules();
  window.history.replaceState(null, '', url);
  document.documentElement.className = theme;
  document.head.innerHTML = '';
  document.body.innerHTML = `<div id="root" data-prerendered="${url}">${appHtml}</div>`;

  const root = document.getElementById('root');
  const original = root?.querySelector('#root > div');
  if (!root || !original) throw new Error(`${url}: the prerender produced no layout element`);

  const mutations: string[] = [];
  new MutationObserver((records) => {
    for (const record of records) {
      record.removedNodes.forEach((node) => mutations.push(`removed ${describeNode(node)}`));
      record.addedNodes.forEach((node) => mutations.push(`added ${describeNode(node)}`));
    }
  }).observe(root, { childList: true });

  await import('./main');
  // Done once the markup is gone, or once the page has committed: its Seo
  // effect, inside the boundary, has written the head.
  await vi.waitFor(() => {
    expect(!original.isConnected || document.head.querySelector('[data-seo="title"]') !== null).toBe(true);
  }, { timeout: 5000, interval: 20 });

  return { original, mutations };
}

describe('main.tsx on a prerendered lazy route', () => {
  beforeAll(async () => {
    prerendered = await prerenderAll(LAZY_ROUTES);
  });

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe.each(['light', 'dark'] as const)('in the %s theme', (theme) => {
    it.each(LAZY_ROUTES)('hydrates %s in place and never shows the fallback', async (url) => {
      const { original, mutations } = await bootPrerendered(url, theme);

      expect(mutations).toEqual([]);
      expect(original.isConnected).toBe(true);
      expect(isHydrated(original)).toBe(true);
      expect(document.getElementById('root')?.innerHTML).toContain('<!--$-->');
    });
  });

  it('toggles the theme on <html> and in storage without re-rendering the page', async () => {
    const { original, mutations } = await bootPrerendered('/services/devops', 'light');
    const toggle = document.querySelector<HTMLButtonElement>('button[aria-label="Toggle color theme"]');
    expect(toggle).not.toBeNull();

    toggle?.click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(localStorage.getItem('cloudie-theme')).toBe('dark');

    toggle?.click();
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('cloudie-theme')).toBe('light');

    // The sun and moon are both in the markup; the dark: variant picks one.
    expect(toggle?.querySelector('[icon="solar:sun-linear"]')?.getAttribute('class')).toBe('hidden dark:inline-block');
    expect(toggle?.querySelector('[icon="solar:moon-linear"]')?.getAttribute('class')).toBe('dark:hidden');
    expect(mutations).toEqual([]);
    expect(original.isConnected).toBe(true);
  });
});
