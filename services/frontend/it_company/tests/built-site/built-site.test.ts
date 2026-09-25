import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Checks the built site as a crawler receives it. Run after `npm run build`.
 * The deploy pipeline runs this too, so a page that would reach S3 without
 * its own title, canonical, hreflang, h1 or structured data stops here.
 */

const DIST = resolve(import.meta.dirname, '../../dist');
const SITE = 'https://www.hagroup.lv';
const HREFLANGS = ['en', 'lv', 'ru', 'x-default'];

function read(relativePath: string): string {
  return readFileSync(join(DIST, relativePath), 'utf8');
}

function pageFiles(): string[] {
  return (readdirSync(DIST, { recursive: true }) as string[])
    .map((file) => file.split('\\').join('/'))
    .filter((file) => file === 'index.html' || file.endsWith('/index.html'))
    .filter((file) => !file.startsWith('assets/'))
    .sort();
}

function urlOf(file: string): string {
  return file === 'index.html' ? '/' : `/${file.slice(0, -'/index.html'.length)}`;
}

function canonicalOf(url: string): string {
  return url === '/' ? `${SITE}/` : `${SITE}${url}`;
}

function attr(html: string, pattern: RegExp): string | null {
  return pattern.exec(html)?.[1] ?? null;
}

function count(html: string, pattern: RegExp): number {
  return (html.match(pattern) ?? []).length;
}

function rootContent(html: string): string {
  const start = html.indexOf('<div id="root"');
  const end = html.lastIndexOf('</body>');
  return start >= 0 && end > start ? html.slice(start, end) : '';
}

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function jsonLdBlocks(html: string): string[] {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

interface Anchor {
  href: string | null;
  hreflang: string | null;
  lang: string | null;
}

function anchors(html: string): Anchor[] {
  return [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => ({
    href: attr(tag, /\shref="([^"]*)"/),
    hreflang: attr(tag, /\shreflang="([^"]*)"/i),
    lang: attr(tag, /\slang="([^"]*)"/),
  }));
}

/** The same page in each language: '/lv/services' -> en '/services', lv '/lv/services', ru '/ru/services'. */
function languageVersions(url: string): Record<string, string> {
  const path = url.replace(/^\/(lv|ru)(?=\/|$)/, '') || '/';
  const prefixed = (prefix: string) => (path === '/' ? prefix : `${prefix}${path}`);
  return { en: path, lv: prefixed('/lv'), ru: prefixed('/ru') };
}

function distPathOf(absoluteUrl: string): string {
  return join(DIST, decodeURIComponent(new URL(absoluteUrl).pathname));
}

const FILES = existsSync(DIST) ? pageFiles() : [];

describe('dist/', () => {
  it('exists and holds the English home and one page per language', () => {
    expect(existsSync(DIST), 'run npm run build first').toBe(true);
    expect(FILES).toContain('index.html');
    expect(FILES).toContain('lv/index.html');
    expect(FILES).toContain('ru/index.html');
    expect(FILES).toContain('services/devops/index.html');
    expect(FILES).toContain('lv/services/devops/index.html');
    expect(FILES).toContain('ru/contact/index.html');
  });

  it('ships the root files the deploy pipeline uploads', () => {
    for (const file of [
      'favicon.ico', 'favicon-96x96.png', 'favicon-192x192.png', 'apple-touch-icon.png', 'icon-512.png',
      'icon-maskable-512.png', 'logo-512.png', 'og-image.png', 'og-image-lv.png', 'og-image-ru.png',
      'site.webmanifest', 'robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', '404.html',
    ]) {
      expect(existsSync(join(DIST, file)), file).toBe(true);
    }
    expect(readdirSync(join(DIST, 'assets')).some((file) => /-[\w-]{8}\.js$/.test(file))).toBe(true);
  });

  it('does not ship the SSR bundle', () => {
    expect(existsSync(resolve(DIST, '../dist-ssr'))).toBe(false);
  });
});

