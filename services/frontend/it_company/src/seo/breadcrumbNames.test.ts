import { describe, expect, it, vi } from 'vitest';
import { render } from '../entry-server';
import { buildSeo } from './buildSeo';
import { seoContentFor } from './content';
import { listPages } from './pages';

// The prerender renders with the Firebase stand-in (vite.config.ts); so does this.
vi.mock('../lib/firebase', () => import('../lib/firebase.ssr'));

/**
 * Structured data may only mark up what the page shows: every BreadcrumbList
 * name has to be the whole label of a link, button or heading a visitor can
 * read on that page (a nav or footer label, the logo, or its h1), not the
 * keyword-styled <title>. An image counts by its alt text, as it does for
 * the link's accessible name.
 */

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'", nbsp: ' ' };
const LABELLED = ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (_match, name: string) => ENTITIES[name]);
}

function textOf(fragment: string): string {
  const withAlt = fragment.replace(/<img\b[^>]*\salt="([^"]*)"[^>]*>/g, ' $1 ');
  const plain = withAlt.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  return decodeEntities(plain).replace(/\s+/g, ' ').trim();
}

/** The label of every link, button and heading in the rendered page. */
function visibleLabels(html: string): Set<string> {
  const body = html.replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/g, ' ');
  const labels = LABELLED.flatMap((tag) =>
    [...body.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((match) => textOf(match[1])),
  );
  return new Set(labels.filter(Boolean));
}

function crumbNames(path: string, lang: Parameters<typeof seoContentFor>[0]): string[] {
  const seo = buildSeo({ path, lang, content: seoContentFor(lang) });
  const list = seo.jsonLd['@graph'].find((node) => node['@type'] === 'BreadcrumbList');
  return ((list?.itemListElement as { name: string }[] | undefined) ?? []).map((item) => item.name);
}

const PAGES = listPages().filter((page) => !page.notFound);

describe('BreadcrumbList names', () => {
  it.each(PAGES.map((page) => [page.url, page] as const))('%s names only what the page shows', async (_url, page) => {
    const labels = visibleLabels(await render(page.url));
    for (const name of crumbNames(page.path, page.lang)) {
      expect(labels.has(name), `"${name}" is no link, button or heading on ${page.url}`).toBe(true);
    }
  });
});
