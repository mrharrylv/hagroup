import { LOCALES } from '../i18n/locales';
import { buildSeo } from './buildSeo';
import { seoContentFor } from './content';
import { escapeXml } from './escape';
import { sitemapPaths } from './routes';
import type { AlternateLink } from './types';

export interface SitemapEntry {
  loc: string;
  alternates: readonly AlternateLink[];
}

/**
 * Every indexable page in every language, with its hreflang alternates.
 * Built from the same buildSeo call as the page head, so the sitemap and the
 * pages can never disagree about a URL.
 */
export function sitemapEntries(): SitemapEntry[] {
  const pathsByLang = LOCALES.map((lang) => ({ lang, content: seoContentFor(lang) }));
  const paths = [...new Set(pathsByLang.flatMap(({ content }) => sitemapPaths(content)))];
  return paths.flatMap((path) =>
    pathsByLang
      .filter(({ content }) => sitemapPaths(content).includes(path))
      .map(({ lang, content }) => buildSeo({ path, lang, content }))
      .filter((seo) => seo.canonical !== null)
      .map((seo) => ({ loc: seo.canonical as string, alternates: seo.alternates })),
  );
}

function urlBlock(entry: SitemapEntry): string {
  const links = entry.alternates.map(
    (alt) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`,
  );
  return ['  <url>', `    <loc>${escapeXml(entry.loc)}</loc>`, ...links, '  </url>'].join('\n');
}

/** sitemap.xml without <lastmod>: a build date is not a content date. */
export function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(urlBlock),
    '</urlset>',
    '',
  ].join('\n');
}