describe.each(FILES)('%s', (file) => {
  const html = read(file);
  const url = urlOf(file);
  const canonical = canonicalOf(url);

  it('has exactly one <title> and a description', () => {
    expect(count(html, /<title[\s>]/g)).toBe(1);
    expect(attr(html, /<meta name="description" content="([^"]+)"/)).toBeTruthy();
  });

  it('is canonical to its own URL', () => {
    expect(count(html, /rel="canonical"/g)).toBe(1);
    expect(attr(html, /<link rel="canonical" href="([^"]+)"/)).toBe(canonical);
  });

  it('lists its language alternates, including itself and x-default', () => {
    const langs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    expect(langs.map((m) => m[1])).toEqual(HREFLANGS);
    expect(langs.map((m) => m[2])).toContain(canonical);
    for (const [, , href] of langs) expect(href.startsWith(`${SITE}/`)).toBe(true);
  });

  it('declares the language of its URL', () => {
    const expected = /^\/(lv|ru)(\/|$)/.exec(url)?.[1] ?? 'en';
    expect(attr(html, /<html[^>]*\slang="([^"]+)"/)).toBe(expected);
  });

  it('has prerendered content with exactly one <h1>', () => {
    const root = rootContent(html);
    expect(attr(html, /<div id="root" data-prerendered="([^"]+)"/)).toBe(url);
    expect(visibleText(root).length).toBeGreaterThan(0);
    expect(count(root, /<h1[\s>]/g)).toBe(1);
    expect(root).not.toContain('data-not-found');
  });

  it('carries every Suspense boundary inline, where it belongs', () => {
    // React outlines a boundary it could not fit in the first chunk: a
    // placeholder in place, the content hidden at the end of the body, and a
    // script to swap them. A crawler without JavaScript gets it out of order.
    const root = rootContent(html);
    expect(root).not.toContain('<template id="B:');
    expect(root).not.toContain('hidden id="S:');
    expect(root).not.toContain('$RC(');
  });

  it('links to itself in every language with real anchors', () => {
    // Crawlers that ignore <link rel="alternate"> still find the other languages.
    const links = anchors(rootContent(html));
    for (const [lang, href] of Object.entries(languageVersions(url))) {
      expect(links, `${lang} ${href}`).toContainEqual({ href, hreflang: lang, lang });
    }
  });

  it('has one JSON-LD block that parses', () => {
    const blocks = jsonLdBlocks(html);
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]) as { '@graph': { '@type': string }[] };
    expect(data['@graph'].some((node) => node['@type'] === 'Organization')).toBe(true);
  });

  it('has an absolute og:image that exists in dist', () => {
    const image = attr(html, /<meta property="og:image" content="([^"]+)"/) ?? '';
    expect(image.startsWith(`${SITE}/`)).toBe(true);
    expect(existsSync(distPathOf(image)), image).toBe(true);
  });
});

describe.each(['index.html', 'lv/index.html', 'ru/index.html'])('%s (home)', (file) => {
  it('has the contact section in the page, before the footer', () => {
    const root = rootContent(existsSync(join(DIST, file)) ? read(file) : '');
    const contact = root.indexOf('<section id="contact"');
    expect(contact).toBeGreaterThan(0);
    expect(contact).toBeLessThan(root.indexOf('<footer'));
  });
});

describe('404.html', () => {
  const html = existsSync(join(DIST, '404.html')) ? read('404.html') : '';

  it('is noindex, has no canonical and renders the not-found page', () => {
    expect(attr(html, /<meta name="robots" content="([^"]+)"/)).toBe('noindex, follow');
    expect(html).not.toContain('rel="canonical"');
    expect(rootContent(html)).toContain('data-not-found');
    expect(count(rootContent(html), /<h1[\s>]/g)).toBe(1);
  });
});

describe('sitemap.xml', () => {
  const xml = existsSync(join(DIST, 'sitemap.xml')) ? read('sitemap.xml') : '';
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it('lists only prerendered, indexable pages that are canonical to themselves', () => {
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const file = path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
      expect(FILES, loc).toContain(file);
      const page = read(file);
      expect(attr(page, /<link rel="canonical" href="([^"]+)"/)).toBe(loc);
      expect(attr(page, /<meta name="robots" content="([^"]+)"/)).toMatch(/^index, follow/);
    }
  });

  it('is referenced from robots.txt', () => {
    expect(read('robots.txt')).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});

describe('llms.txt', () => {
  it('starts with the site name and links absolute URLs that exist', () => {
    const text = read('llms.txt');
    expect(text.startsWith('# HA Group\n')).toBe(true);
    const links = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(10);
    for (const link of links) {
      const path = new URL(link).pathname;
      const file = path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
      expect(FILES, link).toContain(file);
    }
  });
});
