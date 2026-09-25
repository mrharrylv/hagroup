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
/** Pages with a form: the contact page, the home page's contact section and the careers page. */
const FORM_ROUTES = ['/contact', '/lv/contact', '/', '/careers', '/ru/careers'];

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

/** Opens a prerendered page; `searchAndHash` is what the visitor's URL adds to it ('?q=1#h'). */
async function bootPrerendered(url: string, theme: 'light' | 'dark', searchAndHash = ''): Promise<BootResult> {
  const appHtml = prerendered.get(url);
  if (appHtml === undefined) throw new Error(`${url} was not prerendered`);

  // The browser has none of the prerender's modules, and none of its resolved lazy pages.
  vi.resetModules();
  window.history.replaceState(null, '', `${url}${searchAndHash}`);
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
    prerendered = await prerenderAll([...new Set([...LAZY_ROUTES, ...FORM_ROUTES])]);
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

  it('adds ?query and #hash to the language links once hydrated, without a mismatch', async () => {
    // The prerender renders every page without them. React 19 keeps the
    // server's value when a hydrated attribute differs, so links rendered
    // with them from the start stayed without them.
    const { original, mutations } = await bootPrerendered('/services/devops', 'dark', '?q=1#h');
    const hrefs = () => [...document.querySelectorAll('header a[hreflang]')].map((link) => link.getAttribute('href'));

    await vi.waitFor(() => {
      expect(hrefs()).toEqual(['/services/devops?q=1#h', '/lv/services/devops?q=1#h', '/ru/services/devops?q=1#h']);
    }, { timeout: 2000, interval: 20 });
    expect(mutations).toEqual([]);
    expect(isHydrated(original)).toBe(true);
    const logged = vi.mocked(console.error).mock.calls.map((args) => args.map(String).join(' '));
    expect(logged.filter((line) => line.includes("didn't match"))).toEqual([]);
  });

  describe('with a form', () => {
    /** Every control a visitor can type into, pick or press. */
    const CONTROLS = 'input, select, textarea, button';

    it.each(FORM_ROUTES)('%s: the prerendered form takes no input and cannot send it by GET', (url) => {
      // Text typed before hydration stays on screen but never reaches React's
      // state, so the form looked filled in and could not be sent.
      const template = document.createElement('template');
      template.innerHTML = prerendered.get(url) ?? '';
      const forms = [...template.content.querySelectorAll('form')];

      expect(forms).toHaveLength(1);
      const [form] = forms;
      expect(form.getAttribute('method')).toBe('post');
      const controls = [...form.querySelectorAll(CONTROLS)];
      expect(controls.length).toBeGreaterThan(3);
      for (const control of controls) {
        expect(control.closest('fieldset')?.hasAttribute('disabled'), control.outerHTML.slice(0, 80)).toBe(true);
      }
    });

    it.each(FORM_ROUTES)('%s: enables the form in place once hydrated', async (url) => {
      const { original, mutations } = await bootPrerendered(url, 'light');

      await vi.waitFor(() => {
        const form = document.querySelector('form');
        expect(form?.querySelector('fieldset')?.hasAttribute('disabled')).toBe(false);
      }, { timeout: 5000, interval: 20 });
      const form = document.querySelector('form');
      expect(form?.getAttribute('method')).toBe('post');
      // The server's fieldset and inputs, adopted by React rather than replaced.
      const fieldset = form?.querySelector('fieldset');
      expect(fieldset && isHydrated(fieldset)).toBe(true);
      expect([...(fieldset?.querySelectorAll('input, textarea') ?? [])].every(isHydrated)).toBe(true);
      expect(mutations).toEqual([]);
      expect(isHydrated(original)).toBe(true);
      const logged = vi.mocked(console.error).mock.calls.map((args) => args.map(String).join(' '));
      expect(logged.filter((line) => /hydrat|didn't match/i.test(line))).toEqual([]);
    });
  });
});
