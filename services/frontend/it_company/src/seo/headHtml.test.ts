import { describe, expect, it } from 'vitest';
import { buildSeo, type PageSeo } from './buildSeo';
import { seoContentFor } from './content';
import { escapeAttribute, headHtml, serializeJsonLd } from './headHtml';
import { headTags } from './headTags';

function seoFor(path: string, lang: 'en' | 'lv' | 'ru' = 'en'): PageSeo {
  return buildSeo({ path, lang, content: seoContentFor(lang) });
}

function hostile(seo: PageSeo): PageSeo {
  return {
    ...seo,
    title: 'Tom & "Jerry" <b>bold</b> \'quoted\'',
    description: 'A description with </script><script>alert(1)</script> & "quotes" inside it for testing.',
    jsonLd: { '@context': 'https://schema.org', '@graph': [{ name: '</script><script>alert(1)</script> & <!--' }] },
  };
}

describe('escapeAttribute', () => {
  it('escapes the characters that can end or break an attribute', () => {
    expect(escapeAttribute(`a&b"c'd<e>f`)).toBe('a&amp;b&quot;c&#39;d&lt;e&gt;f');
  });
});

describe('serializeJsonLd', () => {
  it('cannot close the script element it sits in', () => {
    const json = serializeJsonLd({ name: '</script><!-- & -->' });
    expect(json).not.toMatch(/[<>&]/);
    expect(JSON.parse(json)).toEqual({ name: '</script><!-- & -->' });
  });

  it('escapes the line separators JavaScript parsers choke on', () => {
    const json = serializeJsonLd({ text: `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c` });
    expect(json).toContain('\\u2028');
    expect(json).toContain('\\u2029');
  });
});

describe('headTags', () => {
  it('gives every tag a unique data-seo key', () => {
    const tags = headTags(seoFor('/services/devops'));
    const keys = tags.map((tag) => tag.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const tag of tags) expect(tag.attrs['data-seo']).toBe(tag.key);
  });

  it('carries the page values', () => {
    const seo = seoFor('/services/devops', 'lv');
    const byKey = new Map(headTags(seo).map((tag) => [tag.key, tag]));
    expect(byKey.get('title')?.text).toBe(seo.title);
    expect(byKey.get('description')?.attrs.content).toBe(seo.description);
    expect(byKey.get('robots')?.attrs.content).toBe(seo.robots);
    expect(byKey.get('googlebot')?.attrs.content).toBe(seo.robots);
    expect(byKey.get('canonical')?.attrs.href).toBe(seo.canonical);
    expect(byKey.get('alternate:x-default')?.attrs.href).toBe('https://www.hagroup.lv/services/devops');
    expect(byKey.get('og:url')?.attrs.content).toBe(seo.canonical);
    expect(byKey.get('og:image')?.attrs.content).toBe(seo.image.url);
    expect(byKey.get('og:image:width')?.attrs.content).toBe('1200');
    expect(byKey.get('og:image:height')?.attrs.content).toBe('630');
    expect(byKey.get('og:image:alt')?.attrs.content).toBe(seo.image.alt);
    expect(byKey.get('og:locale')?.attrs.content).toBe('lv_LV');
    expect(byKey.get('og:locale:alternate:ru_RU')?.attrs.content).toBe('ru_RU');
    expect(byKey.get('twitter:card')?.attrs.content).toBe('summary_large_image');
    expect(byKey.get('twitter:image')?.attrs.content).toBe(seo.image.url);
  });

  it('leaves out canonical, alternates and og:url on the 404 page', () => {
    const keys = headTags(seoFor('/missing')).map((tag) => tag.key);
    expect(keys).not.toContain('canonical');
    expect(keys.some((key) => key.startsWith('alternate:'))).toBe(false);
    expect(keys).not.toContain('og:url');
  });
});

describe('headHtml', () => {
  it('renders one title, one canonical, four alternates and one JSON-LD script', () => {
    const html = headHtml(seoFor('/services/devops'));
    expect(html.match(/<title/g)).toHaveLength(1);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html.match(/rel="alternate"/g)).toHaveLength(4);
    expect(html.match(/application\/ld\+json/g)).toHaveLength(1);
    expect(html).toContain('<link rel="canonical" href="https://www.hagroup.lv/services/devops" data-seo="canonical">');
  });

  it('escapes hostile copy in text, attributes and JSON-LD', () => {
    const html = headHtml(hostile(seoFor('/about')));
    expect(html).toContain('<title data-seo="title">Tom &amp; "Jerry" &lt;b&gt;bold&lt;/b&gt; \'quoted\'</title>');
    expect(html).toContain('content="A description with &lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;quotes&quot; inside it for testing."');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain('<!--');
  });

  it('produces JSON-LD that parses back to the page graph', () => {
    const seo = seoFor('/services/devops', 'ru');
    const html = headHtml(seo);
    const match = /<script type="application\/ld\+json" data-seo="jsonld">([\s\S]*?)<\/script>/.exec(html);
    expect(match).not.toBeNull();
    expect(JSON.parse(match?.[1] ?? '')).toEqual(seo.jsonLd);
  });
});
