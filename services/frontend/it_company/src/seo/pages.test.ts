import { describe, expect, it } from 'vitest';
import { listPages, outputFileFor } from './pages';

describe('outputFileFor', () => {
  it.each([
    ['/', 'index.html'],
    ['/lv', 'lv/index.html'],
    ['/ru', 'ru/index.html'],
    ['/services/devops', 'services/devops/index.html'],
    ['/lv/services/devops', 'lv/services/devops/index.html'],
    ['/services/devops/', 'services/devops/index.html'],
  ])('%s -> %s', (url, file) => {
    expect(outputFileFor(url)).toBe(file);
  });
});

describe('listPages', () => {
  const pages = listPages();

  it('renders every route in every language, plus one 404 page', () => {
    const urls = pages.map((page) => page.url);
    expect(urls).toContain('/');
    expect(urls).toContain('/lv');
    expect(urls).toContain('/ru/contact');
    expect(urls).toContain('/lv/services/devops');
    expect(urls).toContain('/legal/privacy');
    expect(new Set(urls).size).toBe(urls.length);
    expect(pages.filter((page) => page.notFound)).toHaveLength(1);
  });

  it('writes the 404 page to 404.html in English without a canonical', () => {
    const notFound = pages.find((page) => page.notFound);
    expect(notFound).toMatchObject({ outputFile: '404.html', lang: 'en', canonical: null });
    expect(notFound?.head).toContain('noindex, follow');
  });

  it('gives each page its own output file and a head naming its canonical', () => {
    const files = pages.map((page) => page.outputFile);
    expect(new Set(files).size).toBe(files.length);
    for (const page of pages.filter((p) => !p.notFound)) {
      expect(page.canonical).toBe(`https://www.hagroup.lv${page.url === '/' ? '/' : page.url}`);
      expect(page.head).toContain(`<link rel="canonical" href="${page.canonical}" data-seo="canonical">`);
    }
  });
});
