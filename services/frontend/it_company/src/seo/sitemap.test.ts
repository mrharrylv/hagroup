import { describe, expect, it } from 'vitest';
import { buildSitemapXml, sitemapEntries } from './sitemap';

describe('sitemapEntries', () => {
  const entries = sitemapEntries();

  it('lists every indexable page in every language', () => {
    const locs = entries.map((entry) => entry.loc);
    expect(locs).toContain('https://www.hagroup.lv/');
    expect(locs).toContain('https://www.hagroup.lv/lv');
    expect(locs).toContain('https://www.hagroup.lv/ru/services/devops');
    expect(locs).toContain('https://www.hagroup.lv/projects/rokber');
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs.length % 3).toBe(0);
  });

  it('leaves out noindex pages and the duplicate case study', () => {
    const locs = entries.map((entry) => entry.loc).join('\n');
    expect(locs).not.toContain('/legal/');
    expect(locs).not.toContain('/projects/balticgp');
    expect(locs).not.toContain('/404');
  });
});

describe('buildSitemapXml', () => {
  const xml = buildSitemapXml(sitemapEntries());

  it('declares the sitemap and xhtml namespaces', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it('carries the alternates of each URL, including x-default', () => {
    const block = xml.split('<url>').find((chunk) => chunk.includes('<loc>https://www.hagroup.lv/lv/services/devops</loc>'));
    expect(block).toBeDefined();
    expect(block).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://www.hagroup.lv/services/devops"/>');
    expect(block).toContain('<xhtml:link rel="alternate" hreflang="lv" href="https://www.hagroup.lv/lv/services/devops"/>');
    expect(block).toContain('<xhtml:link rel="alternate" hreflang="ru" href="https://www.hagroup.lv/ru/services/devops"/>');
    expect(block).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://www.hagroup.lv/services/devops"/>');
  });

  it('has no lastmod, because a build date is not a content date', () => {
    expect(xml).not.toContain('lastmod');
  });

  it('escapes XML special characters', () => {
    const escaped = buildSitemapXml([{ loc: 'https://example.com/?a=1&b=<2>', alternates: [] }]);
    expect(escaped).toContain('<loc>https://example.com/?a=1&amp;b=&lt;2&gt;</loc>');
  });
});
