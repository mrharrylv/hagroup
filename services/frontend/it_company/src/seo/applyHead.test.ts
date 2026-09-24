// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { applyHeadTags } from './applyHead';
import { buildSeo } from './buildSeo';
import { seoContentFor } from './content';
import { headHtml } from './headHtml';
import { headTags } from './headTags';

function seoFor(path: string, lang: 'en' | 'lv' | 'ru') {
  return buildSeo({ path, lang, content: seoContentFor(lang) });
}

function managed(): Element[] {
  return Array.from(document.head.querySelectorAll('[data-seo]'));
}

describe('applyHeadTags', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta charset="utf-8"><link rel="icon" href="/favicon.ico">';
  });

  it('writes the same tags the prerender writes', () => {
    const seo = seoFor('/services/devops', 'lv');
    applyHeadTags(document, headTags(seo));
    const fromRuntime = document.head.innerHTML;

    document.head.innerHTML = `<meta charset="utf-8"><link rel="icon" href="/favicon.ico">${headHtml(seo)}`;
    applyHeadTags(document, headTags(seo));
    expect(managed()).toHaveLength(headTags(seo).length);
    expect(document.title).toBe(seo.title);
    expect(fromRuntime).toContain('data-seo="canonical"');
  });

  it('updates tags in place without duplicating them', () => {
    document.head.innerHTML += headHtml(seoFor('/', 'en'));
    const canonicalBefore = document.head.querySelector('link[rel="canonical"]');

    const next = seoFor('/services/devops', 'en');
    applyHeadTags(document, headTags(next));

    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')).toBe(canonicalBefore);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(next.canonical);
    expect(document.head.querySelectorAll('title')).toHaveLength(1);
    expect(document.title).toBe(next.title);
    expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(JSON.parse(document.head.querySelector('script[type="application/ld+json"]')?.textContent ?? '')).toEqual(next.jsonLd);
  });

  it('removes hreflang and canonical tags the new page does not have', () => {
    document.head.innerHTML += headHtml(seoFor('/about', 'ru'));
    expect(document.head.querySelectorAll('link[rel="alternate"]')).toHaveLength(4);

    applyHeadTags(document, headTags(seoFor('/missing', 'en')));
    expect(document.head.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('link[rel="icon"]')).not.toBeNull();
  });

  it('collapses duplicates that were already in the page', () => {
    const seo = seoFor('/contact', 'en');
    document.head.innerHTML += headHtml(seo) + headHtml(seo);
    applyHeadTags(document, headTags(seo));
    expect(managed()).toHaveLength(headTags(seo).length);
  });
});
