import { serializeJsonLd } from './escape';
import type { PageSeo } from './types';

/**
 * The managed <head> tags of a page as data. headHtml renders them for the
 * prerender and applyHeadTags writes them into the live document, so both
 * produce the same tags with the same values. `key` is stored in the tag's
 * data-seo attribute and is unique per page.
 */
export interface HeadTag {
  key: string;
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Readonly<Record<string, string>>;
  text?: string;
}

function meta(kind: 'name' | 'property', name: string, content: string, key = name): HeadTag {
  return { key, tag: 'meta', attrs: { [kind]: name, content, 'data-seo': key } };
}

function link(attrs: Record<string, string>, key: string): HeadTag {
  return { key, tag: 'link', attrs: { ...attrs, 'data-seo': key } };
}

function canonicalTags(seo: PageSeo): HeadTag[] {
  if (!seo.canonical) return [];
  return [
    link({ rel: 'canonical', href: seo.canonical }, 'canonical'),
    ...seo.alternates.map((alt) =>
      link({ rel: 'alternate', hreflang: alt.hreflang, href: alt.href }, `alternate:${alt.hreflang}`),
    ),
  ];
}

function openGraphTags(seo: PageSeo): HeadTag[] {
  const { image } = seo;
  return [
    meta('property', 'og:type', seo.ogType),
    meta('property', 'og:site_name', seo.siteName),
    meta('property', 'og:locale', seo.ogLocale),
    ...seo.ogLocaleAlternates.map((locale) =>
      meta('property', 'og:locale:alternate', locale, `og:locale:alternate:${locale}`),
    ),
    meta('property', 'og:title', seo.title),
    meta('property', 'og:description', seo.description),
    ...(seo.canonical ? [meta('property', 'og:url', seo.canonical)] : []),
    meta('property', 'og:image', image.url),
    ...(image.width ? [meta('property', 'og:image:width', String(image.width))] : []),
    ...(image.height ? [meta('property', 'og:image:height', String(image.height))] : []),
    meta('property', 'og:image:alt', image.alt),
  ];
}

function twitterTags(seo: PageSeo): HeadTag[] {
  return [
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', seo.title),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', seo.image.url),
    meta('name', 'twitter:image:alt', seo.image.alt),
  ];
}

export function headTags(seo: PageSeo): HeadTag[] {
  return [
    { key: 'title', tag: 'title', attrs: { 'data-seo': 'title' }, text: seo.title },
    meta('name', 'description', seo.description),
    meta('name', 'robots', seo.robots),
    meta('name', 'googlebot', seo.robots),
    ...canonicalTags(seo),
    ...openGraphTags(seo),
    ...twitterTags(seo),
    {
      key: 'jsonld',
      tag: 'script',
      attrs: { type: 'application/ld+json', 'data-seo': 'jsonld' },
      text: serializeJsonLd(seo.jsonLd),
    },
  ];
}
